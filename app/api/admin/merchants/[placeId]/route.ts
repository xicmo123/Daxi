import { NextRequest, NextResponse } from "next/server";
import { deleteMerchantAccount, updateMerchantAccount } from "@/lib/merchantAccounts";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { businessName, passcode } = body;
  if (typeof businessName !== "string" || !businessName.trim()) return NextResponse.json({ error: "businessName 為必填" }, { status: 400 });
  if (typeof passcode !== "string" || passcode.trim().length < 6) return NextResponse.json({ error: "passcode 至少需要 6 個字元" }, { status: 400 });

  const ok = await updateMerchantAccount(decodeURIComponent(placeId), { businessName: businessName.trim(), passcode: passcode.trim() });
  if (!ok) return NextResponse.json({ error: "找不到這個商家帳號" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const ok = await deleteMerchantAccount(decodeURIComponent(placeId));
  if (!ok) return NextResponse.json({ error: "找不到這個商家帳號" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
