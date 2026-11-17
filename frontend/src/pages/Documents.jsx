
import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud, FileText, Search, Download, Eye, Pencil, Trash2,
  X, RefreshCw, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import { notify } from "../utils/alerts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const emptyForm = { title: "", description: "", category_id: "", file: null };
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILE = /\.(pdf|doc|docx|txt|xls|xlsx|csv|png|jpe?g)$/i;

export default function Documents() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const fileInput = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const tr = useCallback((key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  }, [t]);

  const permissions = Array.isArray(user?.permissions)
    ? user.permissions.map(permission =>
        typeof permission === "string" ? permission : permission?.name
      )
    : [];

  const canCreate = permissions.includes("documents.create");
  const canUpdate = permissions.includes("documents.update");
  const canDelete = permissions.includes("documents.delete");

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    return bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/documents", {
        params: {
          search,
          category_id: categoryFilter || undefined,
          page
        }
      });

      setDocuments(data.documents?.data || []);
      setCategories(data.categories || []);
      setPagination({
        current_page: data.documents?.current_page || 1,
        last_page: data.documents?.last_page || 1,
        total: data.documents?.total || 0
      });
    } catch (error) {
      notify.error(
        error.response?.data?.message ||
        tr("documents.loadError", "Unable to load documents.")
      );
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page, tr]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
    setDragging(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  }

  function openCreate() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(item) {
    if (!item) return;
    resetForm();
    setEditing(item);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category_id: item.category_id ? String(item.category_id) : "",
      file: null
    });
    setModalOpen(true);
  }

  function selectFile(file) {
    if (!file) return;

    if (!ALLOWED_FILE.test(file.name)) {
      notify.error(tr("documents.invalidFile", "Unsupported file type."));
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      notify.error(tr("documents.fileTooLarge", "Maximum file size is 20 MB."));
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    setForm(current => ({
      ...current,
      file,
      title: current.title || file.name.replace(/\.[^.]+$/, "")
    }));
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (saving) return;
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      notify.error(tr("documents.titleRequired", "Please enter a document title."));
      return;
    }

    if (!editing && !form.file) {
      notify.error(tr("documents.fileRequired", "Please select a file."));
      return;
    }

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("description", form.description || "");

    if (form.category_id) {
      body.append("category_id", form.category_id);
    }

    if (form.file) {
      body.append("file", form.file);
    }

    setSaving(true);

    try {
      if (editing) {
        body.append("_method", "PUT");
        await api.post(`/documents/${editing.id}`, body);
        notify.success(tr("documents.updated", "Document updated successfully."));
      } else {
        await api.post("/documents", body);
        notify.success(tr("documents.created", "Document uploaded successfully."));
      }

      setModalOpen(false);
      resetForm();

      if (page !== 1) {
        setPage(1);
      } else {
        await fetchDocuments();
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join(" ")
        : error.response?.data?.message;

      notify.error(
        message || tr("documents.saveError", "Unable to save document.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const result = await Swal.fire({
      title: tr("documents.deleteTitle", "Delete document?"),
      text: `${tr("documents.deleteConfirm", "This action cannot be undone:")} ${item.title}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: tr("common.delete", "Yes, delete"),
      cancelButtonText: tr("common.cancel", "Cancel"),
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/documents/${item.id}`);
      notify.success(tr("documents.deleted", "Document deleted successfully."));

      if (documents.length === 1 && page > 1) {
        setPage(current => current - 1);
      } else {
        await fetchDocuments();
      }
    } catch (error) {
      notify.error(
        error.response?.data?.message ||
        tr("documents.deleteError", "Unable to delete document.")
      );
    }
  }

  async function openFile(item, action) {
    let previewWindow = null;

    try {
      if (action === "preview") {
        previewWindow = window.open("about:blank", "_blank");
        if (!previewWindow) {
          notify.error("Please allow pop-ups to preview documents.");
          return;
        }
      }

      const response = await api.get(`/documents/${item.id}/${action}`, {
        responseType: "blob"
      });

      const url = URL.createObjectURL(response.data);

      if (action === "preview") {
        previewWindow.location.href = url;
      } else {
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = item.original_name || item.title;
        globalThis.document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      notify.error(
        error.response?.data?.message ||
        "Unable to open this file."
      );
    }
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {tr("documents.title", "Documents")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tr("documents.description", "Upload, organize, and manage your documents.")}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {tr("common.refresh", "Refresh")}
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <UploadCloud size={17} />
              {tr("documents.upload", "Upload document")}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            {tr("documents.total", "Total documents")}
          </p>
          <p className="mt-2 text-3xl font-bold">{pagination.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            {tr("documents.categories", "Categories")}
          </p>
          <p className="mt-2 text-3xl font-bold">{categories.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={tr("documents.search", "Search documents...")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={event => {
            setCategoryFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">{tr("documents.allCategories", "All categories")}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-5 py-4">{tr("documents.file", "Document")}</th>
                <th className="px-5 py-4">{tr("common.category", "Category")}</th>
                <th className="px-5 py-4">{tr("common.owner", "Uploaded by")}</th>
                <th className="px-5 py-4">{tr("common.size", "Size")}</th>
                <th className="px-5 py-4">{tr("common.status", "Status")}</th>
                <th className="px-5 py-4 text-right">{tr("common.actions", "Actions")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    {tr("common.loading", "Loading...")}
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500">
                    {tr("documents.empty", "No documents found.")}
                  </td>
                </tr>
              ) : documents.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="max-w-56 truncate text-xs text-slate-500">
                          {item.original_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {item.category?.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {item.user?.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {formatSize(item.file_size)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title={tr("common.preview", "Preview")}
                        onClick={() => openFile(item, "preview")}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        title={tr("common.download", "Download")}
                        onClick={() => openFile(item, "download")}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Download size={17} />
                      </button>

                      {canUpdate && (
                        <button
                          type="button"
                          title={tr("common.edit", "Edit")}
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        >
                          <Pencil size={17} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          title={tr("common.delete", "Delete")}
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">
            {tr("common.page", "Page")} {pagination.current_page} / {pagination.last_page}
            {" · "}{pagination.total} {tr("common.total", "total")}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(current => current - 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage(current => current + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <form onSubmit={handleSubmit} className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold">
                  {editing
                    ? tr("documents.editTitle", "Edit document")
                    : tr("documents.uploadTitle", "Upload document")}
                </h2>
                <p className="text-xs text-slate-500">
                  {tr("documents.formDescription", "Add document details and select a file.")}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {tr("documents.documentTitle", "Document title")} *
                </label>
                <input
                  required
                  maxLength={255}
                  value={form.title}
                  onChange={event => setForm(current => ({
                    ...current,
                    title: event.target.value
                  }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder={tr("documents.titlePlaceholder", "Enter document title")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {tr("common.category", "Category")}
                </label>
                <select
                  value={form.category_id}
                  onChange={event => setForm(current => ({
                    ...current,
                    category_id: event.target.value
                  }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">
                    {tr("documents.selectCategory", "Select category")}
                  </option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {tr("common.description", "Description")}
                </label>
                <textarea
                  rows={3}
                  maxLength={5000}
                  value={form.description}
                  onChange={event => setForm(current => ({
                    ...current,
                    description: event.target.value
                  }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                  placeholder={tr("documents.descriptionPlaceholder", "Write a short description...")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {tr("documents.file", "Document file")} {!editing && "*"}
                </label>

                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={event => selectFile(event.target.files?.[0])}
                />

                <div
                  onDragOver={event => {
                    event.preventDefault();
                    if (!saving) setDragging(true);
                  }}
                  onDragLeave={event => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setDragging(false);
                    }
                  }}
                  onDrop={handleDrop}
                  onClick={() => !saving && fileInput.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                    dragging
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                      : "border-slate-300 hover:border-indigo-400 dark:border-slate-700 dark:hover:border-indigo-500"
                  } ${saving ? "pointer-events-none opacity-60" : ""}`}
                >
                  <UploadCloud className="mx-auto mb-3 text-indigo-500" size={36} />

                  <p className="text-sm font-semibold">
                    {tr("documents.dropFile", "Drop your file here or click to browse")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PDF, DOC, DOCX, TXT, XLS, XLSX, CSV, JPG, PNG · Max 20 MB
                  </p>

                  {form.file && (
                    <p className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {form.file.name} · {formatSize(form.file.size)}
                    </p>
                  )}

                  {!form.file && editing && (
                    <p className="mt-3 text-xs text-slate-500">
                      {tr("documents.keepCurrentFile", "Leave empty to keep the current file.")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:opacity-50 dark:border-slate-700"
              >
                {tr("common.cancel", "Cancel")}
              </button>

              <button
                disabled={saving}
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {tr("common.saving", "Saving...")}
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    {editing
                      ? tr("common.saveChanges", "Save changes")
                      : tr("documents.upload", "Upload document")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
