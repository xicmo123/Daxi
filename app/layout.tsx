import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { SITE_URL } from "@/lib/siteUrl";
import { jsonLdString } from "@/lib/seo";
import ClientErrorReporter from "@/components/ClientErrorReporter";
import ExternalLinkHandler from "@/components/ExternalLinkHandler";
import PushListener from "@/components/PushListener";
import AppUrlListener from "@/components/AppUrlListener";
import "./globals.css";

// Latin/numeric only. Traditional Chinese webfonts are several MB even
// subsetted, which is the wrong trade on mobile data for a civic app, so CJK
// still resolves to the platform face — see the stack below.
const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
});

// Previously "-apple-system, …, PingFang TC, Microsoft JhengHei, …": PingFang
// covers iOS and JhengHei covers Windows, but nothing in that list exists on
// Android, so Android WebView fell through to whatever the OEM ships and the
// type looked different from the iOS build. Noto Sans CJK TC / Noto Sans TC
// are the Android system faces and cost nothing to name.
const FONT_STACK = [
  "var(--font-latin)",
  "-apple-system",
  "BlinkMacSystemFont",
  '"PingFang TC"',
  '"Noto Sans CJK TC"',
  '"Noto Sans TC"',
  '"Microsoft JhengHei"',
  '"Helvetica Neue"',
  "sans-serif",
].join(", ");

export const metadata: Metadata = {
  // Required for sitemap/OpenGraph to emit absolute URLs.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "大溪通 — 桃園大溪在地生活與旅遊資訊",
    template: "%s ｜ 大溪通",
  },
  description:
    "大溪通整合桃園大溪的即時停車位、公車動態、老街景點與商家、活動資訊，以及居民需要的停水停電、道路施工、垃圾清運與診所輪值。",
  applicationName: "大溪通",
  keywords: ["大溪", "大溪老街", "桃園大溪", "大溪停車", "大溪景點", "大溪美食", "大溪活動", "大溪大禧"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "大溪通",
  },
  icons: {
    // Google's result favicon wants a square multiple of 48px on the home page.
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "大溪通",
    locale: "zh_TW",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "travel",
  // Search Console / Bing ownership tokens, set in .env.local once the
  // properties are created. Omitted entirely while unset.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

// Tells search engines the site's name (shown above the URL in Google
// results) and that 大溪通 / 我是大溪人 are the same site.
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "大溪通",
  alternateName: ["我是大溪人", "Daxi Tong"],
  url: `${SITE_URL}/`,
  inLanguage: "zh-Hant-TW",
  description: "桃園大溪在地生活與旅遊資訊：即時停車、公車動態、老街景點與商家、活動，以及居民需要的停水停電、道路施工、垃圾清運與診所輪值。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Was a single #ff6b4a that matched neither the palette nor the manifest.
  // These are --paper in each theme, so the iOS/Android browser chrome blends
  // into the page instead of banding against it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1611" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`h-full antialiased ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking on purpose: applies the saved theme before first paint so
            dark-mode users don't get a white flash on every navigation. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className="min-h-full flex flex-col bg-paper-2 text-ink"
        style={{ ["--font-app-sans" as string]: FONT_STACK }}
      >
        <ClientErrorReporter />
        <ExternalLinkHandler />
        <PushListener />
        <AppUrlListener />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(WEBSITE_JSON_LD) }} />
        {children}
      </body>
    </html>
  );
}
