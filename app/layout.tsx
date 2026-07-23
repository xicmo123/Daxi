import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大溪通 — Daxi Journal",
  description: "桃園大溪周邊活動、停車、天氣路況與旅遊資訊",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "大溪通",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff6b4a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-paper-2 text-ink"
        style={{
          ["--font-app-sans" as string]:
            '-apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", "Helvetica Neue", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
