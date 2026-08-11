"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BulletinPost, BulletinTag } from "@/lib/bulletinData";
import { DAXI_VILLAGES } from "@/lib/daxiVillages";
import EmptyState from "./EmptyState";

const TAG_COLOR: Record<BulletinTag, string> = {
  疫苗: "var(--river-teal)",
  停水: "var(--daxi-red)",
  噴藥: "var(--block-moss-deep)",
  颱風: "var(--daxi-red)",
  活動: "var(--block-wood-deep)",
  一般: "var(--ink-soft)",
};

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
const rangeFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", timeZone: "Asia/Taipei" });

const ALL_FILTER = "全部";
const ROTATE_MS = 6000;
const PREVIEW_LIMIT = 30;

function formatPostedAt(value: number): string {
  return dateFormatter.format(new Date(value)).replace(/[\s\u00a0\u2000-\u200a\u202f]+/g, " ");
}

function formatRange(post: BulletinPost): string | null {
  if (!post.startDate && !post.endDate) return null;
  const start = post.startDate ? rangeFormatter.format(new Date(post.startDate)) : "即日起";
  const end = post.endDate ? rangeFormatter.format(new Date(post.endDate)) : "不限";
  return `${start} ~ ${end}`;
}

function truncateText(text: string, limit = PREVIEW_LIMIT): string {
  const compact = text.trim().replace(/\s+/g, " ");
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
}

function BulletinModal({ post, onClose }: { post: BulletinPost | null; onClose: () => void }) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [post, onClose]);

  if (!post) return null;

  const range = formatRange(post);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 fade-in sm:items-center sm:p-6"
      style={{ background: "rgba(15,13,10,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl px-5 pb-6 pt-4 sm:rounded-3xl"
        style={{ background: "var(--card)", boxShadow: "var(--shadow-float)" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => setTouchStartY(e.touches[0]?.clientY ?? null)}
        onTouchEnd={(e) => {
          if (touchStartY === null) return;
          const endY = e.changedTouches[0]?.clientY ?? touchStartY;
          if (endY - touchStartY > 90) onClose();
          setTouchStartY(null);
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {post.urgent ? (
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wide" style={{ background: "var(--daxi-red)", color: "#fff" }}>
                緊急
              </span>
            ) : null}
            {post.village ? (
              <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
                {post.village}
              </span>
            ) : null}
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ background: "rgba(0,0,0,0.06)", color: TAG_COLOR[tag] }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
            style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mb-1.5 text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
          {formatPostedAt(post.postedAt)}
        </div>
        <h2 className="text-[16.5px] font-bold leading-snug" style={{ color: post.urgent ? "var(--daxi-red)" : "var(--ink)" }}>
          {post.title}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {post.body}
        </p>
        {range ? (
          <div className="mt-4 rounded-2xl px-3 py-2 text-[12px] font-medium" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
            有效期間：{range}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// min-h rather than the old fixed h-[200px]: a one-line notice left a ~90px
// hole inside the blackboard frame, which read as a rendering bug.
function BulletinCard({ post, onOpen }: { post: BulletinPost; onOpen: () => void }) {
  const range = formatRange(post);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative flex min-h-[152px] w-full flex-col overflow-hidden rounded-[18px] border px-4 py-3.5 text-left transition-opacity active:opacity-80"
      style={
        post.urgent
          ? { background: "rgba(255,246,226,0.94)", borderColor: "rgba(215,160,107,0.9)", boxShadow: "0 10px 22px rgba(0,0,0,0.18)" }
          : { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.16)" }
      }
    >
      <span
        className="pointer-events-none absolute inset-x-4 top-[48px] h-px"
        style={{ background: post.urgent ? "rgba(160,106,58,0.16)" : "rgba(255,255,255,0.09)" }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-4 top-[82px] h-px"
        style={{ background: post.urgent ? "rgba(160,106,58,0.12)" : "rgba(255,255,255,0.07)" }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.urgent ? (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide" style={{ background: "var(--daxi-red)", color: "#fff" }}>
              緊急
            </span>
          ) : null}
          {post.village ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={post.urgent ? { background: "var(--river-teal-soft)", color: "var(--river-teal)" } : { background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.88)" }}
            >
              {post.village}
            </span>
          ) : null}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={post.urgent ? { background: "rgba(0,0,0,0.06)", color: TAG_COLOR[tag] } : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.78)" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[10.5px]" style={{ color: post.urgent ? "var(--ink-soft)" : "rgba(255,255,255,0.66)" }}>
          {formatPostedAt(post.postedAt)}
        </span>
      </div>
      <div
        className="relative mb-1 overflow-hidden text-[18px] font-black leading-snug"
        style={{ color: post.urgent ? "var(--daxi-red)" : "rgba(255,255,255,0.94)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      >
        {post.title}
      </div>
      <p
        className="relative overflow-hidden text-[12.5px] leading-relaxed"
        style={{ color: post.urgent ? "var(--ink-soft)" : "rgba(255,255,255,0.74)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      >
        {truncateText(post.body)}
      </p>
      {range ? (
        <div className="relative mt-1.5 shrink-0 text-[11px] font-medium" style={{ color: post.urgent ? "var(--river-teal)" : "rgba(215,160,107,0.95)" }}>
          {range}
        </div>
      ) : null}
      <div className="relative mt-auto shrink-0 pt-2 text-[11.5px] font-semibold" style={{ color: post.urgent ? "var(--block-wood-deep)" : "rgba(255,255,255,0.88)" }}>
        查看完整內容
      </div>
    </button>
  );
}

// 社區佈告欄輪播 — as more 里 start posting, a flat list would get long fast,
// so this rotates one post at a time (auto + manual dots/arrows) with a
// village filter chip row above it. Defaults to showing every village.
export default function CommunityBulletin({ posts }: { posts: BulletinPost[] }) {
  const villageOptions = useMemo(() => {
    const present = new Set(posts.map((p) => p.village).filter((v): v is (typeof DAXI_VILLAGES)[number] => Boolean(v)));
    return DAXI_VILLAGES.filter((v) => present.has(v));
  }, [posts]);

  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [timerVersion, setTimerVersion] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [openPost, setOpenPost] = useState<BulletinPost | null>(null);

  const filteredPosts = useMemo(() => {
    if (selectedVillages.length === 0) return posts;
    return posts.filter((p) => p.village && selectedVillages.includes(p.village));
  }, [posts, selectedVillages]);

  const resetTimer = useCallback(() => setTimerVersion((v) => v + 1), []);
  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (filteredPosts.length <= 0) return;
      setIndex((nextIndex + filteredPosts.length) % filteredPosts.length);
      resetTimer();
    },
    [filteredPosts.length, resetTimer],
  );

  const toggleVillage = (village: string) => {
    setSelectedVillages((current) => (current.includes(village) ? current.filter((item) => item !== village) : [...current, village]));
    setIndex(0);
    resetTimer();
  };

  useEffect(() => {
    if (filteredPosts.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % filteredPosts.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [filteredPosts.length, timerVersion]);

  if (posts.length === 0) {
    return (
      <div className="safe-page-x">
        <EmptyState variant="mascot" title="目前沒有社區公告" subtitle="里長發布的最新消息會顯示在這裡" />
      </div>
    );
  }

  const currentIndex = filteredPosts.length > 0 ? index % filteredPosts.length : 0;
  const current = filteredPosts[currentIndex];

  return (
    <div className="safe-page-x">
      {villageOptions.length > 0 ? (
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          <button
            type="button"
            onClick={() => {
              setSelectedVillages([]);
              setIndex(0);
              resetTimer();
            }}
            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition-opacity active:opacity-70"
            style={
              selectedVillages.length === 0
                ? { background: "var(--river-teal)", color: "#fff" }
                : { background: "var(--paper-2)", color: "var(--ink-soft)" }
            }
          >
            {ALL_FILTER}
          </button>
          {villageOptions.map((village) => {
            const selected = selectedVillages.includes(village);
            return (
              <button
                key={village}
                type="button"
                onClick={() => toggleVillage(village)}
                className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition-opacity active:opacity-70"
                style={selected ? { background: "var(--river-teal)", color: "#fff" } : { background: "var(--paper-2)", color: "var(--ink-soft)" }}
              >
                {village}
              </button>
            );
          })}
        </div>
      ) : null}
      <div
        className="rounded-[28px] p-2"
        style={{
          background: "linear-gradient(135deg, #c68a50 0%, #7a4b2c 48%, #4f321f 100%)",
          boxShadow: "0 18px 36px rgba(43,36,32,0.18)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[21px] px-3.5 pb-3.5 pt-3"
          style={{
            background: "linear-gradient(160deg, #1f463c 0%, #17362f 58%, #102a25 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 18px 36px rgba(0,0,0,0.18)",
          }}
          onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStartX === null || filteredPosts.length <= 1) return;
            const endX = e.changedTouches[0]?.clientX ?? touchStartX;
            const delta = endX - touchStartX;
            if (Math.abs(delta) > 44) goToIndex(currentIndex + (delta < 0 ? 1 : -1));
            setTouchStartX(null);
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.08), transparent 18%), linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "auto, 100% 34px",
              opacity: 0.55,
            }}
            aria-hidden
          />

          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0 text-[11px] font-black tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.86)" }}>
                里內公告
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {filteredPosts.length > 1 ? (
                  <>
                    <span className="text-[10.5px] font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.62)" }}>
                      {currentIndex + 1} / {filteredPosts.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToIndex(currentIndex - 1)}
                      aria-label="上一則公告"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
                      style={{ background: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.86)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => goToIndex(currentIndex + 1)}
                      aria-label="下一則公告"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
                      style={{ background: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.86)" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="relative rounded-[18px] border px-4 py-5 text-center" style={{ borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.78)" }}>
                <div className="text-[14px] font-bold">
                  {selectedVillages.length === 0 ? ALL_FILTER : selectedVillages.join("、")} 目前沒有公告
                </div>
                <div className="mt-1 text-[12px]">換個里別看看，或稍後再回來</div>
              </div>
            ) : (
              <>
                <BulletinCard post={current} onOpen={() => setOpenPost(current)} />

                {filteredPosts.length > 1 ? (
                  <div className="relative mt-2 flex items-center justify-center gap-1">
                    {filteredPosts.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goToIndex(i)}
                        aria-label={`第 ${i + 1} 則公告`}
                        className="rounded-full transition-all"
                        style={{
                          width: i === currentIndex ? 14 : 5,
                          height: 5,
                          background: i === currentIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <BulletinModal post={openPost} onClose={() => setOpenPost(null)} />
    </div>
  );
}
