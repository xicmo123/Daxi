import { NextRequest, NextResponse } from "next/server";
import { deleteMerchantAccount, setMerchantAccountDisabled, updateMerchantAccount } from "@/lib/merchantAccounts";
import { hashPasscode } from "@/lib/passcodeHash";
import { appendAuditLog } from "@/lib/auditLog";
import { clientIp } from "@/lib/rateLimit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const decodedPlaceId = decodeURIComponent(placeId);
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  // Disable/enable is a distinct, minimal action from editing the profile —
  // keep it a separate branch so toggling status never requires resending
  // businessName/passcode.
  if (typeof body.disabled === "boolean" && body.businessName === undefined) {
    const updated = await setMerchantAccountDisabled(decodedPlaceId, body.disabled);
    if (!updated) return NextResponse.json({ error: "找不到這個商家帳號" }, { status: 404 });
    await appendAuditLog({
      action: body.disabled ? "merchant.disable" : "merchant.enable",
      target: decodedPlaceId,
      ip: clientIp(request),
    });
    return NextResponse.json({ ok: true });
  }

  const { businessName, passcode } = body;
  if (typeof businessName !== "string" || !businessName.trim()) return NextResponse.json({ error: "businessName 為必填" }, { status: 400 });
  const trimmedPasscode = typeof passcode === "string" ? passcode.trim() : "";
  if (trimmedPasscode && trimmedPasscode.length < 6) return NextResponse.json({ error: "passcode 至少需要 6 個字元" }, { status: 400 });

  const ok = await updateMerchantAccount(decodedPlaceId, {
    businessName: businessName.trim(),
    passcode: trimmedPasscode ? await hashPasscode(trimmedPasscode) : undefined,
  });
  if (!ok) return NextResponse.json({ error: "找不到這個商家帳號" }, { status: 404 });
  await appendAuditLog({
    action: "merchant.update",
    target: decodedPlaceId,
    detail: trimmedPasscode ? "資料 + 通關密語" : "資料",
    ip: clientIp(request),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const decodedPlaceId = decodeURIComponent(placeId);
  const ok = await deleteMerchantAccount(decodedPlaceId);
  if (!ok) return NextResponse.json({ error: "找不到這個商家帳號" }, { status: 404 });
  await appendAuditLog({ action: "merchant.delete", target: decodedPlaceId, ip: clientIp(request) });
  return NextResponse.json({ ok: true });
}
