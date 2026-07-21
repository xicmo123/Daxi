"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Business, BusinessTag } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail } from "@/lib/placeDetails";

const TAGS: BusinessTag[] = ["美食", "景點", "市集"];

const inputStyle = {
  background: "var(--paper-2)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
} as const;

export default function PlaceEditForm({
  place,
  photo,
  detail,
  isCustom,
}: {
  place: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  isCustom: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(place.name);
  const [address, setAddress] = useState(place.address ?? "");
  const [tag, setTag] = useState<BusinessTag>(place.tag);
  const [lat, setLat] = useState(String(place.lat));
  const [lng, setLng] = useState(String(place.lng));

  const [category, setCategory] = useState(detail?.category ?? "");
  const [story, setStory] = useState(detail?.story ?? "");
  const [tagsText, setTagsText] = useState((detail?.tags ?? []).join(", "));

  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const [photoAuthor, setPhotoAuthor] = useState("");
  const [photoSourceUrl, setPhotoSourceUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/places/${place.placeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isCustom ? name : undefined,
          address: isCustom ? address : undefined,
          tag: isCustom ? tag : undefined,
          lat: isCustom ? Number(lat) : undefined,
          lng: isCustom ? Number(lng) : undefined,
          category,
          story,
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "儲存失敗");
        return;
      }
      setMessage("已儲存");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("placeId", place.placeId);
      form.append("file", file);
      if (photoAuthor.trim()) form.append("author", photoAuthor.trim());
      if (photoSourceUrl.trim()) form.append("sourceUrl", photoSourceUrl.trim());
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "上傳失敗");
        return;
      }
      setCurrentPhoto({ src: data.src, author: photoAuthor.trim() || undefined, sourceUrl: photoSourceUrl.trim() || undefined });
      setMessage("照片已上傳");
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/upload?placeId=${encodeURIComponent(place.placeId)}`, { method: "DELETE" });
      if (!res.ok) {
        setError("移除失敗");
        return;
      }
      setCurrentPhoto(undefined);
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`確定要刪除「${place.name}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/places/${place.placeId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "刪除失敗");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push("/admin")}
        className="text-[12.5px] mb-4 underline"
        style={{ color: "var(--ink-soft)" }}
      >
        ← 返回列表
      </button>

      <h1 className="font-serif text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        {place.name}
      </h1>
      <p className="text-[12px] mb-6" style={{ color: "var(--ink-soft)" }}>
        {isCustom ? "自訂項目 — 所有欄位皆可編輯" : "Google 商家資料 — 店名/地址/評分由每週排程自動更新，僅能編輯下方覆蓋資料"}
      </p>

      {/* Photo */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
          照片
        </h2>
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3" style={{ background: "var(--line)" }}>
          {currentPhoto ? (
            <Image src={currentPhoto.src} alt={place.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
              尚無照片
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 mb-3">
          <input
            value={photoAuthor}
            onChange={(e) => setPhotoAuthor(e.target.value)}
            placeholder="攝影者／來源（選填）"
            className="rounded-lg px-3 py-2 text-[13px] outline-none"
            style={inputStyle}
          />
          <input
            value={photoSourceUrl}
            onChange={(e) => setPhotoSourceUrl(e.target.value)}
            placeholder="來源連結（選填）"
            className="rounded-lg px-3 py-2 text-[13px] outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[12.5px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-70 disabled:opacity-50"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            {uploading ? "處理中…" : currentPhoto ? "更換照片" : "上傳照片"}
          </button>
          {currentPhoto ? (
            <button
              onClick={removePhoto}
              disabled={uploading}
              className="text-[12.5px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-70 disabled:opacity-50"
              style={{ background: "var(--paper-2)", color: "var(--status-warn)", border: "1px solid var(--line)" }}
            >
              移除照片
            </button>
          ) : null}
        </div>
      </section>

      {/* Basic info */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
          基本資料
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              店名
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isCustom}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none disabled:opacity-60"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              地址
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isCustom}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none disabled:opacity-60"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                分類 Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as BusinessTag)}
                disabled={!isCustom}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none disabled:opacity-60"
                style={inputStyle}
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                緯度 lat
              </label>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={!isCustom}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none disabled:opacity-60"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                經度 lng
              </label>
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                disabled={!isCustom}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none disabled:opacity-60"
                style={inputStyle}
              />
            </div>
          </div>
          {!isCustom ? (
            <div className="text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
              評分 {place.rating ?? "—"} ・ {place.reviewCount.toLocaleString()} 則評論（Google 資料，不可編輯）
            </div>
          ) : null}
        </div>
      </section>

      {/* Curated overlay */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
          分類標籤與故事
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              分類（例如：豆干老店、木藝職人；留空則自動依 Google 類型顯示）
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              故事引言（顯示於詳情卡片照片上，建議 50 字內）— {story.length} 字
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              標籤（用逗號分隔，例如：#百年老店, #排隊美食）
            </label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {error ? (
        <div className="text-[12.5px] mb-4" style={{ color: "var(--status-warn)" }}>
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="text-[12.5px] mb-4" style={{ color: "var(--status-ok)" }}>
          {message}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          onClick={save}
          disabled={saving}
          className="text-[13.5px] font-medium rounded-lg px-5 py-2.5 transition-opacity active:opacity-80 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          {saving ? "儲存中…" : "儲存"}
        </button>
        {isCustom ? (
          <button
            onClick={remove}
            disabled={deleting}
            className="text-[13px] font-medium underline disabled:opacity-50"
            style={{ color: "var(--status-warn)" }}
          >
            {deleting ? "刪除中…" : "刪除這個項目"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
