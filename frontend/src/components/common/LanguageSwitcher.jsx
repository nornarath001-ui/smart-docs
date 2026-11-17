import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages size={18} className="text-slate-500" />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <option value="en">English</option>
        <option value="km">ខ្មែរ</option>
      </select>
    </div>
  );
}