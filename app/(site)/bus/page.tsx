import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BusMap from "@/components/BusMap";

export const metadata: Metadata = {
  title: "大溪公車即時動態",
  description: "大溪地區公車即時 GPS 位置與到站時間，資料來源為交通部運輸資料流通服務平台（TDX），每 15 秒更新。",
  alternates: { canonical: "/bus" },
  openGraph: {
    title: "大溪公車即時動態 ｜ 大溪通",
    description: "大溪地區公車即時位置與到站時間。",
    url: "/bus",
  },
};

export default function BusPage() {
  return (
    <div className="pt-2">
      <PageHeader title="公車資訊" subtitle="以目前定位為中心的即時公車位置" tint="river" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-4">
        <BusMap />
        <div className="rounded-2xl border px-4 py-3.5 text-[11.5px] leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          資料來源：交通部運輸資料流通服務平台（TDX），每 15 秒更新一次即時公車 GPS 位置，僅顯示目前有 GPS 回傳訊號的車輛；未列出路線代表該路線暫無班次在路上，並非停駛。
        </div>
      </div>
    </div>
  );
}
