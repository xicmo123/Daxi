"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeIdentity, type Identity } from "@/lib/identity";
import IdentityTransitionOverlay from "./IdentityTransitionOverlay";
import { useT, type DictKey } from "@/lib/i18n";

export default function IdentitySwitchCard({
  currentLabelKey,
  switchToHref,
  switchToLabelKey,
  switchToIdentity,
}: {
  currentLabelKey: DictKey;
  switchToHref: string;
  switchToLabelKey: DictKey;
  switchToIdentity: Identity;
}) {
  const router = useRouter();
  const t = useT();
  const [switching, setSwitching] = useState(false);

  return (
    <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <IdentityTransitionOverlay to={switching ? switchToIdentity : null} />
      <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: "var(--river-teal)" }}>
        {t("currentIdentityLabel")}
      </div>
      <div className="text-[16px] font-bold mb-3" style={{ color: "var(--ink)" }}>
        {t(currentLabelKey)}
      </div>
      <button
        type="button"
        disabled={switching}
        onClick={() => {
          setSwitching(true);
          writeIdentity(switchToIdentity);
          window.setTimeout(() => router.push(switchToHref), 550);
        }}
        className="w-full rounded-full py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
        style={{ background: "var(--river-teal)", color: "#fff", opacity: switching ? 0.6 : 1 }}
      >
        {switching ? t("switchingLabel") : t(switchToLabelKey)}
      </button>
    </div>
  );
}
