import PageHeader from "@/components/PageHeader";
import AnnouncementFeed from "@/components/AnnouncementFeed";
import { ANNOUNCEMENTS_PAGE_URL, fetchDaxiAnnouncements } from "@/lib/announcements";

export const revalidate = 1800;

export default async function AnnouncementsPage() {
  const announcements = await fetchDaxiAnnouncements(30);

  return (
    <div className="pt-2">
      <PageHeader title="區公所公告" subtitle="同步大溪區公所最新消息" tint="river" />

      <div className="px-6 pb-24 fade-in">
        <a
          href={ANNOUNCEMENTS_PAGE_URL}
          target="_blank"
          rel="noreferrer"
          className="mb-4 flex items-center justify-between rounded-xl px-4 py-3 text-[12.5px] transition-opacity active:opacity-70"
          style={{ background: "var(--daxi-red-soft)", border: "1px solid var(--line)", color: "var(--ink)" }}
        >
          <span>資料來源：桃園市大溪區公所</span>
          <span aria-hidden="true">↗</span>
        </a>

        {announcements.length > 0 ? (
          <AnnouncementFeed items={announcements} tint="var(--daxi-red)" tintSoft="var(--daxi-red-soft)" />
        ) : (
          <div
            className="rounded-xl px-5 py-8 text-center"
            style={{ background: "var(--card)", border: "1px solid var(--line)" }}
          >
            <div className="font-serif text-lg font-semibold" style={{ color: "var(--ink)" }}>
              目前無法取得公告
            </div>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              區公所資料源暫時沒有回應，請稍後再試，或直接前往官方公告頁查看。
            </p>
            <a
              href={ANNOUNCEMENTS_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity active:opacity-70"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              前往區公所官網
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
