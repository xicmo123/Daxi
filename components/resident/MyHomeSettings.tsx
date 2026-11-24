"use client";

import { useState, useSyncExternalStore } from "react";
import HomeSetup from "@/components/resident/HomeSetup";
import SkinIcon from "@/components/skin/SkinIcon";
import styles from "@/components/skin/Skin.module.css";
import { readResidentHome, subscribeResidentHome, type HomeStop, type ResidentHome } from "@/lib/residentHome";

function serverHome(): ResidentHome | null {
  return null;
}

// 我家 as it appears in 我的設定: a summary with 修改, or the setup form.
// Same store as the home-page board and the outages page.
export default function MyHomeSettings({ stops }: { stops: HomeStop[] }) {
  const home = useSyncExternalStore(subscribeResidentHome, readResidentHome, serverHome);
  const [editing, setEditing] = useState(false);

  if (home === null) return <div className="skeleton" style={{ minHeight: 120, borderRadius: 20, background: "var(--rj-surface)" }} />;
  if (editing || (!home.village && !home.stop)) {
    return <HomeSetup stops={stops} initial={home} firstTime={!home.village && !home.stop} editing={editing} onDone={() => setEditing(false)} />;
  }

  return (
    <section className={styles.panel} aria-labelledby="myhome-title" style={{ padding: "20px 18px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <h2 className={styles.panelTitle} id="myhome-title" style={{ margin: 0 }}>
          <span>
            <SkinIcon name="profile" size={18} />
          </span>
          我家
        </h2>
        <button type="button" className={styles.more} onClick={() => setEditing(true)} style={{ cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 800 }}>
          修改
        </button>
      </div>
      <div className={styles.row}>
        <span className="min-w-0">
          <strong>里別</strong>
          <small>停水停電公告用它比對</small>
        </span>
        <span className={styles.rowValue} style={{ fontSize: 15 }}>
          {home.village ?? "未設定"}
        </span>
      </div>
      <div className={styles.row}>
        <span className="min-w-0">
          <strong>垃圾車站</strong>
          <small>{home.stop ? `${home.stop.name} · ${home.stop.routeLabel}` : "首頁會顯示垃圾車幾點來、附近施工"}</small>
        </span>
        <span className={styles.rowValue} style={{ fontSize: 15 }}>
          {home.stop ? (home.stop.time ?? "—") : "未設定"}
        </span>
      </div>
      <p className={styles.panelLead} style={{ margin: "10px 2px 0", fontSize: 13 }}>
        首頁的「我家」看板和停水停電頁都用這組設定，只存在這支手機。
      </p>
    </section>
  );
}
