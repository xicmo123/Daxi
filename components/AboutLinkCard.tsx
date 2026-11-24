// 關於大溪通 as a row inside 我的 — a link to the popup (AboutModalHost).
import { ABOUT_HREF } from "@/lib/aboutOwner";

export default function AboutLinkCard() {
  return (
    <a
      href={ABOUT_HREF}
      className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition-opacity active:opacity-70"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-card)", minHeight: 56 }}
    >
      <span>
        <span className="block text-app-body font-bold" style={{ color: "var(--ink)" }}>
          關於大溪通
        </span>
        <span className="mt-0.5 block text-app-caption" style={{ color: "var(--ink-soft)" }}>
          網站的由來與聯絡方式
        </span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--ink-soft)" }} aria-hidden>
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  );
}
