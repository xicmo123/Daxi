import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import SkinPageHeader from "@/components/skin/SkinPageHeader";
import SkinIcon from "@/components/skin/SkinIcon";
import PlaceholderIcon from "@/components/PlaceholderIcon";
import PlaceSaveButton from "@/components/PlaceSaveButton";
import ReservationBooking from "@/components/ReservationBooking";
import styles from "@/components/skin/Skin.module.css";
import { getCachedParking } from "@/lib/cachedSources";
import { listActiveCoupons, type Coupon } from "@/lib/coupons";
import { experienceTags } from "@/lib/experience";
import { categoryLabel } from "@/lib/placeDetails";
import { loadPlacePage } from "@/lib/placePageData";
import { placeHref, placeJsonLd, placeSection, shortPlaceName } from "@/lib/placePages";
import { jsonLdString } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { TOURIST_NAV } from "@/lib/touristNav";
import { findNearestLot, formatDistance, haversineMeters, parkingAvailabilityLabel, type LiveParkingLot } from "@/lib/tycgParking";

function externalUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("@")) return `https://www.instagram.com/${trimmed.slice(1)}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const SECTION_NAME = { "/spots": "大溪景點", "/businesses": "美食與店家" } as const;

// A crawlable page per spot/shop. The list pages still open the quick-look
// modal on tap; this is what search engines index and what shared links and
// the home rails land on.
export default async function PlacePage({ section, placeId }: { section: "/spots" | "/businesses"; placeId: string }) {
  const { place, places, photos, details } = await loadPlacePage(placeId);
  if (!place) notFound();
  if (placeSection(place.tag) !== section) permanentRedirect(placeHref(place));

  const detail = details[place.placeId];
  const photo = photos[place.placeId];
  const name = shortPlaceName(place.name);
  const category = categoryLabel(detail?.category, place.googleType, place.tag);
  const tags = experienceTags(place, detail);
  const phone = detail?.contact?.phone?.trim() || place.phone || undefined;
  const live = detail?.liveStatus;

  let lots: LiveParkingLot[] = [];
  try {
    lots = await getCachedParking();
  } catch {
    lots = [];
  }
  let coupons: Coupon[] = [];
  try {
    coupons = (await listActiveCoupons()).filter((c) => c.placeId === place.placeId);
  } catch {
    coupons = [];
  }

  const manualLot = detail?.recommendedParkingName ? lots.find((lot) => lot.name === detail.recommendedParkingName) : undefined;
  const nearestLot = findNearestLot(place, lots, place.placeId);
  const parking = manualLot
    ? { lot: manualLot, distanceLabel: formatDistance(haversineMeters(place, manualLot)), crossesRiver: false, manual: true }
    : nearestLot
      ? { ...nearestLot, manual: false }
      : null;

  const nearby = places
    .filter((p) => p.placeId !== place.placeId)
    .map((p) => ({ place: p, meters: haversineMeters(place, p) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 8);

  const links = [
    { label: "官方網站", href: externalUrl(detail?.contact?.website) },
    { label: "Facebook", href: externalUrl(detail?.contact?.facebook) },
    { label: "Instagram", href: externalUrl(detail?.contact?.instagram) },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  const url = `${SITE_URL}${placeHref(place)}`;
  const jsonLd = placeJsonLd(place, detail, { url, image: photo ? `${SITE_URL}${photo.src}` : undefined });

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <SkinPageHeader
        groups={TOURIST_NAV}
        root={{ name: "大溪通", href: "/" }}
        parent={{ name: SECTION_NAME[section], href: section }}
        href={placeHref(place)}
        title={name}
        lead={`${category} · 距大溪老街 ${place.distanceLabel}`}
        showSiblings={false}
        photo={photo}
      >
        <div className={styles.bulletinMeta} style={{ marginTop: 12, marginBottom: 0, flexWrap: "wrap" }}>
          {place.businessStatus && place.businessStatus !== "OPERATIONAL" ? (
            <span className={styles.badge} data-tone="alert">
              {place.businessStatus === "CLOSED_PERMANENTLY" ? "已歇業" : "暫停營業"}
            </span>
          ) : null}
          {live?.soldOut ? (
            <span className={styles.badge} data-tone="alert">
              今日已完售
            </span>
          ) : live?.queueStatus ? (
            <span className={styles.badge} data-tone={live.queueStatus === "免排隊" ? "ok" : "alert"}>
              {live.queueStatus}
            </span>
          ) : null}
          {detail?.acceptsLuggage ? <span className={styles.badge}>可寄放伴手禮</span> : null}
          {tags.map((tag) => (
            <span key={tag} className={styles.badge} data-tone="main">
              {tag}
            </span>
          ))}
        </div>
      </SkinPageHeader>

      <div className={styles.body}>
        <div className={styles.btnRow}>
          <a className={styles.btn} href={place.mapsUrl} target="_blank" rel="noopener noreferrer">
            開啟導航
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <PlaceSaveButton placeId={place.placeId} />
        </div>

        {detail?.story ? (
          <section className={styles.panel} aria-labelledby="place-story">
            <h2 className={styles.panelTitle} id="place-story">
              <span>
                <SkinIcon name={place.tag === "景點" ? "spot" : "food"} size={18} />
              </span>
              推薦重點
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: "var(--rj-ink)" }}>{detail.story}</p>
          </section>
        ) : null}

        {coupons.length > 0 ? (
          <section className={styles.panel} aria-labelledby="place-coupons">
            <h2 className={styles.panelTitle} id="place-coupons">
              <span>
                <SkinIcon name="coupon" size={18} />
              </span>
              本店優惠
            </h2>
            {coupons.map((c) => (
              <Link key={c.id} href="/coupons" className={styles.row}>
                <span className="min-w-0">
                  <strong>{c.title}</strong>
                  <small>
                    {c.desc} · 使用期限 {c.validUntil}
                  </small>
                </span>
                <span aria-hidden>→</span>
              </Link>
            ))}
          </section>
        ) : null}

        {detail?.reservation ? <ReservationBooking placeId={place.placeId} reservation={detail.reservation} /> : null}

        <section className={styles.panel} aria-labelledby="place-info">
          <h2 className={styles.panelTitle} id="place-info">
            <span>
              <SkinIcon name="info" size={18} />
            </span>
            基本資訊
          </h2>
          <dl>
            <InfoRow label="分類" value={category} />
            {place.address ? <InfoRow label="地址" value={place.address} /> : null}
            {detail?.hours?.trim() ? <InfoRow label="營業時間" value={detail.hours.trim()} /> : null}
            {phone ? <InfoRow label="電話" value={<a href={`tel:${phone}`} style={{ color: "var(--rj-main)", fontWeight: 800 }}>{phone}</a>} /> : null}
            <InfoRow label="距大溪老街" value={`約 ${place.distanceLabel}（直線距離）`} />
            {place.rating !== null && place.reviewCount > 0 ? (
              <InfoRow label="Google 評分" value={`${place.rating.toFixed(1)} 分・${place.reviewCount.toLocaleString()} 則評論`} />
            ) : null}
          </dl>
          {links.length > 0 ? (
            <div className={styles.btnRow} style={{ marginTop: 16 }}>
              {links.map((l) => (
                <a key={l.label} className={styles.btn} data-variant="line" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </div>
          ) : null}
        </section>

        {parking ? (
          <section className={styles.panel} aria-labelledby="place-parking">
            <h2 className={styles.panelTitle} id="place-parking">
              <span>
                <SkinIcon name="parking" size={18} />
              </span>
              {name}附近停車
            </h2>
            <Link href="/parking" className={styles.row}>
              <span className="min-w-0">
                <strong>{parking.lot.name}</strong>
                <small>
                  {parking.manual ? "推薦停車場" : "距此最近的停車場"} · 直線距離 {parking.distanceLabel}
                  {parking.crossesRiver ? " · 需過橋" : ""}
                </small>
              </span>
              <span className={styles.rowValue} style={{ fontSize: 14 }}>
                {parkingAvailabilityLabel(parking.lot)}
              </span>
            </Link>
            <p className={styles.panelLead} style={{ margin: "10px 4px 0" }}>
              假日老街周邊車位緊張，看所有停車場的即時空位 → <Link href="/parking" style={{ color: "var(--rj-main)", fontWeight: 800 }}>大溪停車</Link>
            </p>
          </section>
        ) : null}

        {nearby.length > 0 ? (
          <section aria-labelledby="place-nearby" style={{ marginTop: 8 }}>
            <h2 className={styles.panelTitle} id="place-nearby">
              {name}周邊景點與美食
            </h2>
            <div className={styles.related} style={{ gap: 16 }}>
              {nearby.map(({ place: nb, meters }) => {
                const nbPhoto = photos[nb.placeId];
                return (
                  <Link key={nb.placeId} href={placeHref(nb)} className={styles.eventCard}>
                    <div className={styles.eventPhoto}>
                      {nbPhoto ? (
                        <Image src={nbPhoto.src} alt="" fill sizes="(max-width: 767px) 46vw, 24vw" />
                      ) : (
                        <PlaceholderIcon kind={nb.tag} />
                      )}
                    </div>
                    <h3>{shortPlaceName(nb.name)}</h3>
                    <p>
                      {categoryLabel(details[nb.placeId]?.category, nb.googleType, nb.tag)} · 相距 {formatDistance(meters)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <p className={styles.note}>
          地點資料來源：{place.placeId.startsWith("custom-") ? "大溪通編輯整理" : "Google Maps Places API（每週更新，非即時）"}
          {detail?.story ? "；推薦重點由大溪通編輯撰寫" : ""}。
          {photo?.author ? (
            <>
              {" "}圖片：
              {photo.sourceUrl ? (
                <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {photo.author}
                </a>
              ) : (
                photo.author
              )}
              。
            </>
          ) : null}{" "}
          營業時間與停車空位可能變動，出發前建議先確認。 <Link href={section}>看全部{SECTION_NAME[section]} →</Link>
        </p>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.row} style={{ alignItems: "flex-start", justifyContent: "flex-start", gap: 16 }}>
      <dt style={{ width: 92, flexShrink: 0, color: "var(--rj-ink-soft)", fontSize: 14, fontWeight: 700 }}>{label}</dt>
      <dd style={{ minWidth: 0, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>{value}</dd>
    </div>
  );
}
