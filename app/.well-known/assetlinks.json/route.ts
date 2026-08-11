import { NextResponse } from "next/server";

// Android App Links — the Play-store equivalent of Universal Links.
//
// ⚠️ ANDROID_CERT_FINGERPRINT must be the SHA-256 fingerprint of the signing
// certificate, uppercase hex with colons. Take it from Play Console →
// 「應用程式完整性」→ 應用程式簽署金鑰憑證, NOT from the local debug keystore —
// Play re-signs uploads, so the upload key's fingerprint will not match what
// devices verify against and links will silently fall back to the browser.
//
// Verify after deploying:
//   https://developers.google.com/digital-asset-links/tools/generator
const PACKAGE_NAME = "daxi.zequo.net";

export const dynamic = "force-dynamic";

export async function GET() {
  const fingerprint = process.env.ANDROID_CERT_FINGERPRINT;
  if (!fingerprint) {
    return NextResponse.json({ error: "ANDROID_CERT_FINGERPRINT is not configured" }, { status: 503 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: [fingerprint],
        },
      },
    ],
    {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    },
  );
}
