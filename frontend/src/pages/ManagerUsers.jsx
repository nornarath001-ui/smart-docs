import { useEffect, useState } from "react";
import { Search, RefreshCw, Users, ChevronLeft, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function ManagerUsers() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const tr = (key, fallback) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };

  const canViewUsers = user?.permissions?.includes("users.view");

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await api.get("/manager/users", {
        params: { search, page }
      });
      setUsers(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0
      });
    } catch (error) {
      setUsers([]);
      await Swal.fire({
        icon: "error",
        title: tr("common.error", "Error"),
        text: error.response?.data?.message || tr("managerUsers.loadError", "Unable to load users.")
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canViewUsers) fetchUsers();
    else setLoading(false);
  }, [canViewUsers, search, page]);

  if (!canViewUsers) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900 dark:bg-slate-900">
        <ShieldCheck className="mx-auto mb-3 text-rose-500" size={36} />
        <h2 className="font-semibold text-slate-900 dark:text-white">
          {tr("common.accessDenied", "Access denied")}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {tr("managerUsers.noPermission", "You do not have permission to view users.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600 dark:text-indigo-400" size={25} />
            <h1 className="text-2xl font-bold">
              {tr("managerUsers.title", "Manage Users")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {tr("managerUsers.description", "View users and their assigned roles.")}
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {tr("common.refresh", "Refresh")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{tr("managerUsers.totalUsers", "Total Users")}</p>
              <p className="mt-2 text-3xl font-bold">{pagination.total}</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Users size={24} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{tr("managerUsers.currentPage", "Users on this page")}</p>
              <p className="mt-2 text-3xl font-bold">{users.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <UserRound size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={tr("managerUsers.search", "Search name or email...")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-indigo-950"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-5 py-4">{tr("common.user", "User")}</th>
                <th className="px-5 py-4">{tr("common.email", "Email")}</th>
                <th className="px-5 py-4">{tr("common.role", "Role")}</th>
                <th className="px-5 py-4">{tr("common.status", "Status")}</th>
                <th className="px-5 py-4">{tr("common.createdAt", "Created")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">{tr("common.loading", "Loading users...")}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">{tr("managerUsers.empty", "No users found.")}</td></tr>
              ) : users.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-5 py-4 font-medium">{item.name}</td>
                  <td className="px-5 py-4 text-slate-500">{item.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.roles?.length ? item.roles.map((role) => (
                        <span key={role.id} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {role.name}
                        </span>
                      )) : <span className="text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>
                      {item.is_active ? tr("common.active", "Active") : tr("common.inactive", "Inactive")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <p className="text-sm text-slate-500">
            {tr("managerUsers.page", "Page")} {pagination.current_page} {tr("common.of", "of")} {pagination.last_page} · {pagination.total} {tr("common.total", "total")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              <ChevronLeft size={16} /> {tr("common.previous", "Previous")}
            </button>
            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              {tr("common.next", "Next")} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}