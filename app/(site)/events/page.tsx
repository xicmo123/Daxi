import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EventsList from "@/components/EventsList";
// force-dynamic below zeroes the TTL on every fetch in this segment; the
// cached wrapper is immune to it. See lib/cachedSources.ts.
import { getCachedEvents } from "@/lib/cachedSources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "大溪活動行事曆",
  description: "大溪大禧與大溪老街周邊活動時間、地點與交通管制資訊，整合桃園市政府觀光旅遊局公開資料與在地公告。",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "大溪活動行事曆 ｜ 大溪通",
    description: "大溪大禧與老街周邊活動時間、地點與交通管制。",
    url: "/events",
  },
};

export default async function EventsPage() {
  const slides = await getCachedEvents();
  const events = slides.map((event) => ({
    key: event.id,
    phase: event.phase,
    date: event.date,
    time: event.time,
    title: event.title,
    desc: event.desc,
    history: event.history,
    theme: event.theme,
    badges: event.badges,
    ctaLabel: event.ctaLabel,
    ctaUrl: event.ctaUrl,
    photoSrc: event.photoSrc,
    photoHistorical: event.photoHistorical,
  }));

  return (
    <div className="pt-2">
      <PageHeader title="活動" subtitle="大溪大禧與老街周邊活動" tint="moss" />
      <EventsList events={events} />
    </div>
  );
}
