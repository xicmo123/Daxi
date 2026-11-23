import Link from "next/link";
import ResidentIcon from "@/components/resident/ResidentIcon";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import { DAXI_OFFICE_URL } from "@/components/resident/ResidentFooter";
import styles from "@/components/resident/ResidentSkin.module.css";
import { readUsefulLinks } from "@/lib/usefulLinks";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/services",
  title: "大溪里民服務：陳情報修與緊急電話",
  description: "大溪居民陳情報修管道、1999 市民專線、110/119/165 緊急電話，以及戶政、地政、稅務常用連結。",
});

export const dynamic = "force-dynamic";

const CONTACTS = [
  { label: "警察報案", phone: "110" },
  { label: "消防／救護", phone: "119" },
  { label: "婦幼保護專線", phone: "113" },
  { label: "反詐騙諮詢專線", phone: "165" },
  { label: "桃園市民專線", phone: "1999" },
];

export default async function ResidentServicesPage() {
  const usefulLinks = await readUsefulLinks();

  return (
    <main>
      <ResidentPageHeader
        href="/resident/services"
        title="里民服務"
        lead="生活大小事，這裡先找。"
        tabs={[
          { href: "#report", label: "陳情 / 報修" },
          { href: "#emergency", label: "緊急聯絡" },
          { href: "#links", label: "常用連結" },
        ]}
      />

      <div className={styles.body}>
        <section id="report" className={styles.panel} aria-labelledby="report-title">
          <h2 id="report-title" className={styles.panelTitle}>
            <span>
              <ResidentIcon name="report" size={18} />
            </span>
            陳情 / 報修
          </h2>
          <p className={styles.panelLead}>路燈故障、道路坑洞、路樹倒伏等問題，可撥打市民專線或前往區公所網站陳情信箱通報。</p>
          <div className={styles.btnRow}>
            <a href="tel:1999" className={styles.btn}>
              撥打市民專線 1999
            </a>
            <a href={DAXI_OFFICE_URL} target="_blank" rel="noreferrer" className={styles.btn} data-variant="line">
              前往區公所線上陳情 ↗
            </a>
          </div>
        </section>

        <section id="emergency" className={styles.panel} aria-labelledby="emergency-title">
          <h2 id="emergency-title" className={styles.panelTitle}>
            <span>
              <ResidentIcon name="phone" size={18} />
            </span>
            緊急聯絡
          </h2>
          <div>
            {CONTACTS.map((c) => (
              <a key={c.phone} href={`tel:${c.phone}`} className={styles.row}>
                <strong>{c.label}</strong>
                <span className={styles.rowValue}>{c.phone}</span>
              </a>
            ))}
          </div>
          <Link href="/resident/aed" className={styles.btn} data-variant="alert" style={{ width: "100%", marginTop: 14 }}>
            尋找最近的 AED <span aria-hidden>→</span>
          </Link>
        </section>

        <section id="links" className={styles.panel} aria-labelledby="links-title">
          <h2 id="links-title" className={styles.panelTitle}>
            <span>
              <ResidentIcon name="link" size={18} />
            </span>
            常用連結
          </h2>
          <div>
            {usefulLinks.map((l) => (
              <a key={l.id} href={l.href} target="_blank" rel="noreferrer" className={styles.row}>
                <span>
                  <strong>{l.label}</strong>
                  {l.note ? <small>{l.note}</small> : null}
                </span>
                <span aria-hidden style={{ color: "var(--rj-ink-faint)" }}>
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
