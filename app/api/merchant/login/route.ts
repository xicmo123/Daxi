import { NextRequest, NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE, checkMerchantLogin, merchantSessionToken } from "@/lib/merchantAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const placeId = typeof body?.placeId === "string" ? body.placeId : "";
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const account = await checkMerchantLogin(placeId, passcode);
  if (!account) {
    return NextResponse.json({ error: "商家代碼或通行碼錯誤" }, { status: 401 });
  }

  const token = await merchantSessionToken(placeId);
  const res = NextResponse.json({ ok: true, businessName: account.businessName });
  res.cookies.set(MERCHANT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
