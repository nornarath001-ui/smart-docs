
import { useEffect, useState } from "react";
import { Files, Users, HardDrive, Clock, FileText, Sparkles } from "lucide-react";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { name: "Total Documents", value: data?.stats?.documents ?? 0, icon: Files },
    { name: "Storage Used", value: data?.stats?.storage ?? "0 MB", icon: HardDrive },
    { name: "Active Users", value: data?.stats?.users ?? 0, icon: Users },
    { name: "Pending Review", value: data?.stats?.pending ?? 0, icon: Clock }
  ];

  if (loading) return <p className="p-8 text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-7">
      <section className="rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 p-7 text-white">
        <p className="mb-2 flex items-center gap-2 text-sm text-indigo-100">
          <Sparkles size={16} /> SMART DOCUMENT WORKSPACE
        </p>
        <h1 className="text-2xl font-bold md:text-3xl">Welcome to SmartDocs AI</h1>
        <p className="mt-2 text-sm text-indigo-100">Manage your documents, users and workspace.</p>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{item.name}</span>
              <item.icon size={21} className="text-indigo-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Recent documents</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {(data?.recent_documents || []).map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <FileText className="text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.owner || "Unknown owner"}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">{doc.status}</span>
            </div>
          ))}
          {!data?.recent_documents?.length && (
            <p className="py-5 text-sm text-slate-400">No recent documents found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
