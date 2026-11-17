
import { createContext, useContext, useState } from "react";

const messages = {
  en: {
    dashboard: "Dashboard",
    documents: "Documents",
    users: "Users",
    categories: "Categories",
    assistant: "AI Assistant",
    activity: "Activity Logs",
    settings: "Settings",
    welcome: "Welcome to SmartDocs AI",
    recent: "Recent Documents",
    total: "Total Documents",
    storage: "Storage Used",
    active: "Active Users",
    pending: "Pending Review",
    logout: "Logout",
    "documents.title": "Documents",
    "documents.description": "Upload, organize, and manage your documents.",
    "documents.upload": "Upload document",
    "documents.uploadTitle": "Upload document",
    "documents.editTitle": "Edit document",
    "documents.formDescription": "Add document details and select a file.",
    "documents.documentTitle": "Document title",
    "documents.titlePlaceholder": "Enter document title",
    "documents.descriptionPlaceholder": "Write a short description...",
    "documents.selectCategory": "Select category",
    "documents.file": "Document file",
    "documents.dropFile": "Drop your file here or click to browse",
    "documents.keepCurrentFile": "Leave empty to keep the current file.",
    "documents.search": "Search documents...",
    "documents.allCategories": "All categories",
    "documents.total": "Total documents",
    "documents.categories": "Categories",
    "documents.empty": "No documents found.",
    "documents.loadError": "Unable to load documents.",
    "documents.fileRequired": "Please select a file.",
    "documents.invalidFile": "Unsupported file type.",
    "documents.fileTooLarge": "Maximum file size is 20 MB.",
    "documents.created": "Document uploaded successfully.",
    "documents.updated": "Document updated successfully.",
    "documents.deleted": "Document deleted successfully.",
    "documents.saveError": "Unable to save document.",
    "documents.deleteError": "Unable to delete document.",
    "documents.deleteTitle": "Delete document?",
    "documents.deleteConfirm": "This action cannot be undone:",
    "documents.fileError": "Unable to open this file.",
    "common.refresh": "Refresh",
    "common.category": "Category",
    "common.owner": "Uploaded by",
    "common.size": "Size",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.loading": "Loading...",
    "common.cancel": "Cancel",
    "common.delete": "Yes, delete",
    "common.edit": "Edit",
    "common.preview": "Preview",
    "common.download": "Download",
    "common.description": "Description",
    "common.page": "Page",
    "common.total": "total",
    "common.saving": "Saving...",
    "common.saveChanges": "Save changes"
  },
  km: {
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    documents: "ឯកសារ",
    users: "អ្នកប្រើប្រាស់",
    categories: "ប្រភេទឯកសារ",
    assistant: "ជំនួយការ AI",
    activity: "កំណត់ហេតុសកម្មភាព",
    settings: "ការកំណត់",
    welcome: "សូមស្វាគមន៍មកកាន់ SmartDocs AI",
    recent: "ឯកសារថ្មីៗ",
    total: "ចំនួនឯកសារសរុប",
    storage: "ទំហំផ្ទុក",
    active: "អ្នកប្រើប្រាស់សកម្ម",
    pending: "រង់ចាំការពិនិត្យ",
    logout: "ចាកចេញ",
    "documents.title": "ឯកសារ",
    "documents.description": "បង្ហោះ រៀបចំ និងគ្រប់គ្រងឯកសាររបស់អ្នក។",
    "documents.upload": "បង្ហោះឯកសារ",
    "documents.uploadTitle": "បង្ហោះឯកសារ",
    "documents.editTitle": "កែប្រែឯកសារ",
    "documents.formDescription": "បញ្ចូលព័ត៌មានឯកសារ និងជ្រើសរើសឯកសារ។",
    "documents.documentTitle": "ចំណងជើងឯកសារ",
    "documents.titlePlaceholder": "បញ្ចូលចំណងជើងឯកសារ",
    "documents.descriptionPlaceholder": "សរសេរការពិពណ៌នាខ្លី...",
    "documents.selectCategory": "ជ្រើសរើសប្រភេទ",
    "documents.file": "ឯកសារ",
    "documents.dropFile": "ទម្លាក់ឯកសារនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស",
    "documents.keepCurrentFile": "ទុកទទេដើម្បីរក្សាឯកសារបច្ចុប្បន្ន។",
    "documents.search": "ស្វែងរកឯកសារ...",
    "documents.allCategories": "គ្រប់ប្រភេទ",
    "documents.total": "ឯកសារសរុប",
    "documents.categories": "ប្រភេទឯកសារ",
    "documents.empty": "រកមិនឃើញឯកសារទេ។",
    "documents.loadError": "មិនអាចទាញយកឯកសារបានទេ។",
    "documents.fileRequired": "សូមជ្រើសរើសឯកសារ។",
    "documents.invalidFile": "ប្រភេទឯកសារមិនត្រឹមត្រូវទេ។",
    "documents.fileTooLarge": "ទំហំឯកសារអតិបរមា ២០ MB។",
    "documents.created": "បានបង្ហោះឯកសារដោយជោគជ័យ។",
    "documents.updated": "បានកែប្រែឯកសារដោយជោគជ័យ។",
    "documents.deleted": "បានលុបឯកសារដោយជោគជ័យ។",
    "documents.saveError": "មិនអាចរក្សាទុកឯកសារបានទេ។",
    "documents.deleteError": "មិនអាចលុបឯកសារបានទេ។",
    "documents.deleteTitle": "លុបឯកសារឬ?",
    "documents.deleteConfirm": "សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ៖",
    "documents.fileError": "មិនអាចបើកឯកសារនេះបានទេ។",
    "common.refresh": "ធ្វើបច្ចុប្បន្នភាព",
    "common.category": "ប្រភេទ",
    "common.owner": "អ្នកបង្ហោះ",
    "common.size": "ទំហំ",
    "common.status": "ស្ថានភាព",
    "common.actions": "សកម្មភាព",
    "common.loading": "កំពុងផ្ទុក...",
    "common.cancel": "បោះបង់",
    "common.delete": "បាទ/ចាស លុប",
    "common.edit": "កែប្រែ",
    "common.preview": "មើលជាមុន",
    "common.download": "ទាញយក",
    "common.description": "ការពិពណ៌នា",
    "common.page": "ទំព័រ",
    "common.total": "សរុប",
    "common.saving": "កំពុងរក្សាទុក...",
    "common.saveChanges": "រក្សាទុកការផ្លាស់ប្តូរ"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved && messages[saved] ? saved : "en";
  });

  function changeLanguage(value) {
    if (!messages[value]) return;
    setLanguage(value);
    localStorage.setItem("language", value);
  }

  function t(key) {
    return messages[language]?.[key] ?? messages.en[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

