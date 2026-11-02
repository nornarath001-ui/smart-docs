
import { createContext, useContext, useState } from "react";

const messages = {
  en: {
    dashboard: "Dashboard", documents: "Documents", users: "Users",
    categories: "Categories", assistant: "AI Assistant",
    activity: "Activity Logs", settings: "Settings", logout: "Sign out",
    welcome: "Welcome to SmartDocs AI", recent: "Recent documents",
    total: "Total Documents", storage: "Storage Used",
    active: "Active Users", pending: "Pending Review"
  },
  km: {
    dashboard: "ផ្ទាំងគ្រប់គ្រង", documents: "ឯកសារ",
    users: "អ្នកប្រើប្រាស់", categories: "ប្រភេទឯកសារ",
    assistant: "ជំនួយការ AI", activity: "កំណត់ហេតុសកម្មភាព",
    settings: "ការកំណត់", logout: "ចាកចេញ",
    welcome: "សូមស្វាគមន៍មកកាន់ SmartDocs AI",
    recent: "ឯកសារថ្មីៗ", total: "ឯកសារសរុប",
    storage: "ទំហំផ្ទុក", active: "អ្នកប្រើប្រាស់សកម្ម",
    pending: "រង់ចាំការពិនិត្យ"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");

  function changeLanguage(value) {
    setLanguage(value);
    localStorage.setItem("language", value);
  }

  function t(key) {
    return messages[language]?.[key] || messages.en[key] || key;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
