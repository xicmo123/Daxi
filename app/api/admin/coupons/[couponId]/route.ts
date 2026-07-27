import { NextRequest, NextResponse } from "next/server";
import { deleteCoupon, setCouponActive } from "@/lib/coupons";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ couponId: string }> }) {
  const { couponId } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "active 為必填布林值" }, { status: 400 });
  }
  const coupon = await setCouponActive(couponId, body.active);
  if (!coupon) return NextResponse.json({ error: "找不到這張優惠券" }, { status: 404 });
  return NextResponse.json({ ok: true, coupon });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ couponId: string }> }) {
  const { couponId } = await params;
  const ok = await deleteCoupon(couponId);
  if (!ok) return NextResponse.json({ error: "找不到這張優惠券" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
