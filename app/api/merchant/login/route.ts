import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_COOKIE_MAX_AGE, MERCHANT_SESSION_COOKIE, checkMerchantLogin, merchantSessionToken } from "@/lib/merchantAuth";
import { clearAttempts, clientIp, isRateLimited, recordFailedAttempt } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const placeId = typeof body?.placeId === "string" ? body.placeId : "";
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const rateLimitKey = `merchant:${clientIp(request)}:${placeId || "unknown"}`;
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: "嘗試次數過多，請稍後再試" }, { status: 429 });
  }

  const account = await checkMerchantLogin(placeId, passcode);
  if (account === "disabled") {
    return NextResponse.json({ error: "這個商家帳號已被停用，請聯絡管理單位" }, { status: 403 });
  }
  if (!account) {
    recordFailedAttempt(rateLimitKey);
    return NextResponse.json({ error: "商家代碼或通行碼錯誤" }, { status: 401 });
  }
  clearAttempts(rateLimitKey);

  const token = await merchantSessionToken(placeId);
  const res = NextResponse.json({ ok: true, businessName: account.businessName });
  res.cookies.set(MERCHANT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Matches the expiry now signed into the token itself.
    maxAge: MERCHANT_COOKIE_MAX_AGE,
    priority: "high",
  });
  return res;
}
