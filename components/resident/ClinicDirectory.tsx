"use client";

import { useState } from "react";
import type { ClinicCategory } from "@/lib/nhiClinics";
import styles from "@/components/skin/Skin.module.css";

export type ClinicRow = {
  code: string;
  name: string;
  category: ClinicCategory;
  kind: string;
  phone: string | null;
  address: string;
  departments: string[];
  remark: string | null;
  openNow: boolean;
  today: string; // 「上午・下午」 or 「休診」
  week: string; // summarizeSchedule()
};

const FILTERS: Array<ClinicCategory | "全部"> = ["全部", "西醫", "牙醫", "中醫", "藥局"];

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// Every clinic is in the server HTML (so search engines read the addresses
// and hours); the chips only hide cards.
export default function ClinicDirectory({ clinics }: { clinics: ClinicRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("全部");
  const [openOnly, setOpenOnly] = useState(false);
  const shown = clinics.filter((c) => (filter === "全部" || c.category === filter) && (!openOnly || c.openNow));

  return (
    <div>
      <div className={styles.chips} role="group" aria-label="篩選院所類別">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={styles.chip} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f}
            {f !== "全部" ? ` ${clinics.filter((c) => c.category === f).length}` : ""}
          </button>
        ))}
        <button type="button" className={styles.chip} aria-pressed={openOnly} onClick={() => setOpenOnly((v) => !v)}>
          只看現在有開
        </button>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty} style={{ marginTop: 16 }}>
          <strong>這個時段沒有符合的院所</strong>
          取消「只看現在有開」或換個類別看看
        </div>
      ) : (
        <div className={styles.cardGrid} data-cols="3" style={{ marginTop: 16 }}>
          {shown.map((c) => (
            <article key={c.code} className={styles.infoCard}>
              <div className={styles.infoCardTop}>
                <span className={styles.badge} data-tone="main">
                  {c.category}
                </span>
                <span className={styles.badge} data-tone={c.openNow ? "ok" : undefined}>
                  {c.openNow ? (c.category === "藥局" ? "營業時段" : "看診時段") : c.category === "藥局" ? "非營業時段" : "非看診時段"}
                </span>
              </div>
              <h3>{c.name}</h3>
              {c.departments.length > 0 ? <p style={{ marginTop: 2 }}>{c.departments.join("・")}</p> : null}
              <p>{c.address}</p>
              {c.phone ? <p>電話 {c.phone}</p> : null}
              <p>
                <b style={{ color: "var(--rj-ink)" }}>今天：</b>
                {c.today}
              </p>
              <p style={{ fontSize: 13 }}>{c.week}</p>
              {c.remark ? <p style={{ fontSize: 13, color: "var(--rj-alert)" }}>院所備註：{c.remark}</p> : null}
              <div className={styles.btnRow} style={{ marginTop: 12, gridTemplateColumns: c.phone ? "1fr 1fr" : "1fr" }}>
                {c.phone ? (
                  <a className={styles.btn} href={telHref(c.phone)} style={{ minHeight: 42 }}>
                    撥打電話
                  </a>
                ) : null}
                <a
                  className={styles.btn}
                  data-variant="line"
                  style={{ minHeight: 42 }}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name} ${c.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  導航
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
