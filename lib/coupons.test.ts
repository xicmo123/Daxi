import { describe, expect, it } from "vitest";
import { generateRedemptionToken, isCouponRedeemable, taipeiDateKey, type Coupon } from "./coupons";

const coupon: Coupon = {
  id: "offer-1",
  placeId: "place-1",
  title: "測試優惠",
  desc: "",
  redeemMethod: "scan",
  validUntil: "2026-09-06",
  active: true,
  updatedAt: "2026-09-01T00:00:00.000Z",
};

describe("coupon dates and tokens", () => {
  it("uses Taipei's calendar date, including the UTC midnight boundary", () => {
    expect(taipeiDateKey(new Date("2026-09-05T16:00:00.000Z"))).toBe("2026-09-06");
    expect(isCouponRedeemable(coupon, new Date("2026-09-05T16:00:00.000Z"))).toBe(true);
    expect(isCouponRedeemable(coupon, new Date("2026-09-06T16:00:00.000Z"))).toBe(false);
  });

  it("issues a unique scan token for every display", async () => {
    const claimId = "7ef33261-3a1c-4bb6-8f60-47d91e69742f";
    const [first, second] = await Promise.all([generateRedemptionToken(coupon.id, claimId), generateRedemptionToken(coupon.id, claimId)]);
    expect(first.token).not.toBe(second.token);
    expect(first.expiresAt).toBeGreaterThan(first.issuedAt);
  });
});
