import Image from "next/image";
import Link from "next/link";
import { daxiWalkHref, daxiWalkVisitTime, oldStreetPhoto, photoLicense } from "@/lib/daxiWalk";
import TouristWelcome from "./TouristWelcome";
import styles from "./TouristGuide.module.css";

const shortcuts = [
  {
    href: "/parking",
    title: "找停車",
    description: "車位與停車場",
    icon: "M5 20V4h8a5 5 0 0 1 0 10H9m0-6h4",
  },
  {
    href: "/bus",
    title: "搭公車",
    description: "路線與到站資訊",
    icon: "M5 17V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11M5 10h14M5 17h14M7 17v3m10-3v3M8 14h.01m8 0h.01",
  },
  {
    href: "/spots",
    title: "找景點",
    description: "人文與自然景點",
    icon: "M20 10c0 5-8 10-8 10S4 15 4 10a8 8 0 1 1 16 0Zm-5.5 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  },
  {
    href: "/businesses?cat=美食",
    title: "找美食",
    description: "在地小吃與店家",
    icon: "M5 3v5a3 3 0 0 0 6 0V3M8 3v18M18 3c-2.5 1.5-4 4-4 8v2h4m0-10v18",
  },
];

export default function TouristHomeHeader() {
  return (
    <>
      <section className={styles.homeHero} aria-labelledby="tourist-hero-title">
        <div className={styles.heroPhoto}>
          <Image
            src={oldStreetPhoto.src}
            alt={oldStreetPhoto.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 720px, 1080px"
          />
          <div className={styles.heroCredit}>
            <a href={oldStreetPhoto.sourceUrl} target="_blank" rel="noreferrer">{oldStreetPhoto.author}</a>
            <span aria-hidden> · </span>
            <a href={photoLicense} target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
          </div>
        </div>
        <div className={styles.heroBody}>
          <h1 id="tourist-hero-title">走進大溪老街</h1>
          <p>從和平路的老牌樓，走到普濟堂、公園和武德殿。</p>
          <div className={styles.heroMeta}>
            <span>4 站步行導覽</span>
            <span>{daxiWalkVisitTime}</span>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.heroPrimary} href={daxiWalkHref}>開始老街散步 <span aria-hidden>→</span></Link>
            <TouristWelcome />
          </div>
        </div>
      </section>

      <form className={styles.guideSearch} method="get" action="/search" role="search">
        <label htmlFor="tourist-search" className="sr-only">搜尋景點和店家</label>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="10.5" cy="10.5" r="5.75" />
          <path d="m15 15 4.5 4.5" />
        </svg>
        <input id="tourist-search" type="search" name="q" placeholder="搜尋大溪橋、豆干或和平路" required />
        <button type="submit">搜尋</button>
      </form>

      <nav className={styles.shortcuts} aria-label="遊客快捷入口">
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.href} href={shortcut.href} className={styles.shortcut}>
            <span className={styles.shortcutIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
                <path d={shortcut.icon} />
              </svg>
            </span>
            <span>
              <strong>{shortcut.title}</strong>
              <small>{shortcut.description}</small>
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
