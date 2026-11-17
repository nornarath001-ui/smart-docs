
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Files, Users, Folder, Sparkles, Activity, Settings, ChevronRight, ShieldCheck } from "lucide-react";
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
  const userRoles = Array.isArray(user?.roles) ? user.roles.map(role => typeof role === "string" ? role : role.name) : [];
  const visibleMenus = menus.filter(menu => menu.roles.some(role => userRoles.includes(role)));

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white font-khmer dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-6 dark:border-slate-800">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
          <Files size={23} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            SmartDocs <span className="text-indigo-600">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400">Document Management System</p>
        </div>
      </div>

      <div className="px-5 pb-3 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
        {visibleMenus.map(({ path, key, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-indigo-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                  {t(key)}
                </span>
                {isActive && <ChevronRight size={16} className="text-indigo-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name || "User"}</p>
            <p className="truncate text-xs text-slate-500">{userRoles.join(", ") || "Workspace member"}</p>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-400">© {new Date().getFullYear()} SmartDocs AI</p>
      </div>
    </aside>
  );
}
