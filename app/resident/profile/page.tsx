import { Suspense } from "react";
import AboutLinkCard from "@/components/AboutLinkCard";
import IdentitySwitchCard from "@/components/IdentitySwitchCard";
import NotificationSettings from "@/components/NotificationSettings";
import ResidentIdCard from "@/components/ResidentIdCard";
import MyHomeSettings from "@/components/resident/MyHomeSettings";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/skin/Skin.module.css";
import { loadHomeStops } from "@/lib/homeStops";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/profile",
  title: "我的設定",
  description: "居民卡、我家與通知設定。",
  noindex: true,
});

export const dynamic = "force-dynamic";

async function MyHome() {
  return <MyHomeSettings stops={await loadHomeStops()} />;
}

export default function ResidentProfilePage() {
  return (
    <main>
      <ResidentPageHeader href="/resident/profile" title="我的" lead="居民卡、我家與通知設定。" />

      <div className={styles.body}>
        <ResidentIdCard />

        <Suspense fallback={<div className="skeleton" style={{ minHeight: 120, borderRadius: 20, background: "var(--rj-surface)" }} />}>
          <MyHome />
        </Suspense>

        {/* Placed here, not on first launch: iOS grants exactly one permission
            prompt, and asking before a resident has seen what the alerts are
            for is how an app loses the ability to warn anyone about a water
            outage. */}
        <NotificationSettings />

        <div className={styles.cardGrid}>
          <IdentitySwitchCard currentLabel="大溪人" switchToHref="/" switchToLabel="切換為遊客模式" switchToIdentity="tourist" />
          <AboutLinkCard />
        </div>

        <p className={styles.note}>
          「我是大溪人」是給大溪居民的生活資訊入口，公告、停水停電等資料會持續更新。如發現資料有誤，歡迎透過「陳情 / 報修」回報。
        </p>
      </div>
    </main>
  );
}
