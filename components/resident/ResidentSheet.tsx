"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./ResidentSkin.module.css";

const noopSubscribe = () => () => {};

// Bottom sheet on phones, centred dialog from 640px up. Shared by the
// bulletin detail and the garbage-truck map so both close the same way:
// Escape, backdrop tap, or a downward swipe on the header.
export default function ResidentSheet({
  title,
  eyebrow,
  wide,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: ReactNode;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  // false during SSR/hydration, true on the client — portals need document.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const startY = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (mounted) closeRef.current?.focus();
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div
        className={styles.sheet}
        data-wide={wide ? "true" : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.sheetHead}
          onTouchStart={(e) => {
            startY.current = e.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(e) => {
            if (startY.current === null) return;
            if ((e.changedTouches[0]?.clientY ?? startY.current) - startY.current > 80) onClose();
            startY.current = null;
          }}
        >
          <div className="min-w-0">
            {eyebrow ? <div className={styles.bulletinMeta}>{eyebrow}</div> : null}
            <h2>{title}</h2>
          </div>
          <button ref={closeRef} type="button" className={styles.iconButton} onClick={onClose} aria-label="關閉">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className={styles.sheetBody}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
