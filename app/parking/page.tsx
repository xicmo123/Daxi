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
        subtitle={liveDataFailed ? "即時資料暫時無法取得" : "距大溪老街由近到遠・每分鐘更新"}
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
            <a
              key={lot.name}
              href={lot.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl card-shadow p-4 flex items-center gap-3.5 transition-transform active:scale-[0.98]"
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
                  距老街 {lot.distanceLabel}・{lot.isOpenAccess ? `總車位 ${lot.total}` : `剩餘 ${lot.surplus}/${lot.total}`}
                </div>
                <div className="text-[11.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                  {lot.address}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className="text-[11px] font-bold rounded-full px-2.5 py-1"
                  style={{ background: style.bg, color: style.fg }}
                >
                  {lot.statusLabel}
                </span>
                <span className="flex items-center gap-0.5 text-[10.5px]" style={{ color: "var(--cognac-deep)" }}>
                  導航
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </span>
              </div>
            </a>
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
        （僅列出公有路外停車場，路邊停車格未包含在內；距離以大溪老街和平路豆干街一帶為基準點）
      </div>
    </div>
  );
}
