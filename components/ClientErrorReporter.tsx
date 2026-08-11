"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reportClientError, trackView } from "@/lib/trackClient";

/**
 * Global client-side reporting, mounted once in the root layout.
 *
 * Error boundaries only catch errors thrown during render — the two listeners
 * here cover everything else (event handlers, async callbacks, rejected
 * promises), which in practice is where most production breakage lives.
 * Without this the app had no way at all to learn about a crash on a user's
 * phone.
 */
export default function ClientErrorReporter() {
  const pathname = usePathname();

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError({
        message: event.message || "Unknown error",
        source: "window",
        stack: event.error instanceof Error ? event.error.stack : undefined,
        path: window.location.pathname,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportClientError({
        message: reason instanceof Error ? reason.message : String(reason).slice(0, 500),
        source: "unhandledrejection",
        stack: reason instanceof Error ? reason.stack : undefined,
        path: window.location.pathname,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // One view event per route change. The app is a client-side-routed SPA once
  // loaded, so server logs alone can't tell which screens people actually use.
  useEffect(() => {
    if (!pathname) return;
    // Admin and merchant backends are staff tools; keeping them out means the
    // dashboard reflects residents and visitors, not the operator's own taps.
    if (pathname.startsWith("/admin") || pathname.startsWith("/merchant")) return;
    trackView(pathname, document.title);
  }, [pathname]);

  return null;
}
