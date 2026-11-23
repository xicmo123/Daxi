import AnnouncementFeed from "@/components/AnnouncementFeed";
import ResidentPageHeader from "@/components/resident/ResidentPageHeader";
import styles from "@/components/resident/ResidentSkin.module.css";
import { ANNOUNCEMENTS_PAGE_URL, fetchDaxiAnnouncements } from "@/lib/announcements";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/resident/announcements",
  title: "大溪區公所最新公告",
  description: "即時同步桃園市大溪區公所最新消息：補助申請、活動、施工與防災通知，大溪居民一次看完。",
});

export const revalidate = 1800;

export default async function ResidentAnnouncementsPage() {
  const announcements = await fetchDaxiAnnouncements(30).catch(() => []);

  return (
    <main>
      <ResidentPageHeader href="/resident/announcements" title="區公所公告" lead="同步桃園市大溪區公所的最新消息。" />

      <div className={styles.body}>
        {announcements.length > 0 ? (
          <AnnouncementFeed items={announcements} tint="var(--rj-main)" tintSoft="var(--rj-main-soft)" />
        ) : (
          <div className={styles.empty}>
            <strong>目前無法取得公告</strong>
            區公所資料源暫時沒有回應，請稍後再試，或直接前往官方公告頁查看。
            <div className="mt-4">
              <a href={ANNOUNCEMENTS_PAGE_URL} target="_blank" rel="noreferrer" className={styles.btn}>
                前往區公所官網 ↗
              </a>
            </div>
          </div>
        )}

        <p className={styles.note}>
          資料來源：
          <a href={ANNOUNCEMENTS_PAGE_URL} target="_blank" rel="noreferrer">
            桃園市大溪區公所 ↗
          </a>
          ，每 30 分鐘更新。
        </p>
      </div>
    </main>
  );
}
