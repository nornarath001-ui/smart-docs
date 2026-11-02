
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Files, Users, Folder, Sparkles, Activity, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const menus = [
  { path: "/dashboard", key: "dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "Staff"] },
  { path: "/documents", key: "documents", icon: Files, roles: ["Admin", "Manager", "Staff"] },
  { path: "/users", key: "users", icon: Users, roles: ["Admin", "Manager"] },
  { path: "/categories", key: "categories", icon: Folder, roles: ["Admin", "Manager"] },
  { path: "/assistant", key: "assistant", icon: Sparkles, roles: ["Admin", "Manager", "Staff"] },
  { path: "/activity", key: "activity", icon: Activity, roles: ["Admin", "Manager"] },
  { path: "/settings", key: "settings", icon: Settings, roles: ["Admin"] }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b p-5 dark:border-slate-800">
        <h1 className="text-xl font-extrabold text-indigo-600">SmartDocs AI</h1>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {menus.filter((menu) => menu.roles.some((role) => user?.roles?.includes(role))).map(({ path, key, icon: Icon }) => (
          <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${isActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`}>
            <Icon size={19} />{t(key)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4 text-xs text-slate-400 dark:border-slate-800">SmartDocs AI Workspace</div>
    </aside>
  );
}
