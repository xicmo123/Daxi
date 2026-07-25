// 交通部運輸資料流通服務平台 (TDX) — OAuth2 client-credentials auth, shared
// by any TDX dataset (currently just Bus realtime). Token is cached in
// module scope and reused until near expiry.
const TOKEN_URL = "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token";
const API_BASE = "https://tdx.transportdata.tw/api/basic";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getTdxToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;

  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("TDX_CLIENT_ID/TDX_CLIENT_SECRET is not set");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TDX auth failed ${res.status}`);

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.token;
}

export async function tdxFetch<T>(path: string): Promise<T> {
  const token = await getTdxToken();
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${API_BASE}${path}${separator}%24format=JSON`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TDX request failed ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}
