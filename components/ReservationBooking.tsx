"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ReservationDetail } from "@/lib/placeDetails";
import type { SlotWithAvailability } from "@/lib/reservations";

function InquiryCta({ reservation }: { reservation: ReservationDetail }) {
  const href =
    reservation.contactType === "phone" ? `tel:${reservation.contactValue}` : (reservation.contactValue as string);
  return (
    <a
      href={href}
      target={reservation.contactType === "phone" ? undefined : "_blank"}
      rel={reservation.contactType === "phone" ? undefined : "noopener noreferrer"}
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-4 transition-opacity active:opacity-80"
      style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
    >
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold">
          {reservation.contactType === "phone" ? "電話預約詢問" : "線上預約詢問"}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.88)" }}>
          非即時保留座位，請等店家回覆確認
        </div>
        {reservation.note ? (
          <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.88)" }}>
            {reservation.note}
          </div>
        ) : null}
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  );
}

const dateFormatter = new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", weekday: "short" });

function SlotBooking({ placeId, reservation }: { placeId: string; reservation: ReservationDetail }) {
  const [slots, setSlots] = useState<SlotWithAvailability[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/reservations/slots?placeId=${encodeURIComponent(placeId)}`)
      .then((res) => res.json())
      .then((data) => setSlots(Array.isArray(data.slots) ? data.slots : []))
      .catch(() => setSlots([]));
  }, [placeId]);

  const submit = async () => {
    if (!selectedSlotId) {
      setError("請先選擇時段");
      return;
    }
    const size = Number(partySize);
    if (!name.trim() || !phone.trim() || !Number.isInteger(size) || size < 1) {
      setError("請填寫姓名、電話與人數");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          slotId: selectedSlotId,
          name: name.trim(),
          phone: phone.trim(),
          partySize: size,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "預約失敗，請稍後再試");
        return;
      }
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl px-4 py-3.5 mb-4 text-[13px]" style={{ background: "var(--paper-2)", color: "var(--ink)" }}>
        已送出預約申請，請等候店家電話確認
      </div>
    );
  }

  const upcoming = slots?.filter((s) => s.remaining > 0) ?? [];

  return (
    <div className="rounded-xl px-4 py-4 mb-4" style={{ background: "var(--paper-2)" }}>
      <div className="text-[13.5px] font-semibold mb-0.5" style={{ color: "var(--ink)" }}>
        送出預約申請
      </div>
      {reservation.note ? (
        <>
          <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
            {reservation.note}
          </div>
          <div className="text-[11px] mb-3" style={{ color: "var(--ink-soft)" }}>
            送出後需等店家電話確認，尚未代表座位已保留
          </div>
        </>
      ) : (
        <div className="text-[11px] mb-3" style={{ color: "var(--ink-soft)" }}>
          送出後需等店家電話確認，尚未代表座位已保留
        </div>
      )}

      {slots === null ? (
        <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
          載入時段中…
        </div>
      ) : upcoming.length === 0 ? (
        <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>
          目前尚無可預約時段{reservation.contactValue ? "，可透過下方聯絡方式詢問" : ""}
        </div>
      ) : (
        <>
          <div className="grid gap-2 mb-3">
            {upcoming.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSlotId(s.id)}
                className="overflow-hidden rounded-xl text-left transition-opacity active:opacity-80"
                style={
                  selectedSlotId === s.id
                    ? { background: "var(--card)", color: "var(--ink)", border: "1.5px solid var(--accent)" }
                    : { background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }
                }
              >
                <div className="flex gap-3 p-2.5">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg" style={{ background: "var(--paper-2)" }}>
                    {s.imageSrc ? (
                      <Image src={s.imageSrc} alt={s.title ?? "課程縮圖"} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10.5px]" style={{ color: "var(--ink-soft)" }}>
                        課程
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="text-[13px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
                      {s.title ?? "可預約時段"}
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: "var(--ink-soft)" }}>
                      {dateFormatter.format(new Date(`${s.date}T00:00:00`))} {s.time} ・ 剩 {s.remaining}
                    </div>
                    {s.note ? (
                      <div className="mt-1 line-clamp-2 text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                        {s.note}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedSlotId ? (
            <div className="flex flex-col gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="姓名"
                className="rounded-lg px-3 py-2 text-[13px] outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }}
              />
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="聯絡電話"
                  className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }}
                />
                <input
                  type="number"
                  min={1}
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  placeholder="人數"
                  className="w-16 rounded-lg px-3 py-2 text-[13px] outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }}
                />
              </div>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="備註（選填）"
                className="rounded-lg px-3 py-2 text-[13px] outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }}
              />
              {error ? (
                <div className="text-[11.5px]" style={{ color: "var(--status-warn)" }}>
                  {error}
                </div>
              ) : null}
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="text-[13px] font-semibold rounded-lg px-4 py-2.5 transition-opacity active:opacity-80 disabled:opacity-50"
                style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
              >
                {submitting ? "送出中…" : "送出預約申請"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function ReservationBooking({ placeId, reservation }: { placeId: string; reservation: ReservationDetail }) {
  if (reservation.mode === "slots") return <SlotBooking placeId={placeId} reservation={reservation} />;
  return <InquiryCta reservation={reservation} />;
}
