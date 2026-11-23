import TouristPageHeader from "@/components/TouristPageHeader";
import styles from "@/components/TouristInterior.module.css";

export default function Loading() {
  return (
    <main aria-busy="true">
      <TouristPageHeader title="周邊停車" subtitle="正在載入停車場和空位資訊…" />
      <div className={styles.content} aria-hidden>
        <div className="h-16 rounded-2xl skeleton" style={{ background: "var(--line)" }} />
        <div className={styles.parkingGrid}>
          <div className="h-64 rounded-2xl skeleton" style={{ background: "var(--line)" }} />
          <div className="h-64 rounded-2xl skeleton" style={{ background: "var(--line)" }} />
        </div>
      </div>
    </main>
  );
}
