"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Clinic } from "@/lib/clinicData";

const TYPE_COLOR: Record<Clinic["type"], string> = {
  診所: "#4a7594",
  藥局: "#5a8f6a",
  醫院: "#b0503f",
};

export default function ClinicList({ clinics }: { clinics: Clinic[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string, name: string) => {
    if (!confirm(`確定要刪除「${name}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/resident-clinics/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
            醫療輪值地圖
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理大溪區診所/藥局時刻表，用於 /resident/clinics 的「現在有開」篩選
          </p>
        </div>
        <Link
          href="/admin/resident-clinics/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#4a7594", color: "#fff" }}
        >
          + 新增診所/藥局
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {clinics.map((clinic) => (
          <div key={clinic.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            <span className="shrink-0 text-[10.5px] font-semibold rounded-full px-2 py-1" style={{ background: "#f4eee4", color: TYPE_COLOR[clinic.type] }}>
              {clinic.type}
            </span>
            <Link href={`/admin/resident-clinics/${clinic.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {clinic.name}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {clinic.address}
              </div>
            </Link>
            <button
              onClick={() => remove(clinic.id, clinic.name)}
              disabled={busyId === clinic.id}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {clinics.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未新增任何診所/藥局
          </p>
        ) : null}
      </div>
    </div>
  );
}
