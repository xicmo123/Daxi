"use client";

import { useCallback, useMemo, useState } from "react";
import type { BulletinPost } from "@/lib/bulletinData";
import { DAXI_VILLAGES } from "@/lib/daxiVillages";
import SkinRail from "@/components/skin/SkinRail";
import SkinSheet from "@/components/skin/SkinSheet";
import styles from "@/components/skin/Skin.module.css";

const ALL = "全部";
const postedFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", timeZone: "Asia/Taipei" });
const rangeFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", timeZone: "Asia/Taipei" });

function formatRange(post: BulletinPost): string | null {
  if (!post.startDate && !post.endDate) return null;
  const start = post.startDate ? rangeFormatter.format(new Date(post.startDate)) : "即日起";
  const end = post.endDate ? rangeFormatter.format(new Date(post.endDate)) : "不限";
  return `${start} – ${end}`;
}

function Badges({ post }: { post: BulletinPost }) {
  return (
    <>
      {post.urgent ? (
        <span className={styles.badge} data-tone="alert">
          緊急
        </span>
      ) : null}
      {post.village ? (
        <span className={styles.badge} data-tone="main">
          {post.village}
        </span>
      ) : null}
      {post.tags.map((tag) => (
        <span key={tag} className={styles.badge}>
          {tag}
        </span>
      ))}
    </>
  );
}

// 社區佈告欄 as a Jeju-style card rail: every post visible at a glance and
// swipeable, instead of one post at a time on a timer. Village chips filter
// it; a card opens the full post in a sheet.
export default function ResidentBulletin({ posts }: { posts: BulletinPost[] }) {
  const villages = useMemo(() => {
    const present = new Set(posts.map((p) => p.village).filter(Boolean));
    return DAXI_VILLAGES.filter((v) => present.has(v));
  }, [posts]);
  const [village, setVillage] = useState<string>(ALL);
  const [openPost, setOpenPost] = useState<BulletinPost | null>(null);
  const closePost = useCallback(() => setOpenPost(null), []);

  const shown = village === ALL ? posts : posts.filter((p) => p.village === village);

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>目前沒有社區公告</strong>
        里長發布的最新消息會顯示在這裡
      </div>
    );
  }

  return (
    <>
      {villages.length > 0 ? (
        <div className={styles.chips} role="group" aria-label="依里別篩選">
          {[ALL, ...villages].map((v) => (
            <button key={v} type="button" className={styles.chip} aria-pressed={village === v} onClick={() => setVillage(v)}>
              {v}
            </button>
          ))}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <strong>{village} 目前沒有公告</strong>
          換個里別看看，或稍後再回來
        </div>
      ) : (
        <SkinRail label="社區公告">
          {shown.map((post) => {
            const range = formatRange(post);
            return (
              <button
                key={post.id}
                type="button"
                role="listitem"
                className={styles.bulletin}
                data-urgent={post.urgent ? "true" : undefined}
                onClick={() => setOpenPost(post)}
              >
                <span className={styles.bulletinMeta}>
                  <Badges post={post} />
                </span>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <span className={styles.bulletinFoot}>
                  <span>{range ? `有效 ${range}` : `${postedFormatter.format(new Date(post.postedAt))} 發布`}</span>
                  <span aria-hidden>→</span>
                </span>
              </button>
            );
          })}
        </SkinRail>
      )}

      {openPost ? (
        <SkinSheet title={openPost.title} eyebrow={<Badges post={openPost} />} onClose={closePost}>
          <div className="mb-3 text-app-label" style={{ color: "var(--rj-ink-soft)" }}>
            {postedFormatter.format(new Date(openPost.postedAt))} 發布
          </div>
          <p>{openPost.body}</p>
          {formatRange(openPost) ? <div className={styles.sheetNote}>有效期間：{formatRange(openPost)}</div> : null}
        </SkinSheet>
      ) : null}
    </>
  );
}
