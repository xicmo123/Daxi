"use client";

import { useEffect, useMemo, useState } from "react";
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

const ALL_FILTER = "全部";
const ROTATE_MS = 6000;

function BulletinCard({ post }: { post: BulletinPost }) {
  return (
    <div
      className="rounded-2xl px-4 py-3.5"
      style={
        post.urgent
          ? { background: "var(--daxi-red-soft)", border: "1.5px solid var(--daxi-red)" }
          : { background: "var(--card)", boxShadow: "var(--shadow-card)" }
      }
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {post.urgent ? (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide" style={{ background: "var(--daxi-red)", color: "#fff" }}>
              緊急
            </span>
          ) : null}
          {post.village ? (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--river-teal-soft)", color: "var(--river-teal)" }}>
              📍 {post.village}
            </span>
          ) : null}
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.06)", color: TAG_COLOR[tag] }}>
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
          {dateFormatter.format(new Date(post.postedAt))}
        </span>
      </div>
      <div className="text-[13.5px] font-bold mb-1" style={{ color: post.urgent ? "var(--daxi-red)" : "var(--ink)" }}>
        {post.title}
      </div>
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {post.body}
      </p>
    </div>
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

  const [filter, setFilter] = useState<string>(ALL_FILTER);
  const [index, setIndex] = useState(0);

  const filteredPosts = useMemo(() => {
    if (filter === ALL_FILTER) return posts;
    return posts.filter((p) => p.village === filter);
  }, [posts, filter]);

  useEffect(() => {
    setIndex(0);
  }, [filter]);

  useEffect(() => {
    if (filteredPosts.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % filteredPosts.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [filteredPosts.length]);

  if (posts.length === 0) {
    return (
      <div className="safe-page-x">
        <EmptyState variant="mascot" title="目前沒有社區公告" subtitle="里長發布的最新消息會顯示在這裡" />
      </div>
    );
  }

  const current = filteredPosts[index % filteredPosts.length];

  return (
    <div className="flex flex-col gap-2.5">
      {villageOptions.length > 0 ? (
        <div className="safe-page-x flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          <button
            type="button"
            onClick={() => setFilter(ALL_FILTER)}
            className="shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-opacity active:opacity-70"
            style={
              filter === ALL_FILTER
                ? { background: "var(--river-teal)", color: "#fff" }
                : { background: "var(--paper-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
            }
          >
            {ALL_FILTER}
          </button>
          {villageOptions.map((village) => (
            <button
              key={village}
              type="button"
              onClick={() => setFilter(village)}
              className="shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-opacity active:opacity-70"
              style={
                filter === village
                  ? { background: "var(--river-teal)", color: "#fff" }
                  : { background: "var(--paper-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
              }
            >
              {village}
            </button>
          ))}
        </div>
      ) : null}

      {filteredPosts.length === 0 ? (
        <div className="safe-page-x">
          <EmptyState variant="mascot" title={`${filter} 目前沒有公告`} subtitle="換個里別看看，或稍後再回來" />
        </div>
      ) : (
        <div className="safe-page-x flex items-center gap-2">
          {filteredPosts.length > 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + filteredPosts.length) % filteredPosts.length)}
              aria-label="上一則公告"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
              style={{ background: "var(--paper-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          ) : null}

          <div className="min-w-0 flex-1">
            <BulletinCard post={current} />
            {filteredPosts.length > 1 ? (
              <div className="mt-2 flex items-center justify-center gap-1">
                {filteredPosts.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`第 ${i + 1} 則公告`}
                    className="rounded-full transition-all"
                    style={{
                      width: i === index ? 14 : 5,
                      height: 5,
                      background: i === index ? "var(--river-teal)" : "var(--line)",
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {filteredPosts.length > 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % filteredPosts.length)}
              aria-label="下一則公告"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
              style={{ background: "var(--paper-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
