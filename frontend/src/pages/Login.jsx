
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Files, LockKeyhole, Mail, UserRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { forgotPassword, register } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function switchMode(value) {
    setMode(value);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmation("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "register" && password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password, remember);
        navigate("/dashboard", { replace: true });
      } else if (mode === "register") {
        const result = await register(name, email, password, confirmation);
        setMessage(result.message || "Account created. Please sign in.");
        setMode("login");
        setPassword("");
        setConfirmation("");
      } else {
        const result = await forgotPassword(email);
        setMessage(result.message || "If your account exists, a reset link has been sent.");
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      const validationMessage = errors
        ? Object.values(errors).flat().join(" ")
        : "";
      setError(
        validationMessage ||
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login"
    ? "Welcome back"
    : mode === "register"
      ? "Create your account"
      : "Reset your password";

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4 font-khmer dark:bg-slate-950">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-br from-indigo-700 to-violet-600 px-8 py-8 text-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Files size={27} />
          </div>
          <h1 className="text-2xl font-bold">SmartDocs AI</h1>
          <p className="mt-2 text-sm text-indigo-100">Intelligent document management workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-7 sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "login"
                ? "Sign in to continue to your workspace."
                : mode === "register"
                  ? "Register as a new workspace member."
                  : "Enter your email to receive a password reset link."}
            </p>
          </div>

          {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">{error}</div>}
          {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">{message}</div>}

          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your full name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Enter password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
              <input type="password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" placeholder="Confirm your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                Remember me
              </label>
              <button type="button" onClick={() => switchMode("forgot")} className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none">
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
          </button>

          {mode === "forgot" ? (
            <button type="button" onClick={() => switchMode("login")} className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300">
              <ArrowLeft size={16} /> Back to sign in
            </button>
          ) : (
            <p className="text-center text-sm text-slate-500">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="ml-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          )}
        </form>

        <div className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
          © {new Date().getFullYear()} SmartDocs AI · Secure workspace
        </div>
      </div>
    </div>
  );
}
