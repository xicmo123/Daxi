"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ResidentSkin.module.css";

// Horizontal snap-scrolling card row with the Jeju festival-swiper footer: a
// thin progress track showing which part of the row is in view, plus prev /
// next buttons for mouse users. Native scrolling, so touch flicks just work.
export default function ResidentRail({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ start: 0, size: 1 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const total = el.scrollWidth || 1;
    setView({ start: el.scrollLeft / total, size: Math.min(1, el.clientWidth / total) });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: amount * dir, behavior: "smooth" });
  };

  const atStart = view.start <= 0.001;
  const atEnd = view.start + view.size >= 0.999;

  return (
    <div>
      <div ref={ref} className={styles.rail} onScroll={measure} role="list" aria-label={label}>
        {children}
      </div>
      {view.size < 0.999 ? (
        <div className={styles.railFoot}>
          <span className={styles.progress} aria-hidden>
            <i style={{ left: `${view.start * 100}%`, width: `${view.size * 100}%` }} />
          </span>
          <div className={styles.railNav}>
            <button type="button" className={styles.railBtn} onClick={() => step(-1)} disabled={atStart} aria-label="上一組">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className={styles.railBtn} onClick={() => step(1)} disabled={atEnd} aria-label="下一組">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
