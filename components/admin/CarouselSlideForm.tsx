"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { CarouselSlide } from "@/lib/carousel";

const inputStyle = {
  background: "var(--paper-2)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
} as const;

const PHASES: { value: CarouselSlide["phase"]; label: string }[] = [
  { value: "past", label: "已結束" },
  { value: "ongoing", label: "進行中" },
  { value: "upcoming", label: "即將登場" },
];

const BADGE_OPTIONS: { value: "route" | "live"; label: string }[] = [
  { value: "route", label: "交通管制" },
  { value: "live", label: "陸續更新" },
];

export default function CarouselSlideForm({ slide }: { slide?: CarouselSlide }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(slide);

  const [date, setDate] = useState(slide?.date ?? "");
  const [isoDate, setIsoDate] = useState(slide?.isoDate ?? "");
  const [phase, setPhase] = useState<CarouselSlide["phase"]>(slide?.phase ?? "upcoming");
  const [time, setTime] = useState(slide?.time ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [desc, setDesc] = useState(slide?.desc ?? "");
  const [history, setHistory] = useState(slide?.history ?? "");
  const [theme, setTheme] = useState(slide?.theme ?? "");
  const [badges, setBadges] = useState<("route" | "live")[]>(slide?.badges ?? []);
  const [ctaLabel, setCtaLabel] = useState(slide?.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(slide?.ctaUrl ?? "");

  const [currentPhoto, setCurrentPhoto] = useState(slide?.photo);
  const [photoAuthor, setPhotoAuthor] = useState("");
  const [photoSourceUrl, setPhotoSourceUrl] = useState("");
  const [photoHistorical, setPhotoHistorical] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleBadge = (b: "route" | "live") => {
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const body = () => ({
    date,
    isoDate: isoDate || undefined,
    phase,
    time,
    title,
    desc,
    history,
    theme,
    badges,
    ctaLabel,
    ctaUrl,
  });

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (isEdit && slide) {
        const res = await fetch(`/api/admin/carousel/${slide.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body()),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "儲存失敗");
          return;
        }
        setMessage("已儲存");
        router.refresh();
      } else {
        const res = await fetch("/api/admin/carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body()),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "建立失敗");
          return;
        }
        router.push(`/admin/carousel/${data.slide.id}`);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!slide) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("slideId", slide.id);
      form.append("file", file);
      if (photoAuthor.trim()) form.append("author", photoAuthor.trim());
      if (photoSourceUrl.trim()) form.append("sourceUrl", photoSourceUrl.trim());
      if (photoHistorical) form.append("historical", "true");
      const res = await fetch("/api/admin/carousel/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "上傳失敗");
        return;
      }
      setCurrentPhoto(data.slide.photo);
      setMessage("照片已上傳");
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!slide) return;
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/carousel/upload?slideId=${encodeURIComponent(slide.id)}`, {
        method: "DELETE",
      });
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
    if (!slide) return;
    if (!confirm(`確定要刪除「${slide.title}」嗎？此動作無法復原。`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/carousel/${slide.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "刪除失敗");
        return;
      }
      router.push("/admin/carousel");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push("/admin/carousel")}
        className="text-[12.5px] mb-4 underline"
        style={{ color: "var(--ink-soft)" }}
      >
        ← 返回輪播列表
      </button>

      <h1 className="font-serif text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>
        {isEdit ? slide!.title : "新增輪播項目"}
      </h1>
      <p className="text-[12px] mb-6" style={{ color: "var(--ink-soft)" }}>
        顯示於首頁最上方的活動輪播
      </p>

      {isEdit ? (
        <section className="mb-8">
          <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
            照片
          </h2>
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3" style={{ background: "var(--line)" }}>
            {currentPhoto ? (
              <Image src={currentPhoto.src} alt={slide!.title} fill className="object-cover" />
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
            <label className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--ink)" }}>
              <input type="checkbox" checked={photoHistorical} onChange={(e) => setPhotoHistorical(e.target.checked)} />
              示意圖・非本次活動實拍（例如舊照片）
            </label>
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
      ) : null}

      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
          基本資料
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                日期顯示文字 *（例如：7/18（六）或 7/19（日）－8/5（三））
              </label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                單日活動日期（選填，用來判斷「今天」是否自動開啟這則）
              </label>
              <input
                type="date"
                value={isoDate}
                onChange={(e) => setIsoDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                狀態
              </label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as CarouselSlide["phase"])}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              >
                {PHASES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              活動時間文字（例如：13:00–18:00）
            </label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              標題 *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              說明 *
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-2">
            {BADGE_OPTIONS.map((b) => (
              <label
                key={b.value}
                className="flex items-center gap-1.5 text-[12.5px] rounded-lg px-3 py-2"
                style={{ ...inputStyle }}
              >
                <input type="checkbox" checked={badges.includes(b.value)} onChange={() => toggleBadge(b.value)} />
                {b.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
          延伸內容（選填）
        </h2>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--ink-soft)" }}>
          點開詳情時額外顯示，「歷史沿革」優先於「活動主軸」顯示
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              歷史沿革
            </label>
            <textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              活動主軸
            </label>
            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none resize-none"
              style={inputStyle}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                外部連結文字
              </label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="例如：前往官方粉專看最新場次 →"
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                外部連結網址
              </label>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>
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
          {saving ? "儲存中…" : isEdit ? "儲存" : "建立，接著上傳照片"}
        </button>
        {isEdit ? (
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
