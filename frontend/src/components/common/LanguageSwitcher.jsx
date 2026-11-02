
import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 dark:border-slate-700">
      <Languages size={17} />
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent py-2 text-sm outline-none dark:text-white"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="km">ខ្មែរ</option>
      </select>
    </label>
  );
}
