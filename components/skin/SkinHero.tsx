"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Skin.module.css";

export type SkinHeroSlide = {
  id: string;
  tag: string;
  title: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
  photo: { src: string; author?: string; sourceUrl?: string };
};

const AUTOPLAY_MS = 6000;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// The Visit Jeju "main visual": one full-bleed photo per slide, a big title
// in the lower-left, and a counter / progress / pause / prev-next strip under
// it. Slides come from the admin-editable resident carousel; the photo is
// assigned per position so admins don't have to manage images.
export default function SkinHero({
  slides,
  todayLabel,
  weather,
  initialIndex = 0,
  label = "大溪今日重點",
}: {
  slides: SkinHeroSlide[];
  todayLabel: string;
  weather: { temp: number; icon: string; text: string } | null;
  initialIndex?: number;
  label?: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(true);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (!playing || count <= 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [index, playing, count, go]);

  if (count === 0) return null;
  const current = slides[index];

  return (
    <div className={styles.heroWrap}>
      <section
        className={styles.hero}
        aria-roledescription="carousel"
        aria-label={label}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          if (Math.abs(dx) > 44) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className={styles.heroSlide} data-active={i === index} aria-hidden={i !== index}>
            <Image
              src={slide.photo.src}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 768px, 1152px"
              unoptimized={slide.photo.src.startsWith("http")}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          </div>
        ))}
        <div className={styles.heroShade} />

        <div className={styles.heroTop}>
          <div className={styles.heroToday}>
            <small>大溪今日</small>
            <strong>{todayLabel}</strong>
          </div>
          {weather ? (
            <span className={styles.heroWeather} title={weather.text}>
              <span aria-hidden>{weather.icon}</span>
              {Math.round(weather.temp)}°
            </span>
          ) : null}
        </div>

        <div className={styles.heroCopy} aria-live="polite">
          <span className={styles.heroTag} data-tone={current.tag === "緊急" ? "urgent" : undefined}>
            {current.tag === "一般" ? "生活資訊" : current.tag}
          </span>
          <h2>{current.title}</h2>
          {current.subtitle ? <p>{current.subtitle}</p> : null}
          {current.href ? (
            <Link href={current.href} className={styles.heroCta}>
              {current.ctaLabel ?? "立即查看"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ) : null}
        </div>

        {count > 1 ? (
          <div className={styles.heroControls}>
            <span className={styles.heroCount}>
              {pad(index + 1)} <span>/ {pad(count)}</span>
            </span>
            <span className={styles.heroBar} aria-hidden>
              <i style={{ width: `${((index + 1) / count) * 100}%` }} />
            </span>
            <button type="button" className={styles.heroBtn} onClick={() => setPlaying((p) => !p)} aria-label={playing ? "暫停輪播" : "繼續輪播"}>
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M7 5v14l12-7Z" />
                </svg>
              )}
            </button>
            <button type="button" className={styles.heroBtn} onClick={() => go(index - 1)} aria-label="上一張">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className={styles.heroBtn} onClick={() => go(index + 1)} aria-label="下一張">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}

        {current.photo.author && current.photo.sourceUrl ? (
          <a className={styles.heroCredit} href={current.photo.sourceUrl} target="_blank" rel="noreferrer">
            攝影 {current.photo.author}
          </a>
        ) : null}
      </section>
    </div>
  );
}
