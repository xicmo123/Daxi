import { NextResponse } from "next/server";

// Apple Universal Links.
//
// Without this file, a daxi.zequo.net link shared in LINE opens Safari even on
// a phone that has the app installed — so every shared spot, coupon or outage
// notice leaks the user out of the app, and word-of-mouth (the only growth
// channel a district app has) never brings anyone back into it.
//
// Served from a route handler rather than public/ because Apple requires
// Content-Type: application/json and refuses a file served as text/plain,
// which is what a bare extensionless file in public/ would get.
//
// ⚠️ APP_ID must be "<Apple Team ID>.<bundle id>", e.g. "AB12CD34EF.daxi.zequo.net".
// The Team ID is in the Apple Developer portal under Membership. Set it as
// APPLE_TEAM_ID in .env.local; until then this route reports 503 rather than
// serving an association file that would silently fail to validate.
const BUNDLE_ID = "daxi.zequo.net";

export const dynamic = "force-dynamic";

export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID;
  if (!teamId) {
    return NextResponse.json({ error: "APPLE_TEAM_ID is not configured" }, { status: 503 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${teamId}.${BUNDLE_ID}`],
            components: [
              // Everything except the staff backends, which should always open
              // in a browser — an admin link handed to the app would land on a
              // screen the app has no navigation out of.
              { "/": "/admin/*", exclude: true },
              { "/": "/merchant/*", exclude: true },
              { "/": "/api/*", exclude: true },
              { "/": "/*" },
            ],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        // Apple's CDN caches this; a short TTL keeps a Team ID fix from taking
        // a day to propagate.
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
