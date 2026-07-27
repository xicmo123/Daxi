"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BulletinPost, BulletinTag } from "@/lib/bulletinData";
import { DAXI_VILLAGES, type DaxiVillage } from "@/lib/daxiVillages";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

const TAGS: BulletinTag[] = ["疫苗", "停水", "噴藥", "颱風", "活動", "一般"];

export default function BulletinForm({ post }: { post?: BulletinPost }) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [tags, setTags] = useState<BulletinTag[]>(post?.tags ?? []);
  const [village, setVillage] = useState<DaxiVillage | "">(post?.village ?? "");
  const [urgent, setUrgent] = useState(post?.urgent ?? false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleTag = (tag: BulletinTag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(isEdit ? `/api/admin/resident-bulletin/${post!.id}` : "/api/admin/resident-bulletin", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, tags, village: village || undefined, urgent }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "儲存失敗");
        return;
      }
      if (isEdit) {
        setMessage("已儲存");
        router.refresh();
      } else {
        router.push("/admin/resident-bulletin");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!post) return;
    if (!confirm(`確定要刪除「${post.title}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/resident-bulletin/${post.id}`, { method: "DELETE" });
      router.push("/admin/resident-bulletin");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯公告" : "新增公告"}
        </h1>
        {isEdit ? (
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="text-[12.5px] font-medium underline disabled:opacity-50"
            style={{ color: "#b0503f" }}
          >
            刪除
          </button>
        ) : null}
      </div>

      <label className="flex items-center gap-2 mb-4 text-[13px]" style={{ color: "#2f261f" }}>
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
        標記為緊急（置頂並以紅色強調，例如停水、颱風）
      </label>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標籤（可複選）
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
            style={{
              background: tags.includes(tag) ? "#4a7594" : "#f4eee4",
              color: tags.includes(tag) ? "#fff" : "#2f261f",
              border: "1px solid #dfd1bf",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        適用里別（選填，不指定代表全區適用）
      </label>
      <select
        value={village}
        onChange={(e) => setVillage(e.target.value as DaxiVillage | "")}
        className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
        style={inputStyle}
      >
        <option value="">不指定（全區）</option>
        {DAXI_VILLAGES.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標題
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={60}
        required
        className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
        style={inputStyle}
      />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        內容
      </label>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        maxLength={500}
        required
        className="w-full rounded-lg px-3 py-2.5 mb-5 text-[13px]"
        style={inputStyle}
      />

      {error ? (
        <div className="text-[12.5px] mb-4" style={{ color: "#b0503f" }}>
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="text-[12.5px] mb-4" style={{ color: "#4a7594" }}>
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
        style={{ background: "#4a7594", color: "#fff", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
