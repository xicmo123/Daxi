import Link from "next/link";
import SkinIcon from "@/components/skin/SkinIcon";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { pageMetadata } from "@/lib/seo";
import { ABOUT_CONTACT_EMAIL as CONTACT_EMAIL, ABOUT_PARAGRAPHS } from "@/lib/aboutOwner";

export const metadata = pageMetadata({
  path: "/resident/about",
  title: "關於我是大溪人",
  description: "我是大溪人的由來：一個在大溪出生、長大的孩子，為在地鄉親打造的大溪生活資訊平台。歡迎來信交流。",
});

export default function ResidentAboutPage() {
  return (
    <main>
      <ResidentPageHeader
        href="/resident/about"
        title="關於"
        lead="一個大溪孩子做給大溪的平台。"
        photo={{
          src: "/images/old-street-crowd.jpg",
          author: "Andrewhaimerl",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Old_Street_Crowd.jpg",
        }}
      />

      <div className={styles.body}>
        <section className={styles.panel} aria-labelledby="about-story">
          <h2 id="about-story" className={styles.panelTitle}>
            <span>
              <SkinIcon name="bulletin" size={18} />
            </span>
            為什麼做這個網站
          </h2>
          <div className="flex flex-col gap-4" style={{ color: "var(--rj-ink)", fontSize: 15.5, lineHeight: 1.9 }}>
            {ABOUT_PARAGRAPHS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="about-contact">
          <h2 id="about-contact" className={styles.panelTitle}>
            <span>
              <SkinIcon name="report" size={18} />
            </span>
            聯絡我
          </h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.row}>
            <span>
              <small style={{ marginTop: 0 }}>聯絡信箱</small>
              <strong>{CONTACT_EMAIL}</strong>
            </span>
            <span aria-hidden style={{ color: "var(--rj-main)" }}>
              ✉
            </span>
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className={styles.btn} style={{ width: "100%", marginTop: 14 }}>
            寫信給我
          </a>
        </section>

        <Link href="/resident/profile" className={styles.btn} data-variant="line">
          我的設定（居民卡・里別・通知）<span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
