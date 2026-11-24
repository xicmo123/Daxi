"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import SkinIcon from "@/components/skin/SkinIcon";
import styles from "@/components/skin/Skin.module.css";
import { DAXI_VILLAGES } from "@/lib/daxiVillages";
import {
  metersBetween,
  readResidentHome,
  stopRoads,
  subscribeResidentHome,
  writeResidentHome,
  type HomeStop,
  type ResidentHome,
} from "@/lib/residentHome";
import { GARBAGE_HREF } from "@/lib/residentNav";

export type BoardOutage = { id: string; type: "water" | "power"; lowPressure: boolean; areas: string[]; date: string; timeRange: string };
export type BoardRoadwork = { id: string; name: string; location: string; points: Array<[number, number]> };
export type BoardClinics = { session: string | null; clinics: number; pharmacies: number };

type Props = {
  stops: HomeStop[];
  outages: BoardOutage[] | null; // null = source failed
  roadworks: BoardRoadwork[] | null;
  clinics: BoardClinics | null;
};

const NEARBY_METERS = 500;

function getServerHome(): ResidentHome | null {
  return null;
}

function taipeiClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { weekday: get("weekday"), minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

function toMinutes(hhmm: string | null): number | null {
  const m = hhmm ? /^(\d{1,2}):(\d{2})$/.exec(hhmm) : null;
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function inMinutes(diff: number): string {
  if (diff < 60) return `約 ${diff} 分鐘後`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m ? `約 ${h} 小時 ${m} 分後` : `約 ${h} 小時後`;
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short", timeZone: "Asia/Taipei" }).format(d);
}

export default function MyHomeBoard(props: Props) {
  const home = useSyncExternalStore(subscribeResidentHome, readResidentHome, getServerHome);
  const [editing, setEditing] = useState(false);

  // Server render and first paint: keep the space without guessing.
  if (home === null) return <div className="skeleton" style={{ minHeight: 120, borderRadius: 20, background: "var(--rj-surface)" }} />;

  if (editing || (!home.village && !home.stop)) {
    return (
      <HomeSetup
        stops={props.stops}
        initial={home}
        firstTime={!home.village && !home.stop}
        editing={editing}
        onDone={() => setEditing(false)}
      />
    );
  }

  return <Board {...props} home={home} onEdit={() => setEditing(true)} />;
}

function Board({ home, stops, outages, roadworks, clinics, onEdit }: Props & { home: ResidentHome; onEdit: () => void }) {
  const stop = home.stop;
  const roads = useMemo(() => (stop ? stopRoads(stop.name) : []), [stop]);

  const myOutages = useMemo(() => {
    if (!outages) return null;
    return outages.filter((o) =>
      o.areas.some((a) => (home.village && a.includes(home.village)) || roads.some((r) => a.includes(r) || (a.length >= 3 && r.includes(a)))),
    );
  }, [outages, home.village, roads]);

  const nearbyWorks = useMemo(() => {
    if (!roadworks || !stop || stop.lat === null || stop.lng === null) return null;
    const here = { lat: stop.lat, lng: stop.lng };
    return roadworks
      .map((w) => ({ work: w, meters: Math.min(...w.points.map(([lat, lng]) => metersBetween(here, { lat, lng }))) }))
      .filter((x) => Number.isFinite(x.meters) && x.meters <= NEARBY_METERS)
      .sort((a, b) => a.meters - b.meters);
  }, [roadworks, stop]);

  // Keep the stop's time fresh even if the city renumbered the route.
  const current = stop ? stops.find((s) => s.routeId === stop.routeId && s.seq === stop.seq && s.name === stop.name) ?? stop : null;

  return (
    <section className={styles.panel} aria-labelledby="myhome-title" style={{ padding: "20px 18px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <h2 className={styles.panelTitle} id="myhome-title" style={{ margin: 0 }}>
          <span>
            <SkinIcon name="profile" size={18} />
          </span>
          我家{home.village ? ` · ${home.village}` : ""}
        </h2>
        <button type="button" className={styles.more} onClick={onEdit} style={{ cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 800 }}>
          修改
        </button>
      </div>

      {current ? <GarbageRow stop={current} /> : (
        <Row icon="garbage" title="垃圾車" href={GARBAGE_HREF} value="未設定" detail="選好你家門口那站，就能看到今天幾點來" />
      )}

      {myOutages === null ? (
        <Row icon="outage" title="停水停電" href="/resident/outages" value="—" detail="暫時讀不到台水、台電資料" />
      ) : myOutages.length === 0 ? (
        <Row icon="outage" title="停水停電" href="/resident/outages" value="✓" tone="ok" detail={home.village || roads.length ? "近期沒有影響你家的停水停電預告" : "設定里別後，會比對影響你家的公告"} />
      ) : (
        myOutages.slice(0, 2).map((o) => (
          <Row
            key={o.id}
            icon="outage"
            title={o.type === "power" ? "停電" : o.lowPressure ? "降壓" : "停水"}
            href="/resident/outages"
            value={shortDate(o.date)}
            tone="alert"
            detail={`${o.timeRange} · ${o.areas.slice(0, 4).join("、")}${o.areas.length > 4 ? " 等" : ""}`}
          />
        ))
      )}

      {nearbyWorks === null ? (
        <Row icon="roadworks" title="道路施工" href="/resident/roadworks" value={stop ? "—" : "未設定"} detail={stop ? "暫時讀不到施工資料" : "設定垃圾車站後，會列出家附近的施工"} />
      ) : nearbyWorks.length === 0 ? (
        <Row icon="roadworks" title="道路施工" href="/resident/roadworks" value="✓" tone="ok" detail={`家附近 ${NEARBY_METERS} 公尺內沒有施工`} />
      ) : (
        <Row
          icon="roadworks"
          title="道路施工"
          href="/resident/roadworks"
          value={`${nearbyWorks.length} 處`}
          tone="alert"
          detail={`最近：${nearbyWorks[0].work.location || nearbyWorks[0].work.name}（約 ${Math.round(nearbyWorks[0].meters / 10) * 10} 公尺）`}
        />
      )}

      {clinics ? (
        <Row
          icon="clinic"
          title="現在有開"
          href="/resident/clinics"
          value={clinics.session ? `${clinics.clinics + clinics.pharmacies} 間` : "—"}
          detail={clinics.session ? `${clinics.clinics} 間診所、${clinics.pharmacies} 間藥局在${clinics.session}看診時段` : "現在不是一般看診時段，急症請撥 119"}
        />
      ) : null}
    </section>
  );
}

function GarbageRow({ stop }: { stop: HomeStop }) {
  const [live, setLive] = useState<{ passed: boolean; estimate: string | null } | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/resident/garbage/realtime?routeId=${encodeURIComponent(stop.routeId)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { stops?: Array<{ seq: number; name: string; estimateTime: string | null; passed: boolean }> };
        const hit = data.stops?.find((s) => s.seq === stop.seq) ?? data.stops?.find((s) => s.name.trim() === stop.name);
        if (!cancelled && hit) setLive({ passed: hit.passed, estimate: hit.estimateTime && /^\d{1,2}:\d{2}$/.test(hit.estimateTime) ? hit.estimateTime : null });
      } catch {
        // Scheduled time still shows.
      }
      if (!cancelled) setNow(new Date());
    }
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [stop.routeId, stop.seq, stop.name]);

  const { weekday, minutes } = taipeiClock(now);
  const scheduled = toMinutes(stop.time);
  let value = stop.time ?? "—";
  let detail: string;
  let tone: "ok" | "alert" | undefined;

  if (weekday === "Sun") {
    detail = `週日停收，明天 ${stop.time ?? ""} 再來`;
    value = "停收";
  } else if (live?.passed || (scheduled !== null && minutes > scheduled + 30 && !live?.estimate)) {
    detail = `今天已經收過了（預定 ${stop.time ?? "—"}）${weekday === "Sat" ? "，週日停收" : ""}`;
    value = "已收";
    tone = "ok";
  } else if (live?.estimate) {
    const eta = toMinutes(live.estimate)!;
    detail = `預估 ${live.estimate} 到，${eta > minutes ? inMinutes(eta - minutes) : "快到了"}（預定 ${stop.time ?? "—"}）`;
    value = live.estimate;
    tone = "alert";
  } else if (scheduled !== null && scheduled > minutes) {
    detail = `預定 ${stop.time}，${inMinutes(scheduled - minutes)}`;
  } else {
    detail = "預定時間";
  }

  return <Row icon="garbage" title={`垃圾車 · ${stop.name}`} href={GARBAGE_HREF} value={value} tone={tone} detail={`${detail} · ${stop.routeLabel}`} />;
}

function Row({
  icon,
  title,
  href,
  value,
  detail,
  tone,
}: {
  icon: "garbage" | "outage" | "roadworks" | "clinic";
  title: string;
  href: string;
  value: string;
  detail: string;
  tone?: "ok" | "alert";
}) {
  return (
    <Link href={href} className={styles.row} style={{ gap: 12, alignItems: "center" }}>
      <span aria-hidden style={{ color: tone === "alert" ? "var(--rj-alert)" : "var(--rj-main)", flexShrink: 0, display: "flex" }}>
        <SkinIcon name={icon} size={20} />
      </span>
      <span className="min-w-0" style={{ flex: 1 }}>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <span
        className={styles.rowValue}
        style={{ fontSize: 15, flexShrink: 0, color: tone === "alert" ? "var(--rj-alert)" : tone === "ok" ? "var(--rj-ok)" : undefined }}
      >
        {value}
      </span>
    </Link>
  );
}

function HomeSetup({
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
  const [query, setQuery] = useState("");
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
        設定只存在這支手機或這個瀏覽器，大溪通不會收到你的住址。
      </p>
    </section>
  );
}
