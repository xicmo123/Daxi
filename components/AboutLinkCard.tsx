"use client";

// 關於大溪通 as a row inside 我的.
//
// It used to be the fifth tab of the resident bar, which spent a primary
// navigation slot on a dead end (a modal you read once) while the resident's
// actual settings had no entry point at all. Both 我的 pages carry this row now,
// so 關於 sits in the same place regardless of which mode you are in.
import { useState } from "react";
import AboutModal from "./AboutModal";
import { tapLight } from "@/lib/haptics";

export default function AboutLinkCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          tapLight();
          setOpen(true);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition-opacity active:opacity-70"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-card)", minHeight: 56 }}
      >
        <span>
          <span className="block text-app-body font-bold" style={{ color: "var(--ink)" }}>
            關於大溪通
          </span>
          <span className="mt-0.5 block text-app-caption" style={{ color: "var(--ink-soft)" }}>
            資料來源、版本與聯絡方式
          </span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--ink-soft)" }} aria-hidden>
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {open ? <AboutModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
