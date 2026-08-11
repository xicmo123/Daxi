import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_MAX_AGE, ADMIN_SESSION_COOKIE, checkPassword, issueSessionToken } from "@/lib/adminAuth";
import { clearAttempts, clientIp, isRateLimited, recordFailedAttempt } from "@/lib/rateLimit";
import { appendAuditLog } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const rateLimitKey = `admin:${ip}`;
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: "嘗試次數過多，請稍後再試" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    recordFailedAttempt(rateLimitKey);
    await appendAuditLog({ action: "admin.login.failure", ip });
    return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });
  }
  clearAttempts(rateLimitKey);
  await appendAuditLog({ action: "admin.login.success", ip });

  const token = await issueSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    // "strict" rather than "lax": nothing links into the backend from another
    // site, so there is no flow this breaks — and it removes the cross-site
    // GET vector against destructive admin routes entirely.
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Matches the expiry inside the signed token (12h) instead of the old 30
    // days, so the cookie disappears at the same moment it stops working.
    maxAge: ADMIN_COOKIE_MAX_AGE,
    priority: "high",
  });
  return res;
}
