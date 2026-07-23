import { NextRequest, NextResponse } from "next/server";
import { redeemCoupon } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const couponId = typeof body?.couponId === "string" ? body.couponId : "";
  const token = typeof body?.token === "string" ? body.token : "";
  if (!couponId || !token) return NextResponse.json({ ok: false, error: "缺少必要參數" }, { status: 400 });

  const result = await redeemCoupon(couponId, token);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
