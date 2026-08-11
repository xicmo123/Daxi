// Server-side push delivery via Firebase Cloud Messaging HTTP v1.
//
// FCM covers both platforms — Android natively, iOS by forwarding to APNs —
// so there is one code path and one credential to manage instead of two.
//
// Required environment (see README「推播設定」):
//   FCM_PROJECT_ID        Firebase project id
//   FCM_CLIENT_EMAIL      service account email
//   FCM_PRIVATE_KEY       service account private key (PEM, \n escaped)
//
// When those are unset — which is the state until the Firebase project and the
// APNs key exist — every send is a no-op that reports back how many devices it
// *would* have reached. That keeps the admin UI and the local-notification
// features usable during development instead of blocking on a credential.
import { removePushToken, tokensForTopic, type PushTopic } from "./pushTokens";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type PushSendResult = {
  configured: boolean;
  attempted: number;
  delivered: number;
  removed: number;
};

function credentials() {
  const projectId = process.env.FCM_PROJECT_ID;
  const clientEmail = process.env.FCM_CLIENT_EMAIL;
  // Stored with escaped newlines because .env files can't hold real ones.
  const privateKey = process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return { projectId, clientEmail, privateKey };
}

export function pushConfigured(): boolean {
  return credentials() !== null;
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Cached because it is valid for an hour and minting one costs an RSA sign
// plus a round trip to Google — doing that per notification would make a
// district-wide broadcast noticeably slower.
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string | null> {
  const creds = credentials();
  if (!creds) return null;

  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: creds.clientEmail,
      scope: FCM_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(creds.privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const assertion = `${header}.${claim}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  cachedAccessToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cachedAccessToken.value;
}

/**
 * Broadcast to every device subscribed to `topic`.
 *
 * Sends one request per token rather than using an FCM topic: subscriptions
 * live in data/push-tokens.json where an admin can see and audit them, and at
 * this app's scale (one district) the request count is not a problem.
 */
export async function sendPush(options: {
  topic: PushTopic;
  title: string;
  body: string;
  /** In-app route to open when tapped, e.g. "/resident/outages". */
  path?: string;
}): Promise<PushSendResult> {
  const tokens = await tokensForTopic(options.topic);
  const result: PushSendResult = { configured: pushConfigured(), attempted: tokens.length, delivered: 0, removed: 0 };

  const token = await accessToken();
  const creds = credentials();
  if (!token || !creds) return result;

  for (const device of tokens) {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${creds.projectId}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token: device.token,
          notification: { title: options.title, body: options.body },
          data: options.path ? { path: options.path } : undefined,
        },
      }),
    }).catch(() => null);

    if (res?.ok) {
      result.delivered += 1;
      continue;
    }

    // 404 UNREGISTERED / 400 INVALID_ARGUMENT mean the token is dead for good
    // (app deleted, token rotated). Anything else may be transient, so only
    // these two prune — a network blip must not wipe the register.
    if (res && (res.status === 404 || res.status === 400)) {
      await removePushToken(device.token);
      result.removed += 1;
    }
  }

  return result;
}
