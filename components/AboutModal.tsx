"use client";

import Link from "next/link";
import Modal, { ModalHeader } from "./ui/Modal";

export default function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} label="關於" className="p-6">
      <ModalHeader title="關於大溪通" onClose={onClose} />

      <p className="text-[13.5px] leading-relaxed mb-3" style={{ color: "var(--ink)" }}>
        此 app 非政府相關單位開發，僅為熱愛大溪的居民自行開發的系統，想為大溪盡一份力。
      </p>
      <p className="text-[13.5px] leading-relaxed mb-4" style={{ color: "var(--ink)" }}>
        歡迎大家提供活動／景點照片，相關合作訊息可參考下方聯絡資訊。
      </p>

      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--paper-2)" }}>
        <div className="text-[10.5px] tracking-[0.15em] uppercase mb-1" style={{ color: "var(--ink-soft)" }}>
          聯絡資訊
        </div>
        <a href="mailto:xicmo123@gmail.com" className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
          xicmo123@gmail.com
        </a>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-[12px]" style={{ color: "var(--ink-soft)" }}>
        <Link href="/privacy" className="underline" onClick={onClose}>
          隱私權政策
        </Link>
        <Link href="/terms" className="underline" onClick={onClose}>
          服務條款
        </Link>
      </div>

      {/* Surfaced here rather than in a settings screen: when someone reports a
          bug this is the one number support needs, and 關於 is where they look. */}
      <div className="mt-4 text-center text-[11px]" style={{ color: "var(--ink-soft)" }}>
        版本 {process.env.NEXT_PUBLIC_APP_VERSION || "dev"}
      </div>
    </Modal>
  );
}
