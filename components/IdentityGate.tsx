"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readIdentity, writeIdentity, type Identity } from "@/lib/identity";
import IdentityTransitionOverlay from "./IdentityTransitionOverlay";

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
  // useSyncExternalStore (not a plain effect) is the correct way to read an
  // external source like localStorage: getServerSnapshot keeps the SSR/
  // first-paint output as "unknown" so there's no hydration mismatch, and
  // it swaps to the real stored value right after mount.
  const storedIdentity = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [chosen, setChosen] = useState<Identity | null>(null);
  const [pending, setPending] = useState<Identity | null>(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "var(--paper)" }}>
      <IdentityTransitionOverlay to={pending} />
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: "var(--accent)" }}>
            歡迎來到
          </div>
          <h1 className="text-[26px] font-bold" style={{ color: "var(--ink)" }}>
            大溪 Daxi
          </h1>
          <p className="text-[13px] mt-2" style={{ color: "var(--ink-soft)" }}>
            先告訴我們你是誰，內容會不一樣
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
              我是遊客
            </div>
            <div className="text-[12px] mt-1" style={{ color: "var(--block-fg-soft)" }}>
              景點推薦、美食優惠、地圖導覽
            </div>
          </button>

          <button
            type="button"
            onClick={() => choose("resident")}
            className="rounded-2xl px-5 py-4 text-left card-shadow transition-transform active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--block-river) 0%, var(--block-river-deep) 100%)" }}
          >
            <div className="text-[15px] font-bold" style={{ color: "var(--block-fg)" }}>
              我是大溪人
            </div>
            <div className="text-[12px] mt-1" style={{ color: "var(--block-fg-soft)" }}>
              里民服務、區公所公告、停水停電通知
            </div>
          </button>
        </div>

        {/* Skippable on purpose.

            This was a hard gate: a first-time visitor could not see a single
            pixel of 大溪通 without first declaring who they are. That is a
            bad trade for an app someone opens standing on 老街 wanting to know
            where to park — and the premise is shaky anyway, since a 大溪人 also
            wants parking and a visitor also wants to know about road closures.

            Skipping picks the tourist surface (the better cold-start default
            for someone who has not told us anything) and, because the choice
            is stored either way, does not re-prompt on the next launch. Both
            home screens carry a mode toggle, and 我的 has the canonical one. */}
        <button
          type="button"
          onClick={() => choose("tourist")}
          className="mt-6 w-full text-center text-[12px] underline underline-offset-4 transition-opacity active:opacity-60"
          style={{ color: "var(--ink-soft)", minHeight: 44 }}
        >
          先隨便看看
        </button>

        <p className="text-center text-[11px] mt-2" style={{ color: "var(--ink-soft)" }}>
          之後可以隨時在「我的」切換身份
        </p>
      </div>
    </div>
  );
}
