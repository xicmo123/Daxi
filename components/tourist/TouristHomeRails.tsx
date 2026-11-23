"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CouponWithBusiness } from "@/components/CouponList";
import CouponRedeemModal from "@/components/CouponRedeemModal";
import PlaceholderIcon from "@/components/PlaceholderIcon";
import SkinRail from "@/components/skin/SkinRail";
import styles from "@/components/skin/Skin.module.css";
import { trackClick } from "@/lib/trackClient";

export type HomeSpot = {
  placeId: string;
  name: string;
  category: string;
  distanceLabel: string;
  photoSrc?: string;
  indoor: boolean;
};

export function SpotRail({ spots, preferIndoor }: { spots: HomeSpot[]; preferIndoor: boolean }) {
  return (
    <SkinRail label="熱門景點">
      {spots.map((spot) => (
        <Link
          key={spot.placeId}
          href={{ pathname: "/spots", query: { place: spot.placeId } }}
          className={styles.eventCard}
          role="listitem"
          onClick={() => trackClick("spot", spot.placeId, spot.name, "tourist")}
        >
          <div className={styles.eventPhoto}>
            {spot.photoSrc ? (
              <Image src={spot.photoSrc} alt="" fill sizes="(max-width: 767px) 82vw, 340px" unoptimized={spot.photoSrc.startsWith("http")} />
            ) : (
              <PlaceholderIcon kind="景點" />
            )}
            {preferIndoor && spot.indoor ? (
              <span className={`${styles.badge} ${styles.eventPhase}`} data-tone="main" style={{ background: "var(--rj-bg)" }}>
                室內景點
              </span>
            ) : null}
          </div>
          <h3>{spot.name}</h3>
          <p>
            {spot.category} · 距老街 {spot.distanceLabel}
          </p>
        </Link>
      ))}
    </SkinRail>
  );
}

export function CouponRail({ coupons }: { coupons: CouponWithBusiness[] }) {
  const [open, setOpen] = useState<CouponWithBusiness | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <>
      <SkinRail label="目前可用優惠">
        {coupons.map((coupon) => (
          <button
            key={coupon.id}
            type="button"
            role="listitem"
            className={styles.bulletin}
            onClick={() => {
              trackClick("coupon", coupon.id, coupon.title, "tourist");
              setOpen(coupon);
            }}
          >
            <span className={styles.bulletinMeta}>
              <span className={styles.badge} data-tone="main">
                優惠券
              </span>
              {coupon.distanceLabel ? <span className={styles.badge}>距老街 {coupon.distanceLabel}</span> : null}
            </span>
            <h3>{coupon.title}</h3>
            <p>{coupon.businessName}</p>
            <span className={styles.bulletinFoot}>
              <span>使用期限 {coupon.validUntil}</span>
              <span aria-hidden>領取 →</span>
            </span>
          </button>
        ))}
      </SkinRail>
      {open ? <CouponRedeemModal coupon={open} businessName={open.businessName} onClose={close} /> : null}
    </>
  );
}
