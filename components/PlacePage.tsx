import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import SkinPageHeader from "@/components/skin/SkinPageHeader";
import SkinIcon from "@/components/skin/SkinIcon";
import PlaceholderIcon from "@/components/PlaceholderIcon";
import PlaceActions from "@/components/PlaceActions";
import ReservationBooking from "@/components/ReservationBooking";
import styles from "@/components/skin/Skin.module.css";
import page from "@/components/PlacePage.module.css";
import { getCachedParking } from "@/lib/cachedSources";
import { listActiveCoupons, type Coupon } from "@/lib/coupons";
import { experienceTags } from "@/lib/experience";
import { openStatus, priceLabel, todayHours, weekHours } from "@/lib/openingHours";
import { categoryLabel } from "@/lib/placeDetails";
import { loadPlacePage } from "@/lib/placePageData";
import { readPlaceHours } from "@/lib/placeHoursStore";
import { placeHref, placeJsonLd, placeSection, shortPlaceName } from "@/lib/placePages";
import { jsonLdString } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { TOURIST_NAV } from "@/lib/touristNav";
import { findNearestLot, formatDistance, haversineMeters, parkingAvailabilityLabel, type LiveParkingLot } from "@/lib/tycgParking";

function externalUrl(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("@")) return `https://www.instagram.com/${trimmed.slice(1)}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// What a link is, in words: 「Facebook 粉絲專頁」, not a percent-encoded URL.
function linkLabel(href: string): string {
  if (/facebook\.com|fb\.com/i.test(href)) return "Facebook 粉絲專頁";
  if (/instagram\.com/i.test(href)) return "Instagram";
  if (/line\.me/i.test(href)) return "LINE 官方帳號";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

const SECTION_NAME = { "/spots": "大溪景點", "/businesses": "美食與店家" } as const;
const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (p: { hour: number; minute: number }) => `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;

const ICONS = {
  pin: (
    <>
      <path d="M12 21s6.4-5.9 6.4-10.7a6.4 6.4 0 0 0-12.8 0C5.6 15.1 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: <path d="M6.6 3.5h3l1.5 4.2-2 1.4a12 12 0 0 0 5.8 5.8l1.4-2 4.2 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />,
  web: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z" />
    </>
  ),
  money: (
    <>
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.4" />
    </>
  ),
  star: <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3.8Z" />,
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

function InfoRow({ icon, href, children, go }: { icon: keyof typeof ICONS; href?: string; children: ReactNode; go?: string }) {
  const body = (
    <>
      <Icon name={icon} />
      <div className="min-w-0">{children}</div>
      {go ? <span className={page.go}>{go} ›</span> : <span />}
    </>
  );
  return href ? (
    <a className={page.infoRow} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {body}
    </a>
  ) : (
    <div className={page.infoRow}>{body}</div>
  );
}

// A crawlable page per spot/shop, laid out like Google Maps and 愛食記: who
// and how good (name, ★, price, open now), what you can do (navigate, call,
// save, share), what it is, then the practical details and what's nearby.
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

  const [allHours, lots, allCoupons] = await Promise.all([
    readPlaceHours(),
    getCachedParking().catch((): LiveParkingLot[] => []),
    listActiveCoupons().catch((): Coupon[] => []),
  ]);
  const hours = allHours[place.placeId];
  const status = openStatus(hours);
  const today = todayHours(hours);
  const week = weekHours(hours);
  const price = priceLabel(hours);
  const coupons = allCoupons.filter((c) => c.placeId === place.placeId);

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

  const website = externalUrl(detail?.contact?.website) ?? externalUrl(hours?.website);
  const social = [
    { label: "Facebook", href: externalUrl(detail?.contact?.facebook) },
    { label: "Instagram", href: externalUrl(detail?.contact?.instagram) },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));
  const about = detail?.story?.trim() || hours?.summary?.trim() || null;
  const address = place.address?.replace(/^\d{3,6}\s*台灣/, "") ?? null;
  const merchantHours = detail?.hours?.trim() || null;

  const url = `${SITE_URL}${placeHref(place)}`;
  const jsonLd = {
    ...placeJsonLd(place, detail, { url, image: photo ? `${SITE_URL}${photo.src}` : undefined }),
    openingHoursSpecification: hours?.periods
      .filter((p) => p.open && p.close && p.open.day === p.close.day)
      .map((p) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: SCHEMA_DAYS[p.open!.day], opens: hhmm(p.open!), closes: hhmm(p.close!) })),
    priceRange: hours?.priceMin && hours?.priceMax ? `NT$${hours.priceMin}-${hours.priceMax}` : undefined,
  };

  const closedFlag =
    place.businessStatus && place.businessStatus !== "OPERATIONAL" ? (place.businessStatus === "CLOSED_PERMANENTLY" ? "已歇業" : "暫停營業") : null;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      <SkinPageHeader
        groups={TOURIST_NAV}
        root={{ name: "嗨大溪", href: "/" }}
        parent={{ name: SECTION_NAME[section], href: section }}
        href={placeHref(place)}
        title={name}
        lead={`${category} · 距大溪老街 ${place.distanceLabel}`}
        showSiblings={false}
        photo={photo}
      >
        <div className={page.facts}>
          {place.rating !== null && place.reviewCount > 0 ? (
            <span>
              <b className={page.star}>★</b> {place.rating.toFixed(1)}
              <small style={{ fontWeight: 600, color: "var(--rj-ink-soft)" }}>（{place.reviewCount.toLocaleString()} 則評論）</small>
            </span>
          ) : null}
          {price ? <span>{price}</span> : null}
          {coupons.length > 0 ? <span style={{ background: "var(--rj-main)", color: "var(--rj-on-main)" }}>有優惠券</span> : null}
          {detail?.acceptsLuggage ? <span>可寄放伴手禮</span> : null}
          {tags.slice(0, 3).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {closedFlag ? (
          <div className={page.status} data-tone="closed">
            {closedFlag}
          </div>
        ) : status ? (
          <div className={page.status} data-tone={status.tone}>
            {status.label}
            {live?.soldOut ? <small>· 今日已完售</small> : live?.queueStatus ? <small>· {live.queueStatus}</small> : null}
          </div>
        ) : null}
      </SkinPageHeader>

      <div className={styles.body}>
        {/* Phones read top to bottom (actions, about, 店家資訊, parking,
            nearby); wide screens keep 店家資訊 beside the story as a sticky
            card, as Google Maps and TripAdvisor do. */}
        <div className={page.layout}>
        <div className={page.main1}>
        <PlaceActions placeId={place.placeId} name={name} mapsUrl={place.mapsUrl} phone={phone} website={website} />

        {about ? (
          <section className={styles.panel} aria-labelledby="place-about">
            <h2 className={styles.panelTitle} id="place-about">
              <span>
                <SkinIcon name={place.tag === "景點" ? "spot" : "food"} size={18} />
              </span>
              {detail?.story ? "推薦重點" : "簡介"}
            </h2>
            <p className={page.summary}>{about}</p>
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
        </div>

        <div className={page.side}>
        <section className={styles.panel} aria-labelledby="place-info">
          <h2 className={styles.panelTitle} id="place-info">
            <span>
              <SkinIcon name="info" size={18} />
            </span>
            {place.tag === "景點" ? "景點資訊" : "店家資訊"}
          </h2>
          <div className={page.info}>
            {address ? (
              <InfoRow icon="pin" href={place.mapsUrl} go="地圖">
                <strong>{address}</strong>
                <small>距大溪老街 {place.distanceLabel}（直線）</small>
              </InfoRow>
            ) : null}
            {today || merchantHours ? (
              <InfoRow icon="clock">
                <strong>{today ? `今天 ${today}` : merchantHours}</strong>
                {status ? <small style={{ color: status.open ? "var(--rj-ok)" : "var(--rj-alert)", fontWeight: 800 }}>{status.label}</small> : null}
                {week.length > 0 ? (
                  <details className={page.hours}>
                    <summary>查看每週營業時間 ▾</summary>
                    <table>
                      <tbody>
                        {week.map((d) => (
                          <tr key={d.label} data-today={d.today ? "true" : undefined}>
                            <td>{d.label}</td>
                            <td>{d.hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                ) : null}
                {merchantHours && today ? <small>店家備註：{merchantHours}</small> : null}
              </InfoRow>
            ) : null}
            {phone ? (
              <InfoRow icon="phone" href={`tel:${phone.replace(/[^\d+]/g, "")}`} go="撥打">
                <strong>{phone}</strong>
              </InfoRow>
            ) : null}
            {website ? (
              <InfoRow icon="web" href={website} go="前往">
                <strong>{linkLabel(website)}</strong>
              </InfoRow>
            ) : null}
            {social.map((s) => (
              <InfoRow key={s.label} icon="web" href={s.href} go="前往">
                <strong>{s.label}</strong>
              </InfoRow>
            ))}
            {price ? (
              <InfoRow icon="money">
                <strong>{price}</strong>
                <small>每人平均消費（Google 使用者回報）</small>
              </InfoRow>
            ) : null}
            {place.rating !== null && place.reviewCount > 0 ? (
              <InfoRow icon="star" href={place.mapsUrl} go="看評論">
                <strong>
                  Google 評分 {place.rating.toFixed(1)}・{place.reviewCount.toLocaleString()} 則評論
                </strong>
                <small>評論內容請到 Google 地圖查看</small>
              </InfoRow>
            ) : null}
          </div>
        </section>
        </div>

        <div className={page.main2}>
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
                const nbStatus = openStatus(allHours[nb.placeId]);
                return (
                  <Link key={nb.placeId} href={placeHref(nb)} className={styles.eventCard}>
                    <div className={styles.eventPhoto}>
                      {nbPhoto ? <Image src={nbPhoto.src} alt="" fill sizes="(max-width: 767px) 46vw, 24vw" /> : <PlaceholderIcon kind={nb.tag} />}
                    </div>
                    <h3>{shortPlaceName(nb.name)}</h3>
                    <p>
                      {nb.rating !== null && nb.reviewCount > 0 ? `★ ${nb.rating.toFixed(1)} · ` : ""}
                      {categoryLabel(details[nb.placeId]?.category, nb.googleType, nb.tag)} · {formatDistance(meters)}
                    </p>
                    {nbStatus ? (
                      <p style={{ color: nbStatus.open ? "var(--rj-ok)" : "var(--rj-ink-soft)", fontWeight: 800 }}>{nbStatus.open ? "營業中" : "休息中"}</p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
        </div>
        </div>

        <p className={styles.note}>
          地點、營業時間與價位來源：{place.placeId.startsWith("custom-") ? "嗨大溪編輯整理" : "Google 地圖（每週更新，非即時）"}
          {detail?.story ? "；推薦重點由嗨大溪編輯撰寫" : ""}。
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
          國定假日或臨時店休可能不同，出發前建議先致電確認。 <Link href={section}>看全部{SECTION_NAME[section]} →</Link>
        </p>
      </div>
    </main>
  );
}
