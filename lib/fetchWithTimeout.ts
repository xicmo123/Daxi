// Every upstream this app depends on is a third-party government or platform
// API (CWA, TDX, 桃園市府 open data, 台電/台水, Google Places). None of them
// promise a response time, and `fetch` has no default timeout — so a single
// hung upstream would keep a force-dynamic page rendering forever and the user
// would sit on a skeleton until the platform's own request timeout fired.
//
// Wrapping every outbound call in an abort signal turns that open-ended hang
// into a fast, catchable failure the UI can actually report.
export const DEFAULT_TIMEOUT_MS = 6_000;

export class UpstreamTimeoutError extends Error {
  constructor(url: string, timeoutMs: number) {
    super(`Upstream timed out after ${timeoutMs}ms: ${url}`);
    this.name = "UpstreamTimeoutError";
  }
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  // AbortSignal.any lets a caller-supplied signal still work alongside ours.
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  try {
    return await fetch(url, { ...init, signal });
  } catch (error) {
    // AbortSignal.timeout rejects with a TimeoutError DOMException; surface it
    // as something callers can distinguish from a genuine network failure.
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new UpstreamTimeoutError(url, timeoutMs);
    }
    throw error;
  }
}

/**
 * Result of reading a third-party source.
 *
 * The point of this type is to stop the app from rendering "0" when it means
 * "unknown". Before this, every upstream read was wrapped in
 * `try { … } catch { count = 0 }`, so a 停水停電 API outage rendered as
 * "停水停電 0" — which a resident reads as "nothing is wrong today". For civic
 * data that is worse than showing nothing.
 */
export type SourceResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function readSource<T>(load: () => Promise<T>): Promise<SourceResult<T>> {
  try {
    return { ok: true, data: await load() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
