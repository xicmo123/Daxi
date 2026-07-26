"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readIdentity, writeIdentity, type Identity } from "@/lib/identity";
import IdentityTransitionOverlay from "./IdentityTransitionOverlay";
import { useT, useLang, setLang, type Lang } from "@/lib/i18n";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Identity | null {
  return readIdentity();
}

function getServerSnapshot(): Identity | null {
  return null;
}

// Only relevant at "/" — the natural entry point. Other tourist pages never
// mount the gate at all, so a first-time visitor who deep-links straight to
// e.g. /spots just sees that page; they'll get asked next time they're on
// the home tab. Keeping this scoped avoids a gate-flash on every page.
export default function IdentityGate() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <HomeIdentityGate />;
}

function HomeIdentityGate() {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  // useSyncExternalStore (not a plain effect) is the correct way to read an
  // external source like localStorage: getServerSnapshot keeps the SSR/
  // first-paint output as "unknown" so there's no hydration mismatch, and
  // it swaps to the real stored value right after mount.
  const storedIdentity = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [chosen, setChosen] = useState<Identity | null>(null);
  const [pending, setPending] = useState<Identity | null>(null);
  // A fresh visitor sees the language step before the identity step; once
  // storedIdentity resolves as null (real first visit, not just SSR
  // "unknown"), the language prompt is the first thing they're asked.
  const [langConfirmed, setLangConfirmed] = useState(false);
  const identity = chosen ?? storedIdentity;
  const redirecting = identity === "resident";

  useEffect(() => {
    if (redirecting) router.replace("/resident");
  }, [redirecting, router]);

  const choose = (next: Identity) => {
    setPending(next);
    window.setTimeout(() => {
      writeIdentity(next);
      setChosen(next);
    }, 550);
  };

  if (redirecting) {
    return <div className="fixed inset-0 z-50" style={{ background: "var(--paper)" }} />;
  }

  if (identity) return null;

  if (!langConfirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "var(--paper)" }}>
        <div className="w-full max-w-sm fade-in">
          <div className="text-center mb-8">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--accent)" }}>
              {t("welcomeTo")}
            </div>
            <h1 className="text-[26px] font-bold" style={{ color: "var(--ink)" }}>
              大溪 Daxi
            </h1>
            <p className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
              {t("langChooseTitle")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {(["zh", "en"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setLang(option as Lang);
                  setLangConfirmed(true);
                }}
                className="rounded-2xl px-5 py-4 text-left card-shadow transition-transform active:scale-[0.98]"
                style={
                  lang === option
                    ? { background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)" }
                    : { background: "var(--card)", border: "1px solid var(--line)" }
                }
              >
                <div
                  className="text-[15px] font-bold"
                  style={{ color: lang === option ? "var(--block-fg)" : "var(--ink)" }}
                >
                  {option === "zh" ? "中文" : "English"}
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] mt-6" style={{ color: "var(--ink-soft)" }}>
            {t("langChooseSubtitle")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "var(--paper)" }}>
      <IdentityTransitionOverlay to={pending} />
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--accent)" }}>
            {t("welcomeTo")}
          </div>
          <h1 className="text-[26px] font-bold" style={{ color: "var(--ink)" }}>
            大溪 Daxi
          </h1>
          <p className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
            {t("gateSubtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => choose("tourist")}
            className="rounded-2xl px-5 py-4 text-left card-shadow transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)" }}
          >
            <div className="text-[15px] font-bold" style={{ color: "var(--block-fg)" }}>
              {t("imTourist")}
            </div>
            <div className="text-[12px] mt-1" style={{ color: "rgba(43,36,32,0.72)" }}>
              {t("touristCardDesc")}
            </div>
          </button>

          <button
            type="button"
            onClick={() => choose("resident")}
            className="rounded-2xl px-5 py-4 text-left card-shadow transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)" }}
          >
            <div className="text-[15px] font-bold" style={{ color: "var(--block-fg)" }}>
              {t("imResident")}
            </div>
            <div className="text-[12px] mt-1" style={{ color: "rgba(43,36,32,0.72)" }}>
              {t("residentCardDesc")}
            </div>
          </button>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: "var(--ink-soft)" }}>
          {t("gateSwitchHint")}
        </p>
      </div>
    </div>
  );
}
