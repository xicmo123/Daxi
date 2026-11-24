"use client";

import Link from "next/link";
import Modal, { ModalHeader } from "./ui/Modal";
import { ABOUT_CONTACT_EMAIL, ABOUT_PARAGRAPHS } from "@/lib/aboutOwner";

// 關於大溪通: the owner's note, contact, and the small print. A popup rather
// than a page — it is read once, and a page spent a nav slot on a dead end.
export default function AboutModal({ onClose, resident = false }: { onClose: () => void; resident?: boolean }) {
  return (
    <Modal onClose={onClose} label="關於大溪通" className="p-6">
      <ModalHeader title="關於大溪通" onClose={onClose} />

      <div className="flex flex-col gap-3 text-app-body" style={{ color: "var(--ink)", lineHeight: 1.85 }}>
        {ABOUT_PARAGRAPHS.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="mt-5 rounded-2xl px-4 py-4" style={{ background: "var(--paper-2)" }}>
        <div className="text-app-label mb-1" style={{ color: "var(--ink-soft)" }}>
          聯絡信箱
        </div>
        <a href={`mailto:${ABOUT_CONTACT_EMAIL}`} className="text-app-body font-bold break-all" style={{ color: "var(--ink)" }}>
          {ABOUT_CONTACT_EMAIL}
        </a>
        <a
          href={`mailto:${ABOUT_CONTACT_EMAIL}?subject=${encodeURIComponent("大溪通意見回饋")}`}
          className="mt-3 flex min-h-[46px] items-center justify-center rounded-full text-app-body font-bold transition-opacity active:opacity-80"
          style={{ background: "var(--daxi-red)", color: "var(--accent-fg)" }}
        >
          寫信給我
        </a>
      </div>

      <Link
        href={resident ? "/resident/profile" : "/profile"}
        onClick={onClose}
        className="mt-3 flex min-h-[48px] items-center justify-between rounded-2xl px-4 text-app-body font-bold transition-opacity active:opacity-80"
        style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
      >
        {resident ? "我的設定（居民卡・我家・通知）" : "我的收藏（景點・店家）"}
        <span aria-hidden>→</span>
      </Link>

      <div className="mt-4 flex items-center justify-center gap-4 text-app-label" style={{ color: "var(--ink-soft)" }}>
        <Link href="/privacy" className="underline" onClick={onClose}>
          隱私權政策
        </Link>
        <Link href="/terms" className="underline" onClick={onClose}>
          服務條款
        </Link>
        {/* The one number support needs when someone reports a bug. */}
        <span>版本 {process.env.NEXT_PUBLIC_APP_VERSION || "dev"}</span>
      </div>
    </Modal>
  );
}
