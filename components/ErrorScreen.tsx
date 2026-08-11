"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/trackClient";
import { Button, ButtonAnchor, ButtonLink } from "./ui";

/**
 * Shared fallback for every error boundary in the app.
 *
 * Two things matter here beyond "don't show a white screen": the retry has to
 * actually re-fetch (Next 16's `unstable_retry`, not a state reset), and the
 * emergency numbers stay reachable — this is a civic app, and a crash on the
 * 居民 side is exactly when someone might be trying to reach 119.
 */
export default function ErrorScreen({
  error,
  retry,
  title = "這個畫面出了點問題",
  description = "可能是網路不穩或資料來源暫時無回應。你可以重試，或回首頁繼續使用其他功能。",
  showEmergency = false,
  homeHref = "/",
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
  description?: string;
  showEmergency?: boolean;
  homeHref?: string;
}) {
  useEffect(() => {
    reportClientError({
      message: error.message || "Render error",
      source: "render",
      // `digest` is the only handle on the server-side stack, which Next
      // deliberately withholds from the client in production.
      stack: [error.digest ? `digest: ${error.digest}` : null, error.stack].filter(Boolean).join("\n"),
      path: typeof window === "undefined" ? undefined : window.location.pathname,
    });
  }, [error]);

  return (
    <div className="safe-page-x flex min-h-[60dvh] flex-col items-center justify-center py-12 text-center fade-in">
      <svg width="96" height="96" viewBox="0 0 112 112" fill="none" aria-hidden className="mb-3">
        <ellipse cx="56" cy="60" rx="34" ry="30" fill="var(--accent)" opacity="0.16" />
        <circle cx="45" cy="54" r="4.2" fill="var(--ink)" />
        <circle cx="70" cy="54" r="4.2" fill="var(--ink)" />
        <path d="M46 76q10-8 20 0" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>

      <h1 className="text-[17px] font-bold" style={{ color: "var(--ink)" }}>
        {title}
      </h1>
      <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {description}
      </p>

      <div className="mt-5 flex w-full max-w-[280px] flex-col gap-2">
        <Button type="button" tone="primary" size="md" fullWidth onClick={retry}>
          重新載入
        </Button>
        <ButtonLink href={homeHref} tone="secondary" size="md" fullWidth>
          回首頁
        </ButtonLink>
      </div>

      {showEmergency ? (
        <div className="mt-6 w-full max-w-[280px]">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--ink-soft)" }}>
            緊急聯絡
          </div>
          <div className="flex gap-2">
            <ButtonAnchor href="tel:110" tone="secondary" size="md" fullWidth>
              報案 110
            </ButtonAnchor>
            <ButtonAnchor href="tel:119" tone="danger" size="md" fullWidth>
              救護 119
            </ButtonAnchor>
          </div>
        </div>
      ) : null}

      {error.digest ? (
        <div className="mt-6 text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
          錯誤代碼 {error.digest}
        </div>
      ) : null}
    </div>
  );
}
