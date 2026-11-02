
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
      © {new Date().getFullYear()} SmartDocs AI. All rights reserved.
    </footer>
  );
}
