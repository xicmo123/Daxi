import { describe, expect, it } from "vitest";
import { walkTimeLabel } from "./experience";

// The regression this file exists for: walkTimeLabel was `distance / 80` with
// no upper bound, so 石門水庫 (~9km from 老街) rendered as 「步行 113 分鐘」 on
// the first card of the home page.
describe("walkTimeLabel", () => {
  it("calls short distances a walk", () => {
    expect(walkTimeLabel(80)).toBe("步行 1 分鐘");
    expect(walkTimeLabel(800)).toBe("步行 10 分鐘");
  });

  it("never rounds a nearby place down to zero minutes", () => {
    expect(walkTimeLabel(0)).toBe("步行 1 分鐘");
    expect(walkTimeLabel(5)).toBe("步行 1 分鐘");
  });

  it("switches to driving past walking range", () => {
    // 1500m is the last walkable step; 1501m must not still say 步行.
    expect(walkTimeLabel(1500)).toBe("步行 19 分鐘");
    expect(walkTimeLabel(1501)).toMatch(/^車程約 \d+ 分鐘$/);
  });

  it("describes 石門水庫 as a drive, not a two-hour walk", () => {
    const label = walkTimeLabel(9000);
    expect(label).not.toContain("步行");
    expect(label).toBe("車程約 23 分鐘");
  });

  it("falls back to distance when a duration would be a guess", () => {
    expect(walkTimeLabel(45_000)).toBe("約 45 公里");
  });

  it("does not invent a number for missing data", () => {
    expect(walkTimeLabel(Number.NaN)).toBe("距離未知");
    expect(walkTimeLabel(-1)).toBe("距離未知");
  });
});
