"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AlertLevel, TrafficAlert } from "@/lib/trafficAlerts";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

const LEVELS: { value: AlertLevel; label: string }[] = [
  { value: "info", label: "一般" },
  { value: "warn", label: "警示" },
  { value: "block", label: "封閉" },
];

export default function TrafficAlertForm({ alert }: { alert?: TrafficAlert }) {
  const router = useRouter();
  const isEdit = Boolean(alert);

  const [level, setLevel] = useState<AlertLevel>(alert?.level ?? "info");
  const [title, setTitle] = useState(alert?.title ?? "");
  const [desc, setDesc] = useState(alert?.desc ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(isEdit ? `/api/admin/traffic-alerts/${alert!.id}` : "/api/admin/traffic-alerts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, title, desc }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "儲存失敗");
        return;
      }
      if (isEdit) {
        setMessage("已儲存");
        router.refresh();
      } else {
        router.push("/admin/traffic-alerts");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!alert) return;
    if (!confirm(`確定要刪除「${alert.title}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/traffic-alerts/${alert.id}`, { method: "DELETE" });
      router.push("/admin/traffic-alerts");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯公告" : "新增公告"}
        </h1>
        {isEdit ? (
          <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
            刪除
          </button>
        ) : null}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        等級
      </label>
      <div className="flex gap-2 mb-4">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setLevel(l.value)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
            style={{ background: level === l.value ? "#a06a3a" : "#f4eee4", color: level === l.value ? "#fff" : "#2f261f", border: "1px solid #dfd1bf" }}
          >
            {l.label}
          </button>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標題
      </label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={80} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        內容
      </label>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={300} required className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]" style={inputStyle} />

      {error ? (
        <div className="text-[12.5px] mb-4" style={{ color: "#b0503f" }}>
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="text-[12.5px] mb-4" style={{ color: "#4a7594" }}>
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
        style={{ background: "#a06a3a", color: "#fff", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
