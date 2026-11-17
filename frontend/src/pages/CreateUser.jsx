
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, LockKeyhole, UserRound } from "lucide-react";
import api from "../services/api";

export default function CreateUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/admin/users", form);
      setSuccess(data.message || "User created successfully.");
      setForm({ name: "", email: "", password: "", role: "Staff" });
      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        Object.values(errors || {}).flat().join(" ") ||
        err.response?.data?.message ||
        "Unable to create user."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-khmer">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Account</h1>
        <p className="mt-1 text-sm text-slate-500">Create a workspace user and assign a role.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</div>}
        {success && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{success}</div>}

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-slate-200">Full name</label>
          <div className="relative">
            <UserRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Enter full name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-slate-200">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="name@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-slate-200">Password</label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="Minimum 8 characters" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium dark:text-slate-200">Assign user role</label>
          <select name="role" value={form.role} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">Choose the permissions this account should receive.</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button type="button" onClick={() => navigate("/users")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            <UserPlus size={17} />
            {loading ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}
