import PageHeader from "@/components/PageHeader";
import { statusStyle } from "@/lib/status";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";

export const revalidate = 60;

export default async function ParkingPage() {
  let lots: LiveParkingLot[] = [];
  let liveDataFailed = false;

  try {
    lots = await fetchDaxiParking();
  } catch {
    liveDataFailed = true;
  }

  return (
    <div className="pt-2">
      <PageHeader
        title="周邊停車"
        subtitle={liveDataFailed ? "即時資料暫時無法取得" : "桃園市開放資料平台・每分鐘更新"}
      />

      {liveDataFailed ? (
        <div className="px-5 pb-4">
          <div
            className="rounded-2xl p-4 text-[13px]"
            style={{ background: "var(--bordeaux-tint)", color: "var(--bordeaux)" }}
          >
            目前無法連線至桃園市即時停車資料，請稍後重新整理頁面。
          </div>
        </div>
      ) : null}

      <div className="px-5 flex flex-col gap-3 pb-8">
        {lots.map((lot) => {
          const style = statusStyle[lot.status];
          return (
            <div
              key={lot.name}
              className="rounded-2xl card-shadow p-4 flex items-center gap-3.5"
              style={{ background: "var(--card)", border: "1px solid var(--line)" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 text-center leading-tight"
                style={{ background: style.bg, color: style.fg }}
              >
                {lot.isOpenAccess ? "open" : `${lot.pct}%`}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold mb-0.5 truncate">{lot.name}</div>
                <div className="text-[12.5px] font-semibold mb-0.5" style={{ color: "var(--ink)" }}>
                  {lot.isOpenAccess ? `總車位 ${lot.total}` : `剩餘 ${lot.surplus}/${lot.total}`}
                </div>
                <div className="text-[11.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                  {lot.address}
                </div>
              </div>
              <span
                className="text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0"
                style={{ background: style.bg, color: style.fg }}
              >
                {lot.statusLabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-8 text-[11px]" style={{ color: "var(--ink-soft)" }}>
        資料來源：
        <a
          href="https://data.gov.tw/dataset/25940"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          桃園市路外停車資訊｜政府資料開放平臺
        </a>
        （僅列出公有路外停車場，路邊停車格未包含在內）
      </div>
    </div>
  );
}
