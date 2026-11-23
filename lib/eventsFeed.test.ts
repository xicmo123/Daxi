import { describe, expect, it } from "vitest";
import { isEventExpired, type EventFeedSlide } from "./eventsFeed";

const checkedAt = new Date("2026-09-07T10:00:00+08:00");

function event(overrides: Partial<EventFeedSlide>): Pick<EventFeedSlide, "phase" | "isoDate" | "date"> {
  return { phase: "ongoing", date: "", ...overrides };
}

describe("isEventExpired", () => {
  it("does not trust a stale ongoing phase when an ISO date is already over", () => {
    expect(isEventExpired(event({ isoDate: "2026-08-01" }), checkedAt)).toBe(true);
  });

  it("uses the final date in an admin-entered date range", () => {
    expect(isEventExpired(event({ date: "7/19（日）－8/5（三）" }), checkedAt)).toBe(true);
  });

  it("retains an upcoming dated event", () => {
    expect(isEventExpired(event({ phase: "upcoming", isoDate: "2026-11-15" }), checkedAt)).toBe(false);
  });
});
