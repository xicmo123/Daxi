"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BulletinPost } from "@/lib/bulletinData";

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function BulletinList({ posts }: { posts: BulletinPost[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string, title: string) => {
    if (!confirm(`確定要刪除「${title}」嗎？此動作無法復原。`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/resident-bulletin/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  const sorted = [...posts].sort((a, b) => b.postedAt - a.postedAt);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
            社區佈告欄
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "#766a5d" }}>
            管理大溪人首頁的社區公告；標記「緊急」的會置頂並以紅色強調
          </p>
        </div>
        <Link
          href="/admin/resident-bulletin/new"
          className="text-[13px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-80 shrink-0"
          style={{ background: "#4a7594", color: "#fff" }}
        >
          + 新增公告
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map((post) => (
          <div key={post.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#fffaf1", border: "1px solid #dfd1bf" }}>
            {post.urgent ? (
              <span className="shrink-0 text-[10.5px] font-bold rounded-full px-2 py-1" style={{ background: "#b0503f", color: "#fff" }}>
                緊急
              </span>
            ) : null}
            <Link href={`/admin/resident-bulletin/${post.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate" style={{ color: "#2f261f" }}>
                {post.title}
              </div>
              <div className="text-[11.5px] truncate" style={{ color: "#766a5d" }}>
                {post.village ? `${post.village} ・ ` : ""}
                {post.tags.join("、") || "無標籤"} ・ {dateFormatter.format(new Date(post.postedAt))}
              </div>
            </Link>
            <button
              onClick={() => remove(post.id, post.title)}
              disabled={busyId === post.id}
              aria-label="刪除"
              className="shrink-0 text-[11.5px] font-medium underline disabled:opacity-50"
              style={{ color: "#b0503f" }}
            >
              刪除
            </button>
          </div>
        ))}
        {sorted.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "#766a5d" }}>
            尚未發布任何社區公告
          </p>
        ) : null}
      </div>
    </div>
  );
}
