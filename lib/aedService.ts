// AED (自動體外心臟電擊去顫器) station data for Daxi — sourced live from the
// Ministry of Health and Welfare's public AED registry (verified real,
// coordinate-bearing dataset; confirmed by fetching it directly and
// checking for 大溪區 records before wiring this up).
import https from "https";
import tls from "tls";
import { promises as fs } from "fs";
import path from "path";
import { parseCsv } from "./csv";

const SOURCE_URL = "https://tw-aed.mohw.gov.tw/openData?t=csv";
const DAXI_DISTRICT = "大溪區";

// tw-aed.mohw.gov.tw serves only its leaf certificate, omitting the TWCA
// intermediate — browsers/macOS curl paper over this via OS-level AIA
// fetching, but Node's TLS stack (and its built-in `fetch`) does not, so
// every request fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE. Confirmed with
// `openssl s_client -showcerts` (only one cert returned) and fixed by
// supplying the missing intermediate ourselves — fetched from the CA's own
// "CA Issuers" AIA URL in the leaf cert — rather than disabling verification.
const INTERMEDIATE_CERT_PATH = path.join(process.cwd(), "certs", "twca-secure-ssl-intermediate.pem");
let cachedAgent: https.Agent | null = null;

async function getAgent(): Promise<https.Agent> {
  if (cachedAgent) return cachedAgent;
  const intermediate = await fs.readFile(INTERMEDIATE_CERT_PATH, "utf-8");
  cachedAgent = new https.Agent({ ca: [...tls.rootCertificates, intermediate] });
  return cachedAgent;
}

// This one can't use lib/fetchWithTimeout: the AED feed serves an incomplete
// TLS chain, so it needs the custom https.Agent built above. The timeout is
// therefore wired by hand — without it a stalled connection would hang the
// 尋找 AED page indefinitely, which is the worst page in the app to hang.
// The host has also been seen refusing connections from this server outright
// (no TCP handshake at all), so this is an overall deadline for the whole
// download, not just an idle-socket timeout.
const AED_REQUEST_TIMEOUT_MS = 15_000;

function httpsGetText(url: string, agent: https.Agent): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https
      .get(url, { agent, headers: { "User-Agent": "Daxi/0.1 resident AED finder" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`AED open-data request failed: ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      })
      .on("error", reject);

    const deadline = setTimeout(() => {
      request.destroy(new Error(`AED open-data request timed out after ${AED_REQUEST_TIMEOUT_MS}ms`));
    }, AED_REQUEST_TIMEOUT_MS);
    request.on("close", () => clearTimeout(deadline));
  });
}

// The multi-MB CSV response is well over Next.js's fetch data-cache size
// limit (2MB) anyway, so this app's usual `next: { revalidate }` caching
// wouldn't apply here regardless of the TLS fix — a small in-memory cache
// does the same job (the feed's own docs say it updates daily; an hour is
// plenty fresh without re-fetching 5MB on every request).
const CACHE_TTL_MS = 60 * 60 * 1000;
// After a failed download, don't try again for a while — otherwise every
// visit to the page would start another doomed 15-second request.
const FAILURE_BACKOFF_MS = 15 * 60 * 1000;
let cachedStations: { data: AEDStation[]; fetchedAt: number } | null = null;
let lastFailureAt = 0;
let inflight: Promise<AEDStation[]> | null = null;

// Last good download, so the page still lists stations while the feed is
// unreachable. Runtime data (gitignored), rewritten on every success.
const SNAPSHOT_PATH = path.join(process.cwd(), "data", "aed-stations.json");

async function readSnapshot(): Promise<{ data: AEDStation[]; fetchedAt: number } | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(SNAPSHOT_PATH, "utf-8")) as { stations?: AEDStation[]; fetchedAt?: number };
    return Array.isArray(parsed.stations) && parsed.stations.length > 0
      ? { data: parsed.stations, fetchedAt: Number(parsed.fetchedAt) || 0 }
      : null;
  } catch {
    return null;
  }
}

async function writeSnapshot(stations: AEDStation[], fetchedAt: number) {
  try {
    await fs.writeFile(SNAPSHOT_PATH, JSON.stringify({ fetchedAt, stations }, null, 2) + "\n", "utf-8");
  } catch {
    // A read-only disk only costs the fallback, not the page.
  }
}

export type AEDStation = {
  id: string;
  name: string; // 場所名稱
  placement: string; // AED放置地點 — exact spot within the venue
  address: string; // 場所地址
  lat: number;
  lng: number;
  weekdayHours: string | null; // e.g. "08:00–17:00", null if not published
  saturdayHours: string | null;
  sundayHours: string | null;
  note: string | null;
  emergencyPhone: string | null;
};

function formatWindow(from: string, to: string): string | null {
  if (!from && !to) return null;
  const clean = (t: string) => t.slice(0, 5);
  if (from === "00:00:00" && (to === "23:59:00" || to === "24:00:00")) return "24小時開放";
  return `${clean(from)}–${clean(to)}`;
}

function toStation(headers: string[], row: string[], index: number): AEDStation | null {
  const get = (name: string) => row[headers.indexOf(name)]?.trim() ?? "";
  const lat = Number(get("地點LAT"));
  const lng = Number(get("地點LNG"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return null;

  return {
    id: get("AEDID") || `daxi-aed-${index}`,
    name: get("場所名稱"),
    placement: get("AED放置地點") || get("AED地點描述"),
    address: get("場所地址"),
    lat,
    lng,
    weekdayHours: formatWindow(get("周一至周五起"), get("周一至周五迄")),
    saturdayHours: formatWindow(get("周六起"), get("周六迄")),
    sundayHours: formatWindow(get("周日起"), get("周日迄")),
    note: get("開放使用時間備註") || null,
    emergencyPhone: get("開放時間緊急連絡電話") || null,
  };
}

// One retry absorbs a transient blip; more would only stretch out a real outage.
async function fetchCsvWithRetry(attempts = 2): Promise<string> {
  const agent = await getAgent();
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await httpsGetText(SOURCE_URL, agent);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

async function downloadDaxiStations(): Promise<AEDStation[]> {
  const text = await fetchCsvWithRetry();
  const rows = parseCsv(text.replace(/^\uFEFF/, ""));
  const headers = rows[0] ?? [];
  const districtIdx = headers.indexOf("場所區域");
  return rows
    .slice(1)
    .filter((row) => row[districtIdx]?.trim() === DAXI_DISTRICT)
    .map((row, i) => toStation(headers, row, i))
    .filter((s): s is AEDStation => s !== null);
}

function refresh(): Promise<AEDStation[]> {
  inflight ??= downloadDaxiStations()
    .then(async (stations) => {
      if (stations.length === 0) throw new Error("AED feed returned no 大溪區 stations");
      const fetchedAt = Date.now();
      cachedStations = { data: stations, fetchedAt };
      lastFailureAt = 0;
      await writeSnapshot(stations, fetchedAt);
      return stations;
    })
    .catch((err) => {
      lastFailureAt = Date.now();
      console.error("[aed] refresh failed:", err instanceof Error ? err.message : err);
      throw err;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export type AEDResult = { stations: AEDStation[]; fetchedAt: number | null };

/**
 * 大溪區 AED stations without ever holding the page hostage: a fresh copy if
 * one is cached, otherwise whatever the download produces within `waitMs`,
 * otherwise the last saved snapshot (the download keeps going in the
 * background and fills the cache for the next visit).
 */
export async function getDaxiAEDStations(waitMs = 3_000): Promise<AEDResult> {
  if (cachedStations && Date.now() - cachedStations.fetchedAt < CACHE_TTL_MS) {
    return { stations: cachedStations.data, fetchedAt: cachedStations.fetchedAt };
  }
  const snapshot = cachedStations ?? (await readSnapshot());
  cachedStations ??= snapshot;
  const fallback: AEDResult = snapshot ? { stations: snapshot.data, fetchedAt: snapshot.fetchedAt } : { stations: [], fetchedAt: null };

  // Backing off after a failure, or someone else's download is already
  // running: answer with what we have instead of queueing behind it.
  if (Date.now() - lastFailureAt < FAILURE_BACKOFF_MS || inflight) {
    if (!inflight && Date.now() - lastFailureAt >= FAILURE_BACKOFF_MS) refresh().catch(() => {});
    return fallback;
  }

  const attempt = refresh().then((stations): AEDResult => ({ stations, fetchedAt: Date.now() }));
  attempt.catch(() => {});
  const timeout = new Promise<AEDResult>((resolve) => setTimeout(() => resolve(fallback), waitMs));
  return Promise.race([attempt.catch(() => fallback), timeout]);
}
