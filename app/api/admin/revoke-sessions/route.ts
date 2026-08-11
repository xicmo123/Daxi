import { NextRequest, NextResponse } from "next/server";
import { revokeAllAdminSessions } from "@/lib/adminAuth";
import { revokeAllMerchantSessions } from "@/lib/merchantAuth";
import { clientIp } from "@/lib/rateLimit";
import { appendAuditLog } from "@/lib/auditLog";

// The "someone walked off with the shop iPad" button. Bumps one scope's
// revocation epoch (lib/sessionToken.ts), which invalidates every token
// already issued for that scope without touching the other scope or the
// outstanding coupon QR tokens — the thing rotating ADMIN_SESSION_SECRET
// could never do.
//
// Reachable only through the admin proxy gate (proxy.ts), so the caller is
// already an authenticated admin.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const scope = typeof body?.scope === "string" ? body.scope : "";

  if (scope !== "admin" && scope !== "merchant") {
    return NextResponse.json({ error: "scope 必須是 admin 或 merchant" }, { status: 400 });
  }

  if (scope === "merchant") {
    await revokeAllMerchantSessions();
    await appendAuditLog({ action: "merchant.sessions.revoke", ip: clientIp(request) });
    return NextResponse.json({ ok: true, scope });
  }

  await revokeAllAdminSessions();
  await appendAuditLog({ action: "admin.sessions.revoke", ip: clientIp(request) });
  // The caller's own cookie is now invalid too — that is the point, and the
  // client redirects to the login page.
  return NextResponse.json({ ok: true, scope });
}
