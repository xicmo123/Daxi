"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeIdentity, type Identity } from "@/lib/identity";

export default function IdentitySwitchCard({
  currentLabel,
  switchToHref,
  switchToLabel,
  switchToIdentity,
}: {
  currentLabel: string;
  switchToHref: string;
  switchToLabel: string;
  switchToIdentity: Identity;
}) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  return (
    <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: "var(--river-teal)" }}>
        目前身份
      </div>
      <div className="text-[16px] font-bold mb-3" style={{ color: "var(--ink)" }}>
        {currentLabel}
      </div>
      <button
        type="button"
        disabled={switching}
        onClick={() => {
          setSwitching(true);
          writeIdentity(switchToIdentity);
          router.push(switchToHref);
        }}
        className="w-full rounded-full py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
        style={{ background: "var(--river-teal)", color: "#fff", opacity: switching ? 0.6 : 1 }}
      >
        {switching ? "切換中…" : switchToLabel}
      </button>
    </div>
  );
}
