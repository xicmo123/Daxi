import { Suspense } from "react";
import GarbageTruckMap from "@/components/GarbageTruckMap";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import GarbageTimetable from "@/components/resident/GarbageTimetable";
import SkinIcon from "@/components/skin/SkinIcon";
import styles from "@/components/skin/Skin.module.css";
import { getCachedGarbageSchedule } from "@/lib/cachedSources";
import { jsonLdString, pageMetadata } from "@/lib/seo";
import type { GarbageScheduleRoute } from "@/lib/taoyuanGarbage";

export const metadata = pageMetadata({
  path: "/resident/garbage",
  title: "大溪垃圾車時間與即時位置",
  description:
    "桃園市大溪區垃圾車、資源回收車即時 GPS 位置，以及各清運路線的停靠地點與預定時間。輸入路名就能查你家附近的垃圾車幾點到，資料來源桃園市政府環境管理處。",
});

export const dynamic = "force-dynamic";

const OFFICIAL_URL = "https://route.tyoem.gov.tw";

function earliestAndLatest(schedule: GarbageScheduleRoute[]) {
  const starts = schedule
    .map((r) => r.stops.find((s) => s.time)?.time)
    .filter((t): t is string => Boolean(t))
    .sort((a, b) => a.padStart(5, "0").localeCompare(b.padStart(5, "0")));
  return starts.length ? { first: starts[0], last: starts[starts.length - 1] } : null;
}

function faq(schedule: GarbageScheduleRoute[] | null) {
  const span = schedule ? earliestAndLatest(schedule) : null;
  return [
    {
      q: "大溪的垃圾車幾點來？",
      a: span
        ? `依路線不同。大溪區目前有 ${schedule!.length} 條清運路線，最早的路線約 ${span.first} 出發，最晚的約 ${span.last} 出發。在本頁輸入你家附近的路名，就能看到最近停靠點的預定時間。`
        : "依路線不同。在本頁輸入你家附近的路名，就能看到最近停靠點的預定時間。",
    },
    {
      q: "怎麼知道垃圾車現在開到哪裡？",
      a: "本頁地圖會顯示大溪區目前在線的垃圾車與資源回收車 GPS 位置，每 15 秒更新一次。預定時間只是參考，實際到達可能提早或延後幾分鐘。",
    },
    {
      q: "星期幾不收垃圾？",
      a: "桃園市週日停收垃圾，春節等連續假期另依桃園市政府環境管理處公告。颱風或特殊狀況可能臨時調整，以官方公告為準。",
    },
    {
      q: "資料從哪裡來？",
      a: "路線、停靠點、預定時間與即時位置都來自桃園市政府環境管理處「垃圾清運路線即時查詢系統」。",
    },
  ];
}

async function Timetable() {
  let schedule: GarbageScheduleRoute[] | null = null;
  try {
    schedule = await getCachedGarbageSchedule();
  } catch {
    schedule = null;
  }
  const items = faq(schedule);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <>
      <section aria-labelledby="garbage-timetable">
        <h2 className={styles.panelTitle} id="garbage-timetable" style={{ marginTop: 12 }}>
          <span>
            <SkinIcon name="garbage" size={18} />
          </span>
          各路線停靠點與時間
        </h2>
        {schedule ? (
          <>
            <p className={styles.panelLead}>
              大溪區共 {schedule.length} 條清運路線、{schedule.reduce((n, r) => n + r.stops.length, 0)} 個停靠點。時間為官方排定的預定時間，點開路線看全部停靠點。
            </p>
            <GarbageTimetable schedule={schedule} />
          </>
        ) : (
          <div className={styles.empty}>
            <strong>時刻表暫時讀不到</strong>
            市府清運系統暫時沒有回應，上方即時地圖仍可使用，或到
            <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--rj-main)", fontWeight: 800 }}>
              {" "}官方查詢系統{" "}
            </a>
            查看。
          </div>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="garbage-faq" style={{ marginTop: 8 }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }} />
        <h2 className={styles.panelTitle} id="garbage-faq">
          <span>
            <SkinIcon name="info" size={18} />
          </span>
          常見問題
        </h2>
        <dl>
          {items.map((item) => (
            <div key={item.q} style={{ padding: "12px 4px", borderBottom: "1px solid var(--rj-line)" }}>
              <dt style={{ fontSize: 15.5, fontWeight: 800, color: "var(--rj-ink)" }}>{item.q}</dt>
              <dd style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.75, color: "var(--rj-ink-soft)" }}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

export default function ResidentGarbagePage() {
  return (
    <main>
      <ResidentPageHeader
        href="/resident/garbage"
        title="垃圾車時間與即時位置"
        lead="大溪區垃圾車、資源回收車現在開到哪，以及每條路線幾點停哪裡。"
      />

      <div className={styles.body}>
        <section aria-label="垃圾車即時地圖">
          <GarbageTruckMap />
        </section>

        <Suspense
          fallback={
            <div className={styles.empty}>
              <strong>正在讀取清運時刻表…</strong>
            </div>
          }
        >
          <Timetable />
        </Suspense>

        <p className={styles.note}>
          資料來源：
          <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
            桃園市政府環境管理處 垃圾清運路線即時查詢系統
          </a>
          。時刻表每 12 小時同步一次，即時位置每 15 秒更新；實際收運以清潔隊現場與官方公告為準。
        </p>
      </div>
    </main>
  );
}
