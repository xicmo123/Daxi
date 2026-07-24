"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResidentCarouselSlide, ResidentSlideKind, ResidentSlideTag } from "@/lib/residentCarousel";
import { RESIDENT_FEATURES, type ResidentFeatureKey } from "@/lib/residentFeatures";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

const TAGS: { value: ResidentSlideTag; label: string }[] = [
  { value: "一般", label: "一般" },
  { value: "緊急", label: "緊急" },
  { value: "活動", label: "活動" },
];

export default function ResidentCarouselSlideForm({ slide }: { slide?: ResidentCarouselSlide }) {
  const router = useRouter();
  const isEdit = Boolean(slide);

  const [active, setActive] = useState(slide?.active ?? false);
  const [kind, setKind] = useState<ResidentSlideKind>(slide?.kind ?? "custom");
  const [featureKey, setFeatureKey] = useState<ResidentFeatureKey | "">(slide?.featureKey ?? "");
  const [tag, setTag] = useState<ResidentSlideTag>(slide?.tag ?? "一般");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [href, setHref] = useState(slide?.href ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const body = () => ({ active, kind, featureKey: featureKey || undefined, tag, title, subtitle, href });

  const applyFeature = (key: ResidentFeatureKey) => {
    const feature = RESIDENT_FEATURES.find((item) => item.key === key);
    if (!feature) return;
    setFeatureKey(feature.key);
    setTag(feature.tag);
    setTitle(feature.title);
    setSubtitle(feature.subtitle);
    setHref(feature.href);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(isEdit ? `/api/admin/resident-carousel/${slide!.id}` : "/api/admin/resident-carousel", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body()),
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
        router.push("/admin/resident-carousel");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!slide) return;
    if (!confirm(`確定要刪除「${slide.title}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/resident-carousel/${slide.id}`, { method: "DELETE" });
      router.push("/admin/resident-carousel");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
          {isEdit ? "編輯輪播項目" : "新增輪播項目"}
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
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        上架中（顯示在大溪人首頁輪播）
      </label>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        輪播內容
      </label>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { value: "feature" as const, label: "功能捷徑" },
          { value: "custom" as const, label: "自訂公告" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setKind(item.value)}
            className="rounded-lg px-3 py-2 text-[12.5px] font-semibold"
            style={{
              background: kind === item.value ? "#4a7594" : "#f4eee4",
              color: kind === item.value ? "#fff" : "#2f261f",
              border: "1px solid #dfd1bf",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {kind === "feature" ? (
        <>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            選擇功能
          </label>
          <select
            value={featureKey}
            onChange={(e) => applyFeature(e.target.value as ResidentFeatureKey)}
            required
            className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
            style={inputStyle}
          >
            <option value="">請選擇要放上輪播的功能</option>
            {RESIDENT_FEATURES.map((feature) => (
              <option key={feature.key} value={feature.key}>
                {feature.title}
              </option>
            ))}
          </select>
        </>
      ) : null}

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標籤
      </label>
      <div className="flex gap-2 mb-4">
        {TAGS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTag(t.value)}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium"
            style={{
              background: tag === t.value ? "#4a7594" : "#f4eee4",
              color: tag === t.value ? "#fff" : "#2f261f",
              border: "1px solid #dfd1bf",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        標題
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={40}
        required
        className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
        style={inputStyle}
      />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        副標（選填）
      </label>
      <input
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        maxLength={60}
        className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
        style={inputStyle}
      />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        點擊連結（選填，例如 /resident/outages 或外部網址）
      </label>
      <input
        value={href}
        onChange={(e) => setHref(e.target.value)}
        placeholder="/resident/announcements"
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
