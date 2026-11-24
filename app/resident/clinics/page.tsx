import { Suspense } from "react";
import ClinicDirectory, { type ClinicRow } from "@/components/resident/ClinicDirectory";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { getCachedClinics } from "@/lib/cachedSources";
import { CLINIC_CATEGORIES, currentSession, SESSIONS, summarizeSchedule, type NhiClinic } from "@/lib/nhiClinics";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/clinics",
  title: "大溪診所、牙醫、藥局看診時間",
  description: "桃園市大溪區所有健保特約診所、牙醫、中醫與藥局的地址、電話與每週看診時段，現在有看診的排在最前面。資料來自健保署，每日更新。",
});

export const dynamic = "force-dynamic";

const NHI_SOURCE = "https://data.gov.tw/dataset/39283";

function toRows(clinics: NhiClinic[]): ClinicRow[] {
  const { day, session } = currentSession();
  const sessionIdx = session ? SESSIONS.indexOf(session) : -1;
  return clinics
    .map((c) => {
      const todayOpen = SESSIONS.filter((_, i) => c.schedule[day]?.[i]);
      return {
        code: c.code,
        name: c.name,
        category: c.category,
        kind: c.kind,
        phone: c.phone,
        address: c.address,
        departments: c.departments,
        remark: c.remark,
        openNow: sessionIdx >= 0 && Boolean(c.schedule[day]?.[sessionIdx]),
        today: todayOpen.length ? todayOpen.join("・") : "休診",
        week: summarizeSchedule(c.schedule),
      };
    })
    .sort((a, b) => Number(b.openNow) - Number(a.openNow) || CLINIC_CATEGORIES.indexOf(a.category) - CLINIC_CATEGORIES.indexOf(b.category));
}

async function Clinics() {
  let clinics: NhiClinic[] = [];
  try {
    clinics = await getCachedClinics();
  } catch {
    clinics = [];
  }
  if (clinics.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>健保署資料暫時讀不到</strong>
        請稍後再試，或到健保署「網路查詢服務」查詢大溪區院所看診時間
      </div>
    );
  }
  const rows = toRows(clinics);
  const openCount = rows.filter((r) => r.openNow).length;
  const { session } = currentSession();
  return (
    <>
      <p className={styles.sectionLead} style={{ marginTop: 0 }}>
        共 {rows.length} 間，{session ? `現在（${session}）看診或營業中 ` : "現在不是一般看診時段，"}
        <b style={{ color: "var(--rj-ok)" }}>{openCount}</b> 間
      </p>
      <ClinicDirectory clinics={rows} />
    </>
  );
}

export default function ResidentClinicsPage() {
  return (
    <main>
      <ResidentPageHeader href="/resident/clinics" title="醫療輪值" lead="大溪區診所、牙醫、中醫與藥局，現在有看診的排在最前面。" />

      <div className={styles.body}>
        <Suspense fallback={<div className={styles.empty}>正在讀取健保署院所資料…</div>}>
          <Clinics />
        </Suspense>
        <p className={styles.note}>
          資料來源：
          <a href={NHI_SOURCE} target="_blank" rel="noopener noreferrer">
            衛生福利部中央健康保險署「健保特約醫事機構」開放資料 ↗
          </a>
          ，每日更新。健保署只登錄上午、下午、晚上三個時段，「看診時段」以上午 8:00–12:00、下午 14:00–17:30、晚上 18:00–21:30 推算；
          實際時間、國定假日與臨時休診以院所公告為準，出發前建議先致電確認。急症請撥 119 或前往急診。
        </p>
      </div>
    </main>
  );
}
