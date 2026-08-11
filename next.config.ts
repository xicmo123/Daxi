import type { NextConfig } from "next";

// Staff backends: never cached (a shared or proxy cache holding an admin page
// would leak it to the next visitor) and never indexed. app/robots.ts already
// disallows both paths; the header is the part a crawler can't ignore, and it
// also covers anything that reaches the page without reading robots.txt.
const STAFF_HEADERS = [
  { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["daxi.zequo.net"],
  async headers() {
    return [
      { source: "/admin/:path*", headers: STAFF_HEADERS },
      { source: "/merchant/:path*", headers: STAFF_HEADERS },
      {
        // Applies to every route. These are the headers that cost nothing and
        // close the common classes of issue for a public civic site.
        source: "/:path*",
        headers: [
          // The app never renders in a frame; blocking it removes clickjacking
          // of the merchant redeem and admin screens as a category.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Only geolocation is used, and only in this origin. Everything else
          // is denied so an injected script can't reach for the camera or mic.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
