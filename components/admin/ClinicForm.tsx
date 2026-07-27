"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Clinic } from "@/lib/clinicData";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

const TYPES: Clinic["type"][] = ["診所", "藥局", "醫院"];

function minutesToClock(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Reverse-derives the simplified weekday/Sat/Sun form fields from the
// stored per-day `hours` windows (Mon–Fri is assumed uniform, matching how
// buildHours() in lib/clinicData.ts constructs them).
function hoursToFields(hours: Clinic["hours"]) {
  const find = (day: number) => hours.find((w) => w.day === day);
  const weekday = find(1);
  const saturday = find(6);
  const sunday = find(0);
  return {
    weekdayOpen: weekday ? minutesToClock(weekday.openMinutes) : "",
    weekdayClose: weekday ? minutesToClock(weekday.closeMinutes) : "",
    saturdayOpen: saturday ? minutesToClock(saturday.openMinutes) : "",
    saturdayClose: saturday ? minutesToClock(saturday.closeMinutes) : "",
    sundayOpen: sunday ? minutesToClock(sunday.openMinutes) : "",
    sundayClose: sunday ? minutesToClock(sunday.closeMinutes) : "",
  };
}

export default function ClinicForm({ clinic }: { clinic?: Clinic }) {
  const router = useRouter();
  const isEdit = Boolean(clinic);
  const initialHours = clinic ? hoursToFields(clinic.hours) : null;

  const [name, setName] = useState(clinic?.name ?? "");
  const [type, setType] = useState<Clinic["type"]>(clinic?.type ?? "診所");
  const [address, setAddress] = useState(clinic?.address ?? "");
  const [phone, setPhone] = useState(clinic?.phone ?? "");
  const [lat, setLat] = useState(clinic ? String(clinic.lat) : "24.884952");
  const [lng, setLng] = useState(clinic ? String(clinic.lng) : "121.288238");
  const [weekdayOpen, setWeekdayOpen] = useState(initialHours?.weekdayOpen ?? "");
  const [weekdayClose, setWeekdayClose] = useState(initialHours?.weekdayClose ?? "");
  const [saturdayOpen, setSaturdayOpen] = useState(initialHours?.saturdayOpen ?? "");
  const [saturdayClose, setSaturdayClose] = useState(initialHours?.saturdayClose ?? "");
  const [sundayOpen, setSundayOpen] = useState(initialHours?.sundayOpen ?? "");
  const [sundayClose, setSundayClose] = useState(initialHours?.sundayClose ?? "");
  const [holidayDutyDates, setHolidayDutyDates] = useState((clinic?.holidayDutyDates ?? []).join(", "));

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const body = () => ({
    name,
    type,
    address,
    phone: phone || undefined,
    lat: Number(lat),
    lng: Number(lng),
    weekdayOpen: weekdayOpen || undefined,
    weekdayClose: weekdayClose || undefined,
    saturdayOpen: saturdayOpen || undefined,
    saturdayClose: saturdayClose || undefined,
    sundayOpen: sundayOpen || undefined,
    sundayClose: sundayClose || undefined,
    holidayDutyDates: holidayDutyDates
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean),
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(isEdit ? `/api/admin/resident-clinics/${clinic!.id}` : "/api/admin/resident-clinics", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body()),
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
        router.push("/admin/resident-clinics");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!clinic) return;
    if (!confirm(`確定要刪除「${clinic.name}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/resident-clinics/${clinic.id}`, { method: "DELETE" });
      router.push("/admin/resident-clinics");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯診所/藥局" : "新增診所/藥局"}
        </h1>
        {isEdit ? (
          <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
            刪除
          </button>
        ) : null}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        類型
      </label>
      <div className="flex gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
            style={{ background: type === t ? "#4a7594" : "#f4eee4", color: type === t ? "#fff" : "#2f261f", border: "1px solid #dfd1bf" }}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        名稱
      </label>
      <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        地址
      </label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={100} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        電話（選填）
      </label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

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

      <div className="mb-4 rounded-xl p-3" style={{ background: "#f4eee4", border: "1px solid #dfd1bf" }}>
        <div className="mb-2 text-[12.5px] font-semibold" style={{ color: "#2f261f" }}>
          營業時間（留空代表當天休診）
        </div>
        {[
          { label: "週一至週五", open: weekdayOpen, setOpen: setWeekdayOpen, close: weekdayClose, setClose: setWeekdayClose },
          { label: "週六", open: saturdayOpen, setOpen: setSaturdayOpen, close: saturdayClose, setClose: setSaturdayClose },
          { label: "週日", open: sundayOpen, setOpen: setSundayOpen, close: sundayClose, setClose: setSundayClose },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 mb-2 last:mb-0">
            <span className="w-20 shrink-0 text-[12px]" style={{ color: "#2f261f" }}>
              {row.label}
            </span>
            <input
              type="time"
              value={row.open}
              onChange={(e) => row.setOpen(e.target.value)}
              className="flex-1 rounded-lg px-2 py-1.5 text-[13px]"
              style={{ ...inputStyle, background: "#fff" }}
            />
            <span className="text-[12px]" style={{ color: "#766a5d" }}>
              –
            </span>
            <input
              type="time"
              value={row.close}
              onChange={(e) => row.setClose(e.target.value)}
              className="flex-1 rounded-lg px-2 py-1.5 text-[13px]"
              style={{ ...inputStyle, background: "#fff" }}
            />
          </div>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        假日急診值班日期（選填，逗號分隔，格式 YYYY-MM-DD）
      </label>
      <input
        value={holidayDutyDates}
        onChange={(e) => setHolidayDutyDates(e.target.value)}
        placeholder="2026-02-17, 2026-02-18"
        className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]"
        style={inputStyle}
      />

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
