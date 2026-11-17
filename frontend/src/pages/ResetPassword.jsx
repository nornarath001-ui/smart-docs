
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await resetPassword({
        token: params.get("token"),
        email: params.get("email"),
        password,
        password_confirmation: confirmation
      });
      setMessage(result.message || "Password reset successfully.");
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password. Request a new link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-indigo-700">Create a new password</h1>
        <p className="text-sm text-slate-500">Choose a new password for your SmartDocs account.</p>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-lg border p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <input type="password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border p-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Updating..." : "Reset password"}
        </button>
        <Link to="/login" className="block text-center text-sm text-indigo-600">Back to login</Link>
      </form>
    </div>
  );
}
