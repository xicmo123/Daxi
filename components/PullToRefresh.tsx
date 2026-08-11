"use client";

// Pull down at the top of a page to refetch it.
//
// Every screen in this app is a live reading of something — remaining parking
// spaces, buses on the road, whether the water is back on. Without this the
// only way to get a fresh number is to navigate away and back, which users
// don't discover, so they end up trusting a figure that is ten minutes old.
//
// router.refresh() re-runs the server components for the current route and
// swaps the result in without losing client state, which is exactly the
// semantics wanted here.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tapMedium } from "@/lib/haptics";

/** How far the user must drag before the release actually refreshes. */
const TRIGGER_PX = 72;
/** Resistance — the indicator moves at a third of the finger, like iOS. */
const DAMPING = 3;

export default function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  // Read in the move handler; a ref avoids re-subscribing the listeners on
  // every pixel of movement.
  const armed = useRef(false);

  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      // Only when already at the very top, otherwise this fights normal
      // scrolling — and only for single-finger drags, so pinch-zoom is safe.
      if (window.scrollY > 0 || event.touches.length !== 1) {
        armed.current = false;
        return;
      }
      armed.current = true;
      startY.current = event.touches[0].clientY;
    }

    function onTouchMove(event: TouchEvent) {
      if (!armed.current || startY.current === null || refreshing) return;
      const delta = event.touches[0].clientY - startY.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      setPull(Math.min(delta / DAMPING, TRIGGER_PX * 1.4));
    }

    function onTouchEnd() {
      if (!armed.current) return;
      armed.current = false;
      startY.current = null;

      setPull((current) => {
        if (current >= TRIGGER_PX && !refreshing) {
          setRefreshing(true);
          tapMedium();
          router.refresh();
          // No completion event exists for router.refresh(), so the indicator
          // is held briefly rather than flashing away before the new data
          // paints — a refresh that looks instant reads as "nothing happened".
          window.setTimeout(() => {
            setRefreshing(false);
            setPull(0);
          }, 900);
          return TRIGGER_PX;
        }
        return 0;
      });
    }

    // passive: the handler never calls preventDefault, so the browser can keep
    // scrolling on the compositor thread.
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [router, refreshing]);

  if (pull <= 0 && !refreshing) return null;

  const ready = pull >= TRIGGER_PX;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center"
      style={{ top: `calc(var(--app-safe-top) + ${Math.round(pull * 0.5)}px)` }}
      aria-hidden
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{
          background: "var(--card)",
          boxShadow: "var(--shadow-float)",
          color: ready || refreshing ? "var(--accent)" : "var(--ink-soft)",
          transform: `rotate(${refreshing ? 0 : pull * 3}deg)`,
          opacity: Math.min(1, pull / TRIGGER_PX + (refreshing ? 1 : 0)),
        }}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className={refreshing ? "animate-spin" : undefined}
        >
          <path d="M3.5 12a8.5 8.5 0 1 1 2.9 6.4" />
          <path d="M3.2 18.6v-5h5" />
        </svg>
      </span>
    </div>
  );
}
