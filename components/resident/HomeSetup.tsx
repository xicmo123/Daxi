"use client";

import { useMemo, useState } from "react";
import SkinIcon from "@/components/skin/SkinIcon";
import styles from "@/components/skin/Skin.module.css";
import { DAXI_VILLAGES } from "@/lib/daxiVillages";
import { readLegacyArea, writeResidentHome, type HomeStop, type ResidentHome } from "@/lib/residentHome";

// The one place a resident says where they live: their 里 (matched against
// outage notices) and their garbage-truck stop (time, road name, and the
// coordinates nearby roadworks are measured from). Used by the 我家 board on
// the home page and by 我的設定.
export default function HomeSetup({
  stops,
  initial,
  firstTime,
  editing,
  onDone,
}: {
  stops: HomeStop[];
  initial: ResidentHome;
  firstTime: boolean;
  editing: boolean;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(editing);
  const [village, setVillage] = useState(initial.village ?? "");
  const [stop, setStop] = useState<HomeStop | null>(initial.stop);
  // A street typed into the old 「我住的地方」 becomes the first stop search.
  const [legacy] = useState(() => (initial.stop || initial.village ? "" : readLegacyArea()));
  const [query, setQuery] = useState(legacy);
  const q = query.trim().replace(/\s+/g, "");
  const matches = useMemo(() => (q ? stops.filter((s) => s.name.replace(/\s+/g, "").includes(q)).slice(0, 12) : []), [q, stops]);

  if (!open) {
    return (
      <section className={styles.panel} aria-labelledby="myhome-title" style={{ padding: "20px 18px" }}>
        <h2 className={styles.panelTitle} id="myhome-title" style={{ marginBottom: 6 }}>
          <span>
            <SkinIcon name="profile" size={18} />
          </span>
          設定我家
        </h2>
        <p className={styles.panelLead} style={{ margin: "0 0 14px" }}>
          選好里別和家門口的垃圾車站，這裡就會直接顯示：垃圾車今天幾點來、你家有沒有停水停電、附近有沒有施工。只存在這支手機，不用註冊。
        </p>
        <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
          開始設定（約 10 秒）
        </button>
      </section>
    );
  }

  const save = () => {
    writeResidentHome({ village: village || null, stop });
    onDone();
  };

  return (
    <section className={styles.panel} aria-labelledby="myhome-title" style={{ padding: "20px 18px" }}>
      <h2 className={styles.panelTitle} id="myhome-title" style={{ marginBottom: 14 }}>
        <span>
          <SkinIcon name="profile" size={18} />
        </span>
        {firstTime ? "設定我家" : "修改我家"}
      </h2>

      <label style={{ display: "block", fontWeight: 800, fontSize: 15, marginBottom: 6 }} htmlFor="myhome-village">
        1. 我住在哪個里
      </label>
      <select
        id="myhome-village"
        value={village}
        onChange={(e) => setVillage(e.target.value)}
        style={{ width: "100%", minHeight: 46, padding: "0 12px", borderRadius: 12, border: "1px solid var(--rj-line-strong)", background: "var(--rj-bg)", color: "var(--rj-ink)", fontSize: 16 }}
      >
        <option value="">不確定，先略過</option>
        {DAXI_VILLAGES.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <label style={{ display: "block", fontWeight: 800, fontSize: 15, margin: "18px 0 6px" }} htmlFor="myhome-stop">
        2. 我家門口的垃圾車站
      </label>
      {legacy && !stop ? (
        <p className={styles.panelLead} style={{ margin: "0 2px 8px", fontSize: 13 }}>
          你之前設定的地方是「{legacy}」，從下面選一個離家最近的垃圾車站。
        </p>
      ) : null}
      {stop ? (
        <div className={styles.row} style={{ gap: 12 }}>
          <span className="min-w-0" style={{ flex: 1 }}>
            <strong>{stop.name}</strong>
            <small>
              {stop.routeLabel} · 預定 {stop.time ?? "—"}
            </small>
          </span>
          <button type="button" className={styles.more} onClick={() => setStop(null)} style={{ cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 800 }}>
            換一站
          </button>
        </div>
      ) : (
        <>
          <input
            id="myhome-stop"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入路名，例如：員林路、中華路"
            style={{ width: "100%", minHeight: 46, padding: "0 14px", borderRadius: 12, border: "1px solid var(--rj-line-strong)", background: "var(--rj-bg)", color: "var(--rj-ink)", fontSize: 16 }}
          />
          {q ? (
            <div style={{ marginTop: 6 }}>
              {matches.length === 0 ? (
                <p className={styles.panelLead} style={{ margin: "8px 2px" }}>
                  找不到「{query.trim()}」，試試只輸入路名
                </p>
              ) : (
                matches.map((s) => (
                  <button
                    key={`${s.routeId}-${s.seq}`}
                    type="button"
                    className={styles.row}
                    onClick={() => {
                      setStop(s);
                      setQuery("");
                    }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: 0, borderBottom: "1px solid var(--rj-line)", cursor: "pointer" }}
                  >
                    <span className="min-w-0">
                      <strong>{s.name}</strong>
                      <small>{s.routeLabel}</small>
                    </span>
                    <span className={styles.rowValue} style={{ fontSize: 15 }}>
                      {s.time ?? "—"}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </>
      )}

      <div className={styles.btnRow} style={{ marginTop: 18, gridTemplateColumns: editing ? "1fr 1fr" : "1fr" }}>
        <button type="button" className={styles.btn} onClick={save} disabled={!village && !stop}>
          儲存
        </button>
        {editing ? (
          <button
            type="button"
            className={styles.btn}
            data-variant="line"
            onClick={onDone}
          >
            取消
          </button>
        ) : null}
      </div>
      <p className={styles.panelLead} style={{ margin: "12px 2px 0", fontSize: 13 }}>
        設定只存在這支手機或這個瀏覽器，嗨大溪不會收到你的住址。
        {editing && (initial.village || initial.stop) ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => {
                writeResidentHome({ village: null, stop: null });
                onDone();
              }}
              style={{ background: "none", border: 0, padding: 0, color: "var(--rj-alert)", fontWeight: 800, cursor: "pointer", font: "inherit" }}
            >
              清除設定
            </button>
          </>
        ) : null}
      </p>
    </section>
  );
}
