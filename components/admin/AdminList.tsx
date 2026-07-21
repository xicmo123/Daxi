"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Business, BusinessTag } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";

type Row = {
  place: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  isCustom: boolean;
};

const TABS: { label: string; value: BusinessTag | "全部" }[] = [
  { label: "全部", value: "全部" },
  { label: "美食", value: "美食" },
  { label: "景點", value: "景點" },
  { label: "市集", value: "市集" },
];

export default function AdminList({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<BusinessTag | "全部">("全部");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "全部" && r.place.tag !== tab) return false;
      if (q && !r.place.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, tab]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>
          商家／景點管理
        </h1>
        <Link
          href="/admin/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          + 新增自訂項目
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋店名…"
          className="flex-1 rounded-xl px-4 py-2.5 text-[13.5px] outline-none"
          style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}
        />
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="text-[12.5px] font-medium rounded-full px-3.5 py-1.5 transition-opacity active:opacity-70"
            style={
              tab === t.value
                ? { background: "var(--accent)", color: "var(--accent-fg)" }
                : { background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--ink-soft)" }}>
        共 {filtered.length} 筆
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(({ place, photo, detail, isCustom }) => (
          <Link
            key={place.placeId}
            href={`/admin/${place.placeId}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-opacity active:opacity-70"
            style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--line)" }}>
              {photo ? (
                <Image src={photo.src} alt={place.name} fill sizes="48px" className="object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "var(--ink)" }}>
                {place.name}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                {place.tag}
                {detail?.category ? ` ・ ${detail.category}` : ""}
                {isCustom ? " ・ 自訂項目" : ""}
              </div>
            </div>
            {!photo ? (
              <span className="text-[10.5px] shrink-0" style={{ color: "var(--status-warn)" }}>
                無照片
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
