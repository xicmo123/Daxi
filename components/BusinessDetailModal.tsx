"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Business } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import PlaceholderIcon from "./PlaceholderIcon";

export default function BusinessDetailModal({
  business,
  photo,
  onClose,
}: {
  business: Business;
  photo: PhotoCredit | undefined;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={business.name}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center fade-in"
      style={{ background: "rgba(15,17,22,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] card-shadow"
        style={{ background: "var(--paper)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 shrink-0">
          {photo ? (
            <Image
              src={photo.src}
              alt={business.name}
              fill
              sizes="(max-width: 448px) 100vw, 420px"
              className="object-cover"
              style={{ filter: "sepia(0.06) saturate(0.85) contrast(0.97)" }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, var(--bordeaux-surface) 0%, var(--bordeaux-surface-deep) 60%, #0f0d0a 100%)",
              }}
            >
              <PlaceholderIcon kind={business.tag} />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(15,17,22,0.1) 0%, rgba(15,17,22,0.55) 100%)" }}
          />
          <button
            onClick={onClose}
            aria-label="關閉"
            className="absolute right-3 top-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity active:opacity-70"
            style={{ background: "rgba(15,17,22,0.4)", color: "#fff" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <span className="absolute left-4 bottom-3 font-serif font-semibold text-[17px] text-white">
            {business.name}
          </span>
        </div>

        <div className="p-6">
          <span
            className="inline-flex items-center text-[11px] rounded-full px-2.5 py-1 mb-4"
            style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
          >
            {business.tag}
          </span>

          <div className="flex flex-col gap-3 text-[13.5px]" style={{ color: "var(--ink)" }}>
            {business.address ? (
              <div className="flex items-start gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mt-0.5 shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.2" />
                </svg>
                <span className="leading-relaxed">{business.address}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                <path d="M9 21 10.5 3M15 21 13.5 3" />
                <path d="M12 5.5v2.5M12 11v2.5M12 16.5V19" />
              </svg>
              <span>距老街 {business.distanceLabel}</span>
            </div>
            {business.rating !== null ? (
              <div className="flex items-center gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="shrink-0" style={{ color: "var(--ink-soft)" }}>
                  <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" />
                </svg>
                <span>
                  {business.rating.toFixed(1)}・{business.reviewCount.toLocaleString()} 則評論
                </span>
              </div>
            ) : null}
          </div>

          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity active:opacity-60"
            style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink)" }}
          >
            開啟導航
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
