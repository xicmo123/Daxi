"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Amenity, AmenityCategory } from "@/lib/amenities";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

const CATEGORIES: AmenityCategory[] = ["公廁", "飲水機"];

export default function AmenityForm({ amenity }: { amenity?: Amenity }) {
  const router = useRouter();
  const isEdit = Boolean(amenity);

  const [name, setName] = useState(amenity?.name ?? "");
  const [category, setCategory] = useState<AmenityCategory>(amenity?.category ?? "公廁");
  const [lat, setLat] = useState(amenity ? String(amenity.lat) : "24.884952");
  const [lng, setLng] = useState(amenity ? String(amenity.lng) : "121.288238");
  const [note, setNote] = useState(amenity?.note ?? "");

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
      const res = await fetch(isEdit ? `/api/admin/amenities/${amenity!.id}` : "/api/admin/amenities", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, lat: Number(lat), lng: Number(lng), note: note || undefined }),
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
        router.push("/admin/amenities");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!amenity) return;
    if (!confirm(`確定要刪除「${amenity.name}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/amenities/${amenity.id}`, { method: "DELETE" });
      router.push("/admin/amenities");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯設施" : "新增設施"}
        </h1>
        {isEdit ? (
          <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
            刪除
          </button>
        ) : null}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        類別
      </label>
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
            style={{ background: category === c ? "#a06a3a" : "#f4eee4", color: category === c ? "#fff" : "#2f261f", border: "1px solid #dfd1bf" }}
          >
            {c === "公廁" ? "🚻 公廁" : "🚰 飲水機"}
          </button>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        名稱
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            緯度 lat
          </label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} required inputMode="decimal" className="w-full rounded-lg px-3 py-2.5 text-[13px]" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            經度 lng
          </label>
          <input value={lng} onChange={(e) => setLng(e.target.value)} required inputMode="decimal" className="w-full rounded-lg px-3 py-2.5 text-[13px]" style={inputStyle} />
        </div>
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        備註（選填，例如「老街入口旁」）
      </label>
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]" style={inputStyle} />

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
