"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Business, BusinessTag } from "@/lib/businesses";
import type { PhotoCredit } from "@/lib/data";
import type { PlaceDetail, ReservationDetail } from "@/lib/placeDetails";
import type { Booking, ReservationSlot, SlotWithAvailability } from "@/lib/reservations";

const TAGS: BusinessTag[] = ["美食", "景點", "市集"];

type ContactType = NonNullable<ReservationDetail["contactType"]>;

const CONTACT_TYPES: { value: ContactType; label: string; placeholder: string }[] = [
  { value: "phone", label: "電話", placeholder: "03-1234567" },
  { value: "line", label: "LINE 官方帳號連結", placeholder: "https://line.me/R/ti/p/@xxxxx" },
  { value: "form", label: "表單連結", placeholder: "https://forms.gle/xxxxx" },
];

const BOOKING_STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "待確認",
  confirmed: "已確認",
  cancelled: "已取消",
};

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
  slots,
  bookings,
}: {
  place: Business;
  photo: PhotoCredit | undefined;
  detail: PlaceDetail | undefined;
  isCustom: boolean;
  slots: SlotWithAvailability[];
  bookings: (Booking & { slot: ReservationSlot | null })[];
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
  const [contactPhone, setContactPhone] = useState(detail?.contact?.phone ?? "");
  const [contactFacebook, setContactFacebook] = useState(detail?.contact?.facebook ?? "");
  const [contactInstagram, setContactInstagram] = useState(detail?.contact?.instagram ?? "");
  const [contactWebsite, setContactWebsite] = useState(detail?.contact?.website ?? "");
  const [hidden, setHidden] = useState(Boolean(detail?.hidden));
  const [featured, setFeatured] = useState(Boolean(detail?.featured));

  const [reservationEnabled, setReservationEnabled] = useState(Boolean(detail?.reservation));
  const [reservationMode, setReservationMode] = useState<ReservationDetail["mode"]>(
    detail?.reservation?.mode ?? "inquiry"
  );
  const [contactType, setContactType] = useState<ContactType>(detail?.reservation?.contactType ?? "phone");
  const [contactValue, setContactValue] = useState(detail?.reservation?.contactValue ?? "");
  const [reservationNote, setReservationNote] = useState(detail?.reservation?.note ?? "");

  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [slotCapacity, setSlotCapacity] = useState("4");
  const [slotNote, setSlotNote] = useState("");
  const [slotBusy, setSlotBusy] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [bookingBusyId, setBookingBusyId] = useState<string | null>(null);

  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const [photoAuthor, setPhotoAuthor] = useState("");
  const [photoSourceUrl, setPhotoSourceUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (reservationEnabled && reservationMode === "inquiry" && !contactValue.trim()) {
      setError("「詢問聯絡」模式須填寫聯絡方式");
      return;
    }
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
          contact: {
            phone: contactPhone.trim() || undefined,
            facebook: contactFacebook.trim() || undefined,
            instagram: contactInstagram.trim() || undefined,
            website: contactWebsite.trim() || undefined,
          },
          featured,
          hidden,
          reservation: reservationEnabled
            ? {
                mode: reservationMode,
                contactType: contactValue.trim() ? contactType : undefined,
                contactValue: contactValue.trim() || undefined,
                note: reservationNote.trim() || undefined,
              }
            : null,
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

  const addSlot = async () => {
    setSlotError(null);
    const capacity = Number(slotCapacity);
    if (!slotDate || !slotTime) {
      setSlotError("請選擇日期與時間");
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      setSlotError("名額須為正整數");
      return;
    }
    setSlotBusy(true);
    try {
      const res = await fetch("/api/admin/reservations/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.placeId,
          date: slotDate,
          time: slotTime,
          capacity,
          note: slotNote.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSlotError(data.error ?? "新增時段失敗");
        return;
      }
      setSlotDate("");
      setSlotTime("");
      setSlotCapacity("4");
      setSlotNote("");
      router.refresh();
    } finally {
      setSlotBusy(false);
    }
  };

  const removeSlot = async (slotId: string) => {
    if (!confirm("確定要刪除這個時段嗎？")) return;
    setSlotError(null);
    setSlotBusy(true);
    try {
      const res = await fetch(`/api/admin/reservations/slots/${slotId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSlotError(data.error ?? "刪除失敗");
        return;
      }
      router.refresh();
    } finally {
      setSlotBusy(false);
    }
  };

  const setBookingStatus = async (bookingId: string, status: Booking["status"]) => {
    setBookingBusyId(bookingId);
    try {
      const res = await fetch(`/api/admin/reservations/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBookingBusyId(null);
    }
  };

  const remove = async () => {
    const warning = isCustom
      ? `確定要刪除「${place.name}」嗎？此動作無法復原。`
      : `確定要刪除「${place.name}」嗎？這是 Google 商家資料，刪除後即使每週排程重新抓取，這筆項目也不會再出現。`;
    if (!confirm(warning)) return;
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

      {/* Soft-hide — for Google-sourced places whose data is inaccurate but
          whose location/nav link you still want kept around */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
          顯示狀態
        </h2>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--ink-soft)" }}>
          可控制這筆資料是否出現在前台，以及是否排入首頁面的精選推薦區
        </p>
        <label className="flex items-center gap-2 mb-2 text-[13px]" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          前台精選推薦（景點頁／商家頁的推薦區會優先顯示）
        </label>
        <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--ink)" }}>
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          隱藏此項目（不會出現在 App 前台）
        </label>
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

      {/* Frontend detail contact */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
          前台聯絡資訊
        </h2>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--ink-soft)" }}>
          只會顯示在遊客點進商家／景點詳情後，列表卡片不會顯示
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              電話
            </label>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="03-1234567"
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              Facebook
            </label>
            <input
              value={contactFacebook}
              onChange={(e) => setContactFacebook(e.target.value)}
              placeholder="https://www.facebook.com/..."
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              Instagram
            </label>
            <input
              value={contactInstagram}
              onChange={(e) => setContactInstagram(e.target.value)}
              placeholder="https://www.instagram.com/... 或 @account"
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              官方網站
            </label>
            <input
              value={contactWebsite}
              onChange={(e) => setContactWebsite(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Reservation inquiry — Phase 1: outbound contact link, not an in-app booking flow */}
      <section className="mb-8">
        <h2 className="text-[13px] font-semibold mb-1" style={{ color: "var(--ink)" }}>
          預約 / 訂位
        </h2>
        <p className="text-[11.5px] mb-3" style={{ color: "var(--ink-soft)" }}>
          啟用後，遊客在商家詳情頁會看到「預約詢問」按鈕，導向下方聯絡方式（非即時線上訂位）
        </p>
        <label className="flex items-center gap-2 mb-3 text-[13px]" style={{ color: "var(--ink)" }}>
          <input
            type="checkbox"
            checked={reservationEnabled}
            onChange={(e) => setReservationEnabled(e.target.checked)}
          />
          開放預約詢問
        </label>
        {reservationEnabled ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(
                [
                  { value: "inquiry" as const, label: "詢問聯絡" },
                  { value: "slots" as const, label: "站內選時段" },
                ]
              ).map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setReservationMode(m.value)}
                  className="flex-1 text-[12.5px] font-medium rounded-lg px-3 py-2 transition-opacity active:opacity-80"
                  style={
                    reservationMode === m.value
                      ? { background: "var(--accent)", color: "var(--accent-fg)" }
                      : { background: "var(--paper-2)", color: "var(--ink-soft)", border: "1px solid var(--line)" }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                聯絡方式{reservationMode === "slots" ? "（選填，作為備用聯絡窗口）" : ""}
              </label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value as ContactType)}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              >
                {CONTACT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={CONTACT_TYPES.find((c) => c.value === contactType)?.placeholder}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
                備註（選填，例如：需提前一天預約）
              </label>
              <input
                value={reservationNote}
                onChange={(e) => setReservationNote(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
                style={inputStyle}
              />
            </div>

            {reservationMode === "slots" ? (
              <div className="mt-2 pt-4" style={{ borderTop: "1px solid var(--line)" }}>
                <h3 className="text-[12.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
                  時段管理
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="time"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    min={1}
                    value={slotCapacity}
                    onChange={(e) => setSlotCapacity(e.target.value)}
                    placeholder="名額"
                    className="w-20 rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={inputStyle}
                  />
                  <input
                    value={slotNote}
                    onChange={(e) => setSlotNote(e.target.value)}
                    placeholder="備註（選填）"
                    className="flex-1 min-w-[120px] rounded-lg px-3 py-2 text-[13px] outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={addSlot}
                    disabled={slotBusy}
                    className="text-[12.5px] font-medium rounded-lg px-4 py-2 transition-opacity active:opacity-70 disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                  >
                    新增時段
                  </button>
                </div>
                {slotError ? (
                  <div className="text-[11.5px] mb-2" style={{ color: "var(--status-warn)" }}>
                    {slotError}
                  </div>
                ) : null}

                {slots.length > 0 ? (
                  <div className="flex flex-col gap-1.5 mb-4">
                    {slots.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12.5px]"
                        style={{ background: "var(--paper-2)" }}
                      >
                        <div style={{ color: "var(--ink)" }}>
                          {s.date} {s.time} ・ 剩餘 {s.remaining}/{s.capacity}
                          {s.note ? <span style={{ color: "var(--ink-soft)" }}> ・ {s.note}</span> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(s.id)}
                          disabled={slotBusy}
                          className="text-[11.5px] underline shrink-0 disabled:opacity-50"
                          style={{ color: "var(--status-warn)" }}
                        >
                          刪除
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] mb-4" style={{ color: "var(--ink-soft)" }}>
                    尚未新增任何時段
                  </p>
                )}

                <h3 className="text-[12.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>
                  預約名單
                </h3>
                {bookings.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {bookings.map((b) => (
                      <div key={b.id} className="rounded-lg px-3 py-2 text-[12.5px]" style={{ background: "var(--paper-2)" }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span style={{ color: "var(--ink)" }}>
                            {b.name} ・ {b.phone} ・ {b.partySize} 位
                          </span>
                          <span
                            className="text-[10.5px] font-medium rounded-full px-2 py-0.5 shrink-0"
                            style={{
                              background:
                                b.status === "confirmed" ? "var(--status-ok)" : b.status === "cancelled" ? "var(--line)" : "var(--festival-gold)",
                              color: b.status === "cancelled" ? "var(--ink-soft)" : "#fff",
                            }}
                          >
                            {BOOKING_STATUS_LABEL[b.status]}
                          </span>
                        </div>
                        <div style={{ color: "var(--ink-soft)" }}>
                          {b.slot ? `${b.slot.date} ${b.slot.time}` : "（時段已刪除）"}
                          {b.note ? ` ・ ${b.note}` : ""}
                        </div>
                        {b.status !== "cancelled" ? (
                          <div className="flex gap-3 mt-1.5">
                            {b.status === "pending" ? (
                              <button
                                type="button"
                                onClick={() => setBookingStatus(b.id, "confirmed")}
                                disabled={bookingBusyId === b.id}
                                className="text-[11.5px] underline disabled:opacity-50"
                                style={{ color: "var(--status-ok)" }}
                              >
                                確認預約
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setBookingStatus(b.id, "cancelled")}
                              disabled={bookingBusyId === b.id}
                              className="text-[11.5px] underline disabled:opacity-50"
                              style={{ color: "var(--status-warn)" }}
                            >
                              取消預約
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                    尚無預約
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
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
        <button
          onClick={remove}
          disabled={deleting}
          className="text-[13px] font-medium underline disabled:opacity-50"
          style={{ color: "var(--status-warn)" }}
        >
          {deleting ? "刪除中…" : "刪除這個項目"}
        </button>
      </div>
    </div>
  );
}
