import PageHeader from "@/components/PageHeader";
import EmergencyPanel from "@/components/EmergencyPanel";
import { fetchDaxiAEDStations } from "@/lib/aedService";

export const dynamic = "force-dynamic";

export default async function ResidentAEDPage() {
  let stations: Awaited<ReturnType<typeof fetchDaxiAEDStations>> = [];
  try {
    stations = await fetchDaxiAEDStations();
  } catch {
    stations = [];
  }

  return (
    <div className="pt-2">
      <PageHeader title="AED 尋找" subtitle="大溪區自動體外心臟電擊去顫器" tint="red" />
      <div className="safe-page-x pb-10 fade-in">
        <EmergencyPanel stations={stations} />
        <div className="mt-4 text-[11.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          資料來源：
          <a href="https://tw-aed.mohw.gov.tw/" target="_blank" rel="noopener noreferrer" className="underline">
            衛生福利部全國AED急救資訊網
          </a>
          （每日自動更新，僅列出大溪區站點）。發現緊急狀況請先撥打 119。
        </div>
      </div>
    </div>
  );
}
