import { NextResponse } from "next/server";
import { MERCHANT_SESSION_COOKIE } from "@/lib/merchantAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MERCHANT_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
