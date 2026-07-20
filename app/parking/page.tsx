import PageHeader from "@/components/PageHeader";
import { statusWeight } from "@/lib/status";
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
        subtitle={liveDataFailed ? "即時資料暫時整理中" : "距大溪老街由近到遠・每分鐘更新"}
      />

      {liveDataFailed ? (
        <div className="px-6 pb-4">
          <div className="text-[13px] py-4" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)" }}>
            即時停車資料暫時整理中，請稍後再回來看看。
          </div>
        </div>
      ) : null}

      <div className="px-6 pb-10 fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {lots.map((lot, i) => {
          const weight = statusWeight[lot.status];
          const isFull = lot.status === "full";
          return (
            <a
              key={lot.name}
              href={isFull ? undefined : lot.mapsUrl}
              target={isFull ? undefined : "_blank"}
              rel={isFull ? undefined : "noopener noreferrer"}
              aria-disabled={isFull || undefined}
              className={`flex items-center justify-between gap-5 py-6 transition-opacity ${isFull ? "cursor-default" : "active:opacity-60"}`}
              style={{
                borderBottom: "1px solid var(--line)",
                animationDelay: `${Math.min(i, 6) * 40}ms`,
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-serif mb-1.5 truncate" style={{ color: isFull ? "var(--ink-soft)" : "var(--ink)" }}>
                  {lot.name}
                </div>
                <div className="text-[12px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                  距老街 {lot.distanceLabel}
                </div>
                <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                  {lot.address}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isFull ? (
                  <div className="font-serif text-lg" style={{ color: "var(--ink-soft)" }}>
                    目前滿位
                  </div>
                ) : (
                  <div
                    className={`font-serif text-3xl tracking-tight tabular-nums ${weight.label}`}
                    style={{ color: weight.fg }}
                  >
                    {lot.isOpenAccess ? "開放" : `${lot.pct}%`}
                  </div>
                )}
                <div className="text-[10.5px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                  {isFull
                    ? "建議改往鄰近停車場"
                    : lot.isOpenAccess
                      ? `總車位 ${lot.total}`
                      : `剩餘 ${lot.surplus}/${lot.total}`}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="px-6 pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
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
