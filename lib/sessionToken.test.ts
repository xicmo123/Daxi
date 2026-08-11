import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The epoch store is a JSON file; stub it so these tests are about the token
// logic and don't touch data/.
let epoch = 1;
vi.mock("./jsonStore", () => ({
  dataPath: (name: string) => `/virtual/${name}`,
  readJsonFile: async () => ({ admin: epoch, merchant: epoch }),
  updateJsonFile: async (_path: string, _fallback: unknown, update: (current: unknown) => unknown) => {
    const next = update({ admin: epoch, merchant: epoch }) as Record<string, number>;
    epoch = next.admin ?? next.merchant ?? epoch;
    return next;
  },
}));

const { ADMIN_SESSION_TTL_MS, bumpEpoch, signSession, verifySession } = await import("./sessionToken");

describe("session tokens", () => {
  beforeEach(() => {
    epoch = 1;
    process.env.ADMIN_SESSION_SECRET = "test-secret-not-used-anywhere-real";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips a subject", async () => {
    const token = await signSession("merchant", "ChIJplace123", ADMIN_SESSION_TTL_MS);
    expect(await verifySession("merchant", token)).toEqual({ subject: "ChIJplace123" });
  });

  it("rejects a token from another scope", async () => {
    // Otherwise a merchant's own cookie would authenticate them as an admin.
    const token = await signSession("merchant", "ChIJplace123", ADMIN_SESSION_TTL_MS);
    expect(await verifySession("admin", token)).toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const token = await signSession("admin", "", ADMIN_SESSION_TTL_MS);
    const parts = token.split(".");
    parts[3] = parts[3].replace(/.$/, (c) => (c === "a" ? "b" : "a"));
    expect(await verifySession("admin", parts.join("."))).toBeNull();
  });

  it("rejects a token whose expiry was pushed out by hand", async () => {
    const token = await signSession("admin", "", ADMIN_SESSION_TTL_MS);
    const parts = token.split(".");
    parts[1] = String(Number(parts[1]) + 86_400_000);
    // The expiry is inside the signed payload, so editing it breaks the HMAC.
    expect(await verifySession("admin", parts.join("."))).toBeNull();
  });

  it("expires", async () => {
    vi.useFakeTimers();
    const token = await signSession("admin", "", 1000);
    vi.advanceTimersByTime(1001);
    expect(await verifySession("admin", token)).toBeNull();
  });

  it("is invalidated by bumping the epoch", async () => {
    const token = await signSession("admin", "", ADMIN_SESSION_TTL_MS);
    expect(await verifySession("admin", token)).not.toBeNull();

    await bumpEpoch("admin");
    expect(await verifySession("admin", token)).toBeNull();
  });

  it("rejects junk without throwing", async () => {
    expect(await verifySession("admin", undefined)).toBeNull();
    expect(await verifySession("admin", "")).toBeNull();
    expect(await verifySession("admin", "a.b.c")).toBeNull();
    expect(await verifySession("admin", "x.y.z.w")).toBeNull();
  });
});
