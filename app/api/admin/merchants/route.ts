import { NextRequest, NextResponse } from "next/server";
import { createMerchantAccount, listMerchantAccounts } from "@/lib/merchantAccounts";
import { hashPasscode } from "@/lib/passcodeHash";
import { appendAuditLog } from "@/lib/auditLog";
import { clientIp } from "@/lib/rateLimit";

export async function GET() {
  const accounts = await listMerchantAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { placeId, businessName, passcode } = body;
  if (typeof placeId !== "string" || !placeId.trim()) return NextResponse.json({ error: "請選擇要開通的地點" }, { status: 400 });
  if (typeof businessName !== "string" || !businessName.trim()) return NextResponse.json({ error: "businessName 為必填" }, { status: 400 });
  if (typeof passcode !== "string" || passcode.trim().length < 6) return NextResponse.json({ error: "passcode 至少需要 6 個字元" }, { status: 400 });

  try {
    await createMerchantAccount({
      placeId: placeId.trim(),
      businessName: businessName.trim(),
      passcode: await hashPasscode(passcode.trim()),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "建立失敗" }, { status: 400 });
  }
  await appendAuditLog({
    action: "merchant.create",
    target: placeId.trim(),
    detail: businessName.trim(),
    ip: clientIp(request),
  });
  return NextResponse.json({ ok: true });
}
