import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkPassword, expectedSessionToken } from "@/lib/adminAuth";
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

  const token = await expectedSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    priority: "high",
  });
  return res;
}
