"use client";

import { useState } from "react";

const DAXI_OFFICE_URL = "https://www.daxi.tycg.gov.tw";

const subLinks = [
  { label: "戶政服務", note: "戶籍謄本、身分證異動" },
  { label: "地政服務", note: "地籍謄本、地價查詢" },
  { label: "稅務服務", note: "地價稅、房屋稅" },
  { label: "區公所首頁", note: "各項服務入口" },
];

// The wide "常用連結" tile expands in place instead of jumping straight to
// /resident/services#links — residents can peek at the 4 sub-services
// without leaving the home screen, and still tap through to the real page.
export default function ResidentLinksCard({
  icon,
  block,
}: {
  icon: React.ReactNode;
  block: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative col-span-2 overflow-hidden rounded-2xl"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
    >
      <span className="absolute inset-x-4 top-0 h-1 rounded-b-full" style={{ background: block }} aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-opacity active:opacity-70"
      >
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: block, color: "#fff" }}>
          <span className="w-[19px] h-[19px] block">{icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold" style={{ color: "var(--ink)" }}>
            常用連結
          </div>
          <div className="text-[10.5px] mt-0.5 leading-snug" style={{ color: "var(--ink-soft)" }}>
            戶政／地政／區公所服務
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ color: "var(--ink-soft)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="flex flex-col gap-2 px-4 pb-4 fade-in">
          {subLinks.map((l) => (
            <a
              key={l.label}
              href={DAXI_OFFICE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-opacity active:opacity-70"
              style={{ background: "var(--paper-2)" }}
            >
              <span>
                <span className="block text-[12.5px] font-semibold" style={{ color: "var(--ink)" }}>
                  {l.label}
                </span>
                <span className="block text-[10.5px] mt-0.5" style={{ color: "var(--ink-soft)" }}>
                  {l.note}
                </span>
              </span>
              <span aria-hidden style={{ color: "var(--ink-soft)" }}>
                ↗
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
