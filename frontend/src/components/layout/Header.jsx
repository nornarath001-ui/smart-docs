import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import ThemeToggle from "../common/ThemeToggle";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Swal from "sweetalert2";

export default function Header() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  async function handleLogout() {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out of SmartDocs AI?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) return;

    try {
      await signOut();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: error.message || "Please try again."
      });
    }
  }

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div>
        <p className="font-semibold">{user?.name}</p>
        <p className="text-xs text-slate-500">{user?.roles?.join(", ")}</p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
        >
          {t("logout")}
        </button>
      </div>
    </header>
  );
}