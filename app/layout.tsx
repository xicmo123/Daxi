import type { Metadata, Viewport } from "next";
import { Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
  themeColor: "#1e293b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${notoSerifTC.variable} h-full antialiased`}>
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
