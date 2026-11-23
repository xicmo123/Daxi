import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import styles from "@/components/TouristGuide.module.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PullToRefresh />

      <div className="app-screen relative z-10 flex flex-1 justify-center">
        <div className="w-full min-w-0 max-w-md md:max-w-3xl md:border-x lg:max-w-6xl" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
          <header className={styles.topbar}>
            <Link href="/" className={styles.wordmark} aria-label="大溪通首頁">大溪通</Link>
            <nav className={styles.headerLinks} aria-label="大溪旅遊資訊">
              <Link href="/weather" className={styles.headerLink}>天氣與路況</Link>
              <Link href="/announcements" className={styles.headerLink}>公告</Link>
            </nav>
          </header>
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
