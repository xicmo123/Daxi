"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RouteStop, WalkingRoute } from "@/lib/routesData";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

type StopDraft = { name: string; lat: string; lng: string };

function toDrafts(stops: RouteStop[]): StopDraft[] {
  return stops.map((s) => ({ name: s.name, lat: String(s.lat), lng: String(s.lng) }));
}

export default function RouteForm({ route }: { route?: WalkingRoute }) {
  const router = useRouter();
  const isEdit = Boolean(route);

  const [name, setName] = useState(route?.name ?? "");
  const [totalDistanceMeters, setTotalDistanceMeters] = useState(route ? String(route.totalDistanceMeters) : "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(route ? String(route.estimatedMinutes) : "");
  const [isWheelchairFriendly, setIsWheelchairFriendly] = useState(route?.isWheelchairFriendly ?? false);
  const [stops, setStops] = useState<StopDraft[]>(route ? toDrafts(route.stops) : [
    { name: "", lat: "", lng: "" },
    { name: "", lat: "", lng: "" },
  ]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStop = (i: number, field: keyof StopDraft, value: string) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const addStop = () => setStops((prev) => [...prev, { name: "", lat: "", lng: "" }]);
  const removeStop = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(isEdit ? `/api/admin/routes/${route!.id}` : "/api/admin/routes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          totalDistanceMeters: Number(totalDistanceMeters),
          estimatedMinutes: Number(estimatedMinutes),
          isWheelchairFriendly,
          stops: stops.map((s) => ({ name: s.name, lat: Number(s.lat), lng: Number(s.lng) })),
        }),
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
        router.push("/admin/routes");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!route) return;
    if (!confirm(`確定要刪除「${route.name}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/routes/${route.id}`, { method: "DELETE" });
      router.push("/admin/routes");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯路線" : "新增路線"}
        </h1>
        {isEdit ? (
          <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
            刪除
          </button>
        ) : null}
      </div>

      <label className="flex items-center gap-2 mb-4 text-[13px]" style={{ color: "#2f261f" }}>
        <input type="checkbox" checked={isWheelchairFriendly} onChange={(e) => setIsWheelchairFriendly(e.target.checked)} />
        無障礙／推車友善路線
      </label>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        路線名稱
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            總長度（公尺）
          </label>
          <input value={totalDistanceMeters} onChange={(e) => setTotalDistanceMeters(e.target.value)} required inputMode="numeric" className="w-full rounded-lg px-3 py-2.5 text-[13px]" style={inputStyle} />
        </div>
        <div>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            預估時間（分鐘）
          </label>
          <input value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} required inputMode="numeric" className="w-full rounded-lg px-3 py-2.5 text-[13px]" style={inputStyle} />
        </div>
      </div>

      <div className="mb-4 rounded-xl p-3" style={{ background: "#f4eee4", border: "1px solid #dfd1bf" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[12.5px] font-semibold" style={{ color: "#2f261f" }}>
            途經站點（依順序）
          </span>
          <button type="button" onClick={addStop} className="text-[12px] font-semibold" style={{ color: "#4a7594" }}>
            + 新增站點
          </button>
        </div>
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
            <span className="w-5 shrink-0 text-[12px] text-center" style={{ color: "#766a5d" }}>
              {i + 1}
            </span>
            <input
              value={stop.name}
              onChange={(e) => updateStop(i, "name", e.target.value)}
              placeholder="站點名稱"
              className="w-24 shrink-0 rounded-lg px-2 py-1.5 text-[12.5px]"
              style={{ ...inputStyle, background: "#fff" }}
            />
            <input
              value={stop.lat}
              onChange={(e) => updateStop(i, "lat", e.target.value)}
              placeholder="緯度"
              inputMode="decimal"
              className="flex-1 rounded-lg px-2 py-1.5 text-[12.5px]"
              style={{ ...inputStyle, background: "#fff" }}
            />
            <input
              value={stop.lng}
              onChange={(e) => updateStop(i, "lng", e.target.value)}
              placeholder="經度"
              inputMode="decimal"
              className="flex-1 rounded-lg px-2 py-1.5 text-[12.5px]"
              style={{ ...inputStyle, background: "#fff" }}
            />
            <button
              type="button"
              onClick={() => removeStop(i)}
              disabled={stops.length <= 2}
              aria-label="移除站點"
              className="shrink-0 text-[13px] font-bold disabled:opacity-30"
              style={{ color: "#b0503f" }}
            >
              ✕
            </button>
          </div>
        ))}
        <p className="mt-1 text-[11px]" style={{ color: "#a89a89" }}>
          至少需要 2 個站點
        </p>
      </div>

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
