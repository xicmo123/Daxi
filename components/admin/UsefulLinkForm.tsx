"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UsefulLink } from "@/lib/usefulLinks";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

export default function UsefulLinkForm({ link }: { link?: UsefulLink }) {
  const router = useRouter();
  const isEdit = Boolean(link);

  const [label, setLabel] = useState(link?.label ?? "");
  const [note, setNote] = useState(link?.note ?? "");
  const [href, setHref] = useState(link?.href ?? "https://www.daxi.tycg.gov.tw");

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
      const res = await fetch(isEdit ? `/api/admin/useful-links/${link!.id}` : "/api/admin/useful-links", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, note, href }),
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
        router.push("/admin/useful-links");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!link) return;
    if (!confirm(`確定要刪除「${link.label}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/useful-links/${link.id}`, { method: "DELETE" });
      router.push("/admin/useful-links");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯連結" : "新增連結"}
        </h1>
        {isEdit ? (
          <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
            刪除
          </button>
        ) : null}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標題
      </label>
      <input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={40} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        說明
      </label>
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        連結網址
      </label>
      <input value={href} onChange={(e) => setHref(e.target.value)} required className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]" style={inputStyle} />

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
        style={{ background: "#4a7594", color: "#fff", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
