"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./styles";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * The dialog shell every modal in the app shares: portal to body, Escape to
 * close, background scroll lock, backdrop click-through, and a focus trap.
 *
 * The focus trap is the part the hand-rolled modals were all missing — without
 * it a VoiceOver or keyboard user tabs straight out of the dialog into the
 * page behind it, which still scrolls under the backdrop.
 */
export default function Modal({
  onClose,
  label,
  children,
  align = "center",
  className,
}: {
  onClose: () => void;
  label: string;
  children: ReactNode;
  align?: "center" | "bottom";
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so screen readers announce it and Tab is
    // already inside the trap on the first press.
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={cx(
        "fixed inset-0 z-50 flex justify-center p-3 fade-in sm:p-5",
        align === "bottom" ? "items-end" : "items-center",
      )}
      style={{ background: "rgba(15,13,10,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={cx("w-full max-w-sm rounded-[22px] card-shadow", className)}
        style={{ background: "var(--paper)", maxHeight: "calc(100dvh - 2rem)", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </h3>
      <button
        onClick={onClose}
        type="button"
        aria-label="關閉"
        className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70 shrink-0"
        style={{ background: "var(--paper-2)", color: "var(--ink)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
