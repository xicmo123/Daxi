import Image from "next/image";
import Link from "next/link";
import { getCachedEvents } from "@/lib/cachedSources";
import { isEventExpired } from "@/lib/eventsFeed";
import SkinRail from "./SkinRail";
import styles from "./Skin.module.css";

const phaseLabel = { ongoing: "進行中", upcoming: "即將登場", past: "已結束" } as const;

// Photo cards for what's on now and next, linking to the section's events list.
export default async function SkinEventsRail({ href }: { href: string }) {
  const events = (await getCachedEvents().catch(() => [])).filter((e) => !isEventExpired(e) && e.phase !== "past").slice(0, 8);
  if (events.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>近期沒有活動</strong>
      </div>
    );
  }
  return (
    <SkinRail label="近期活動">
      {events.map((e) => (
        <Link key={e.id} href={href} className={`${styles.eventCard} ${styles.eventPreview}`} role="listitem">
          <div className={styles.eventPhoto}>
            <Image
              src={e.photoSrc ?? "/images/puji-temple.jpg"}
              alt=""
              fill
              sizes={events.length <= 2 ? "170px" : "(max-width: 639px) 48vw, 360px"}
              unoptimized={Boolean(e.photoSrc?.startsWith("http"))}
            />
          </div>
          <div className={styles.eventCopy}>
            <span className={styles.badge} data-tone={e.phase === "ongoing" ? "ok" : "main"}>
              {phaseLabel[e.phase]}
            </span>
            <h3>{e.title}</h3>
            <p>
              {e.date}
              {e.time ? ` · ${e.time}` : ""}
            </p>
          </div>
        </Link>
      ))}
    </SkinRail>
  );
}
