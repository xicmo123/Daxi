import OutagesList from "@/components/OutagesList";
import ResidentIcon from "@/components/resident/ResidentIcon";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/resident/ResidentSkin.module.css";
import { listUpcomingOutages } from "@/lib/outages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/outages",
  title: "大溪停水停電公告",
  description: "台灣自來水公司停水、降壓與台電計畫性停電預告，只列出影響桃園市大溪區的路段與時間。",
});

export const dynamic = "force-dynamic";

export default async function OutagesPage() {
  const outages = await listUpcomingOutages();
  const stats = [
    { label: "停水", value: outages.filter((o) => o.type === "water" && o.severity !== "lowPressure").length },
    { label: "水壓降低", value: outages.filter((o) => o.type === "water" && o.severity === "lowPressure").length },
    { label: "停電", value: outages.filter((o) => o.type === "power").length },
  ];

  return (
    <main>
      <ResidentPageHeader href="/resident/outages" title="停水停電" lead="影響大溪區的停水、降壓與停電預告，一次看完。" />

      <div className={styles.body}>
        <div className={styles.stats}>
          {stats.map((item) => (
            <div key={item.label} className={styles.stat} data-alert={item.value > 0 ? "true" : undefined}>
              <span className={styles.statIcon}>
                <ResidentIcon name="outage" size={18} />
              </span>
              <span>
                <span className={styles.statLabel}>{item.label}</span>
                <span className={styles.statValue} style={{ display: "block" }}>
                  {item.value}
                  <small>則</small>
                </span>
              </span>
            </div>
          ))}
        </div>

        <OutagesList outages={outages} />

        <p className={styles.note}>
          即時串接<b>台灣自來水公司</b>停水公告與<b>台灣電力公司</b>計畫性工作停電資料，僅篩選影響大溪區的項目；水壓降低由公告文字自動判斷，正式時間與範圍仍以官方公告為準。
        </p>
      </div>
    </main>
  );
}
