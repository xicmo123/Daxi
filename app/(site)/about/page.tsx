import Link from "next/link";
import TouristPageHeader from "@/components/TouristPageHeader";
import IdentitySwitchCard from "@/components/IdentitySwitchCard";
import { ABOUT_CONTACT_EMAIL, ABOUT_PARAGRAPHS } from "@/lib/aboutOwner";
import { pageMetadata } from "@/lib/seo";
import { oldStreetPhoto } from "@/lib/daxiWalk";

export const metadata = pageMetadata({
  path: "/about",
  title: "關於大溪通",
  description: "大溪通的由來：一個在大溪出生、長大的孩子，為旅人與在地鄉親打造的大溪專屬平台。歡迎來信交流。",
});

const card = { background: "var(--card)", border: "1px solid var(--line)" } as const;

export default function AboutPage() {
  return (
    <div>
      <TouristPageHeader title="關於" subtitle="一個大溪孩子做給大溪的平台。" photo={oldStreetPhoto} />

      <div className="safe-page-x page-after-header pb-10 fade-in flex flex-col gap-3">
        <section className="rounded-2xl px-5 py-5" style={card} aria-labelledby="about-story">
          <h2 id="about-story" className="text-app-title font-bold mb-3" style={{ color: "var(--ink)" }}>
            為什麼做這個網站
          </h2>
          <div className="flex flex-col gap-3 text-app-body" style={{ color: "var(--ink)", lineHeight: 1.9 }}>
            {ABOUT_PARAGRAPHS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="rounded-2xl px-5 py-5" style={card} aria-labelledby="about-contact">
          <h2 id="about-contact" className="text-app-title font-bold mb-3" style={{ color: "var(--ink)" }}>
            聯絡我
          </h2>
          <div className="text-app-label" style={{ color: "var(--ink-soft)" }}>
            聯絡信箱
          </div>
          <a href={`mailto:${ABOUT_CONTACT_EMAIL}`} className="text-app-heading font-bold break-all" style={{ color: "var(--ink)" }}>
            {ABOUT_CONTACT_EMAIL}
          </a>
          <a
            href={`mailto:${ABOUT_CONTACT_EMAIL}`}
            className="mt-4 flex min-h-[46px] items-center justify-center rounded-full text-app-body font-bold transition-opacity active:opacity-80"
            style={{ background: "var(--daxi-red)", color: "var(--accent-fg)" }}
          >
            寫信給我
          </a>
        </section>

        <Link
          href="/profile"
          className="flex min-h-[52px] items-center justify-between rounded-2xl px-5 text-app-body font-bold transition-opacity active:opacity-80"
          style={{ ...card, color: "var(--ink)" }}
        >
          我的收藏（景點・店家）
          <span aria-hidden>→</span>
        </Link>

        <IdentitySwitchCard currentLabel="遊客" switchToHref="/resident" switchToLabel="切換為大溪人模式" switchToIdentity="resident" />
      </div>
    </div>
  );
}
