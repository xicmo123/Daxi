"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CouponWithBusiness } from "./CouponList";
import CouponRedeemModal from "./CouponRedeemModal";
import HeroCarousel, { type HeroSlide } from "./HeroCarousel";
import PlaceholderIcon from "./PlaceholderIcon";
import type { PhotoCredit } from "@/lib/data";
import { trackClick } from "@/lib/trackClient";
import styles from "./TouristGuide.module.css";

export type FeedSpot = {
  placeId: string;
  name: string;
  category: string;
  distanceLabel: string;
  photoSrc?: string;
  indoor: boolean;
};

export type HomeTheme = {
  placeId: string;
  title: string;
  description: string;
  photo: PhotoCredit;
};

export default function HomeExperience({
  spots,
  themes,
  coupons,
  weatherMood,
  heroSlides,
  initialSlideIndex,
}: {
  spots: FeedSpot[];
  themes: HomeTheme[];
  coupons: CouponWithBusiness[];
  weatherMood: "hot" | "rain" | "normal";
  heroSlides: HeroSlide[];
  initialSlideIndex: number;
}) {
  const [openCoupon, setOpenCoupon] = useState<CouponWithBusiness | null>(null);
  const wantsIndoor = weatherMood !== "normal";

  return (
    <div className={styles.homeFeed}>
      {themes.length > 0 ? (
        <section aria-labelledby="home-themes">
          <div className={styles.sectionHeading}>
            <h2 id="home-themes">大溪怎麼玩</h2>
          </div>
          <div className={styles.themeGrid}>
            {themes.map((theme) => (
              <article key={theme.placeId} className={styles.themeCard}>
                <Link
                  className={styles.themeLink}
                  href={{ pathname: "/spots", query: { place: theme.placeId } }}
                  onClick={() => trackClick("spot", theme.placeId, theme.title, "tourist")}
                >
                  <div className={styles.themePhoto}>
                    <Image src={theme.photo.src} alt="" fill sizes="(max-width: 767px) 280px, (max-width: 1023px) 230px, 355px" />
                  </div>
                  <div className={styles.themeBody}>
                    <div>
                      <h3>{theme.title}</h3>
                      <p>{theme.description}</p>
                    </div>
                    <span className={styles.themeArrow} aria-hidden>→</span>
                  </div>
                </Link>
                {theme.photo.author && theme.photo.sourceUrl ? (
                  <a className={styles.themeCredit} href={theme.photo.sourceUrl} target="_blank" rel="noreferrer">
                    攝影來源 {theme.photo.author}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {spots.length > 0 ? (
        <section aria-labelledby="home-spots">
          <div className={styles.sectionHeading}>
            <h2 id="home-spots">熱門景點</h2>
            <Link className={styles.sectionLink} href="/spots">全部景點 <span aria-hidden>→</span></Link>
          </div>
          <div className={styles.spotRail}>
            {spots.map((spot) => (
              <Link
                key={spot.placeId}
                href={{ pathname: "/spots", query: { place: spot.placeId } }}
                className={styles.spotCard}
                onClick={() => trackClick("spot", spot.placeId, spot.name, "tourist")}
              >
                <div className={styles.spotPhoto}>
                  {spot.photoSrc ? (
                    <Image src={spot.photoSrc} alt="" fill sizes="(max-width: 767px) 196px, 25vw" />
                  ) : (
                    <PlaceholderIcon kind="景點" />
                  )}
                  {wantsIndoor && spot.indoor ? <span className={styles.indoorBadge}>室內景點</span> : null}
                </div>
                <div className={styles.spotBody}>
                  <h3>{spot.name}</h3>
                  <p>{spot.category} · 距老街 {spot.distanceLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {heroSlides.length > 0 ? (
        <section aria-labelledby="home-events">
          <div className={styles.sectionHeading}>
            <h2 id="home-events">近期活動</h2>
            <Link className={styles.sectionLink} href="/events">全部活動 <span aria-hidden>→</span></Link>
          </div>
          <HeroCarousel slides={heroSlides} initialIndex={initialSlideIndex} compact />
        </section>
      ) : null}

      {coupons.length > 0 ? (
        <section aria-labelledby="home-coupons">
          <div className={styles.sectionHeading}>
            <h2 id="home-coupons">目前可用優惠</h2>
            <Link className={styles.sectionLink} href="/coupons">全部優惠 <span aria-hidden>→</span></Link>
          </div>
          <div className={styles.couponGrid}>
            {coupons.map((coupon) => (
              <button
                key={coupon.id}
                type="button"
                className={styles.coupon}
                onClick={() => {
                  trackClick("coupon", coupon.id, coupon.title, "tourist");
                  setOpenCoupon(coupon);
                }}
              >
                <span>
                  <strong>{coupon.title}</strong>
                  <small>{coupon.businessName}</small>
                </span>
                <span aria-hidden>→</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {openCoupon ? <CouponRedeemModal coupon={openCoupon} businessName={openCoupon.businessName} onClose={() => setOpenCoupon(null)} /> : null}
    </div>
  );
}
