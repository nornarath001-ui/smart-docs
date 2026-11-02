
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import ThemeToggle from "../common/ThemeToggle";
import LanguageSwitcher from "../common/LanguageSwitcher";
  
export default function Header() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  async function handleLogout() {
    await signOut();
    window.location.assign("/login");
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
        <button onClick={handleLogout} className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{t("logout")}</button>
      </div>
    </header>
  );
}
