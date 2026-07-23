import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { statusWeight, statusBarColor } from "@/lib/status";
import { fetchDaxiParking, type LiveParkingLot } from "@/lib/tycgParking";
import { fetchNearbyParking, type NearbyParkingLot } from "@/lib/googlePlacesParking";
import { parkingSummary, walkTimeLabel } from "@/lib/experience";

// Rough average walking pace (~80m/min) — a static, indicative label only.
export const revalidate = 60;

type Row =
  | ({ kind: "public" } & LiveParkingLot)
  | ({ kind: "private" } & NearbyParkingLot);

export default async function ParkingPage() {
  let lots: LiveParkingLot[] = [];
  let liveDataFailed = false;

  try {
    lots = await fetchDaxiParking();
  } catch {
    liveDataFailed = true;
  }

  let nearbyLots: NearbyParkingLot[] = [];
  try {
    nearbyLots = await fetchNearbyParking(lots.map((l) => ({ lat: l.lat, lng: l.lng })));
  } catch {
    nearbyLots = [];
  }

  const rows: Row[] = [
    ...lots.map((l): Row => ({ kind: "public", ...l })),
    ...nearbyLots.map((l): Row => ({ kind: "private", ...l })),
  ].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const summary = parkingSummary(lots);

  return (
    <div className="pt-2">
      <PageHeader
        title="周邊停車"
        subtitle={liveDataFailed ? "即時資料暫時整理中" : "距大溪老街由近到遠・每分鐘更新"}
        tint="river"
      />

      <div className="safe-page-x pb-4 fade-in">
        <Link
          href="/weather"
          className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-opacity active:opacity-70"
          style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--paper-2)", color: "var(--ink)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="7" width="10.5" height="8.5" rx="2.3" />
                <path d="m14.5 10 5.5-2.8v8.6L14.5 13" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium" style={{ color: "var(--ink)" }}>
                即時影像與天氣路況
              </span>
              <span className="block text-[11.5px] truncate" style={{ color: "var(--ink-soft)" }}>
                出發前確認現場狀態
              </span>
            </span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-soft)" }}>
            <path d="m9 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {!liveDataFailed && lots.length > 0 ? (
        <div className="safe-page-x pb-5 fade-in">
          <div
            className="rounded-xl px-4 py-4"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] mb-1" style={{ color: "var(--accent-fg-soft)" }}>
                  現在建議
                </div>
                <div className="font-serif text-[20px] font-semibold leading-snug">
                  {summary.recommended ? summary.recommended.name : "公有停車場偏滿"}
                </div>
                <div className="text-[12px] mt-1" style={{ color: "var(--accent-fg-soft)" }}>
                  {summary.recommended
                    ? `距老街 ${summary.recommended.distanceLabel}・步行約 ${walkTimeLabel(summary.recommended.distanceMeters)}`
                    : "先查看下方鄰近停車場，或改搭接駁/步行進入老街"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-[26px] leading-none">
                  {summary.availableStalls}
                </div>
                <div className="text-[10.5px] mt-1" style={{ color: "var(--accent-fg-soft)" }}>
                  即時剩餘格
                </div>
              </div>
            </div>
            {summary.recommended ? (
              <a
                href={summary.recommended.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-80"
                style={{ background: "#fff", color: "var(--block-wood-deep)" }}
              >
                導航到建議停車場
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {liveDataFailed ? (
        <div className="safe-page-x pb-4">
          <div className="text-[13px] py-4" style={{ color: "var(--ink-soft)", borderTop: "1px solid var(--line)" }}>
            即時停車資料暫時整理中，請稍後再回來看看。
          </div>
        </div>
      ) : null}

      <div className="safe-page-x pb-10 fade-in" style={{ borderTop: "1px solid var(--line)" }}>
        {rows.map((row, i) => {
          const key = row.kind === "public" ? row.name : row.placeId;
          const isFull = row.kind === "public" && row.status === "full";
          const weight = row.kind === "public" ? statusWeight[row.status] : null;

          return (
            <a
              key={key}
              href={isFull ? undefined : row.mapsUrl}
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
                  {row.name}
                </div>
                <div className="text-[12px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                  距老街 {row.distanceLabel}
                </div>
                {row.address ? (
                  <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "var(--ink-soft)" }}>
                    {row.address}
                  </div>
                ) : null}
                {row.kind === "private" ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className="text-[10.5px] tracking-wide rounded-full px-2 py-0.5"
                      style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
                    >
                      僅供位置參考
                    </span>
                    <span
                      className="text-[10.5px] tracking-wide rounded-full px-2 py-0.5"
                      style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
                    >
                      步行至老街約 {walkTimeLabel(row.distanceMeters)}
                    </span>
                  </div>
                ) : null}
                {row.kind === "public" && !isFull && !row.isOpenAccess ? (
                  <div className="mt-3 h-[3px] w-full max-w-[140px] rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${row.pct}%`, background: statusBarColor[row.status] }}
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {row.kind === "public" ? (
                  isFull ? (
                    <div className="font-serif text-lg" style={{ color: "var(--ink-soft)" }}>
                      目前滿位
                    </div>
                  ) : (
                    <div
                      className={`font-serif text-2xl tracking-tight tabular-nums ${weight!.label}`}
                      style={{ color: weight!.fg }}
                    >
                      {row.isOpenAccess ? "開放" : `${row.pct}%`}
                    </div>
                  )
                ) : (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{ background: "var(--daxi-red-soft)", color: "var(--daxi-red)" }}
                  >
                    導航
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </span>
                )}
                <div className="text-[10.5px] tracking-wide" style={{ color: "var(--ink-soft)" }}>
                  {row.kind === "public"
                    ? isFull
                      ? "建議改往鄰近停車場"
                      : row.isOpenAccess
                        ? `總車位 ${row.total}`
                        : `剩餘 ${row.surplus}/${row.total}`
                    : ""}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="safe-page-x pb-10 text-[11px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        資料來源：
        <a href="https://data.gov.tw/dataset/25940" target="_blank" rel="noopener noreferrer" className="underline">
          桃園市路外停車資訊｜政府資料開放平臺
        </a>
        （公有路外停車場，含即時空位；距離以大溪老街和平路豆干街一帶為基準點）、
        <a
          href="https://developers.google.com/maps/documentation/places/web-service/nearby-search"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Google Maps Places API
        </a>
        （半徑 3 公里內的其他停車場，僅列出位置，車位數量與即時空位 Google 未開放查詢，請以現場狀況為準）
      </div>
    </div>
  );
}
