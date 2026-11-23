import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { readClinics, withOpenStatus } from "@/lib/clinicData";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/clinics",
  title: "大溪診所與藥局輪值",
  description: "大溪區診所、藥局門診時間與假日輪值，現在有開的排在最前面，附地址與電話。",
});

export const dynamic = "force-dynamic";

export default async function ResidentClinicsPage() {
  const rows = withOpenStatus(await readClinics());
  const openCount = rows.filter((c) => c.isOpenNow).length;

  return (
    <main>
      <ResidentPageHeader href="/resident/clinics" title="醫療輪值" lead="大溪區診所、藥局，現在有開的排在最前面。" />

      <div className={styles.body}>
        {rows.length === 0 ? (
          <div className={styles.empty}>
            <strong>診所資料建置中</strong>
            尚無經核實的大溪區診所／藥局時刻表資料，之後會陸續補上
          </div>
        ) : (
          <>
            <p className={styles.sectionLead} style={{ marginTop: 0 }}>
              共 {rows.length} 間，現在有開 <b style={{ color: "var(--rj-ok)" }}>{openCount}</b> 間
            </p>
            <div className={styles.cardGrid} data-cols="3">
              {rows.map((clinic) => (
                <article key={clinic.id} className={styles.infoCard}>
                  <div className={styles.infoCardTop}>
                    <span className={styles.bulletinMeta} style={{ margin: 0 }}>
                      <span className={styles.badge} data-tone="main">
                        {clinic.type}
                      </span>
                      {clinic.isHolidayDuty ? (
                        <span className={styles.badge} data-tone="alert">
                          假日急診
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.badge} data-tone={clinic.isOpenNow ? "ok" : undefined}>
                      {clinic.isOpenNow ? "現在有開" : "已休診"}
                    </span>
                  </div>
                  <h3>{clinic.name}</h3>
                  <p>{clinic.address}</p>
                  {clinic.phone ? (
                    <a href={`tel:${clinic.phone}`} className={styles.infoCardLink}>
                      ☎ {clinic.phone}
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
            <p className={styles.note}>營業狀態依登錄的門診時刻推算，國定假日或臨時休診可能不同，出發前建議先致電確認。</p>
          </>
        )}
      </div>
    </main>
  );
}
