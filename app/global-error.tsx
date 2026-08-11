"use client";

// Last line of defence: this replaces the root layout, so it must render its
// own <html>/<body> and cannot rely on globals.css class names being applied
// by anything above it. Styles are inline for that reason.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="zh-Hant">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#fdf8f2",
          color: "#2b2420",
          fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang TC", "Noto Sans CJK TC", sans-serif',
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden>
            🛠️
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>大溪通暫時無法顯示</h1>
          <p style={{ fontSize: 13, color: "#7d6a58", margin: "0 0 20px" }}>
            App 遇到未預期的錯誤。請重新載入，若持續發生請稍後再試。
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 12,
              border: "none",
              background: "#a06a3a",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            重新載入
          </button>
          <div style={{ marginTop: 20, fontSize: 12, color: "#7d6a58" }}>
            緊急狀況請撥打{" "}
            <a href="tel:119" style={{ color: "#b3261e", fontWeight: 700 }}>
              119
            </a>{" "}
            或{" "}
            <a href="tel:110" style={{ color: "#b3261e", fontWeight: 700 }}>
              110
            </a>
          </div>
          {error.digest ? (
            <div style={{ marginTop: 16, fontSize: 10.5, color: "#7d6a58" }}>錯誤代碼 {error.digest}</div>
          ) : null}
        </div>
      </body>
    </html>
  );
}
