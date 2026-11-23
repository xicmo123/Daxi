import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { tdxFetch } from "./tdx";
import { fetchDaxiParkingSnapshot, parseTaoyuanParkingXml, withoutStaleParkingCounts } from "./parkingFeed";
import { parkingAvailabilityLabel } from "./tycgParking";
import { parkingCongestion } from "./experience";

vi.mock("./fetchWithTimeout", () => ({ fetchWithTimeout: vi.fn() }));
vi.mock("./tdx", () => ({ tdxFetch: vi.fn() }));

const fetchCity = vi.mocked(fetchWithTimeout);
const fetchTdx = vi.mocked(tdxFetch);
const instant = new Date("2026-11-23T12:13:00+08:00");

const cityXml = (stamp = "2026-11-23 12:12:00") => `<?xml version="1.0" encoding="UTF-8"?>
<parkingLots updatetime="${stamp}">
  <parkingLot><areaName>大溪區</areaName><parkId>P-DS-002</parkId><parkName>橋頭停車場(桃交)</parkName><address>大溪橋旁</address><wgsX>24.885</wgsX><wgsY>121.2805</wgsY><totalSpace>679</totalSpace><surplusSpace>545</surplusSpace></parkingLot>
  <parkingLot><areaName>大溪區</areaName><parkId>P-DS-010</parkId><parkName>月眉停車場</parkName><wgsX>24.889143</wgsX><wgsY>121.287507</wgsY><totalSpace>141</totalSpace><surplusSpace>開放中</surplusSpace></parkingLot>
  <parkingLot><areaName>大溪區</areaName><parkId>zero</parkId><parkName>零車位測試</parkName><wgsX>24.885</wgsX><wgsY>121.288</wgsY><totalSpace>50</totalSpace><surplusSpace>0</surplusSpace></parkingLot>
  <parkingLot><areaName>大溪區</areaName><parkId>blank</parkId><parkName>空白資料測試</parkName><wgsX>24.885</wgsX><wgsY>121.288</wgsY><totalSpace>50</totalSpace><surplusSpace/></parkingLot>
  <parkingLot><areaName>大溪區</areaName><parkId>bad</parkId><parkName>錯誤車位測試</parkName><wgsX>24.885</wgsX><wgsY>121.288</wgsY><totalSpace>50</totalSpace><surplusSpace>-1</surplusSpace></parkingLot>
  <parkingLot><areaName>桃園區</areaName><parkId>other</parkId><parkName>其他區域</parkName></parkingLot>
</parkingLots>`;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(instant);
});

afterEach(() => vi.useRealTimers());

describe("Daxi parking feed", () => {
  it("reads the city XML and distinguishes unknown availability from a confirmed zero", async () => {
    fetchCity.mockResolvedValue(new Response(cityXml()));
    const result = await fetchDaxiParkingSnapshot();
    const get = (id: string) => result.lots.find((lot) => lot.id === id)!;
    expect(result.source).toBe("taoyuan");
    expect(result.updatedAt).toBe("2026-11-23T12:12:00+08:00");
    expect(result.lots).toHaveLength(5);
    expect(get("P-DS-002")).toMatchObject({ surplus: 545, status: "ok" });
    expect(get("zero")).toMatchObject({ surplus: 0, status: "full" });
    for (const id of ["P-DS-010", "blank", "bad"]) {
      expect(get(id)).toMatchObject({ surplus: null, status: null });
      expect(parkingAvailabilityLabel(get(id))).toBe("空位未知");
    }
    expect(fetchTdx).not.toHaveBeenCalled();
    expect(parkingCongestion([get("P-DS-010"), get("blank")]).isCongested).toBe(false);
  });

  it("uses only matched fresh TDX counts when the retired resource responds with an error envelope", async () => {
    fetchCity.mockResolvedValue(new Response('{"success":false,"code":500}'));
    fetchTdx.mockResolvedValue({ ParkingAvailabilities: [
      { CarParkID: "AO090001", TotalSpaces: 83, AvailableSpaces: 60, ServiceStatus: 1, DataCollectTime: "2026-11-23T12:12:00+08:00" },
      { CarParkID: "AO090003", TotalSpaces: 25, AvailableSpaces: 12, ServiceStatus: 1, DataCollectTime: "2026-11-23T11:59:00+08:00" },
    ] });
    const result = await fetchDaxiParkingSnapshot();
    expect(result.source).toBe("tdx");
    expect(result.lots.filter((lot) => lot.surplus !== null).map((lot) => lot.id)).toEqual(["P-DS-006"]);
    expect(result.lots.find((lot) => lot.id === "P-DS-002")?.mapsUrl).toContain("travelmode=driving");
  });

  it("keeps drivable reference locations when both live sources are unusable", async () => {
    fetchCity.mockResolvedValue(new Response(cityXml("2026-11-23 11:50:00")));
    fetchTdx.mockRejectedValue(new Error("TDX temporarily unavailable"));
    const result = await fetchDaxiParkingSnapshot();
    expect(result.source).toBe("reference");
    expect(result.updatedAt).toBeNull();
    expect(result.lots.map((lot) => lot.id)).toEqual(expect.arrayContaining(["P-DS-002", "P-DS-006", "zero"]));
    expect(result.lots.every((lot) => lot.surplus === null && lot.mapsUrl.includes("destination="))).toBe(true);
  });

  it("turns expired cached counts into unknown without dropping the locations", () => {
    const expired = withoutStaleParkingCounts(parseTaoyuanParkingXml(cityXml("2026-11-23 11:50:00")));
    expect(expired.source).toBe("reference");
    expect(expired.lots).toHaveLength(5);
    expect(expired.lots.every((lot) => lot.surplus === null && lot.status === null)).toBe(true);
  });
});
