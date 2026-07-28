"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MerchantAccountRecord } from "@/lib/merchantAccounts";

const inputStyle = { background: "#f4eee4", border: "1px solid #dfd1bf", color: "#2f261f" } as const;

function randomPasscode(): string {
  return Math.random().toString(36).slice(2, 8) + "2026";
}

export default function MerchantAccountForm({
  account,
  availablePlaces,
}: {
  account?: MerchantAccountRecord;
  availablePlaces?: Array<{ placeId: string; name: string }>;
}) {
  const router = useRouter();
  const isEdit = Boolean(account);

  const [placeId, setPlaceId] = useState(account?.placeId ?? availablePlaces?.[0]?.placeId ?? "");
  const [businessName, setBusinessName] = useState(
    account?.businessName ?? availablePlaces?.find((p) => p.placeId === placeId)?.name ?? "",
  );
  // Stored passcode is a one-way hash once set, so on edit we can't show or
  // reuse the existing value — leave it blank and only send a new passcode
  // to the API if the admin actually typed/generated one.
  const [passcode, setPasscode] = useState(isEdit ? "" : randomPasscode());

  const [disabled, setDisabled] = useState(Boolean(account?.disabled));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/merchants/${encodeURIComponent(account!.placeId)}` : "/api/admin/merchants",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId, businessName, passcode: passcode.trim() || undefined }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "儲存失敗");
        return;
      }
      if (isEdit) {
        setMessage("已儲存");
        router.refresh();
      } else {
        router.push("/admin/merchants");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!account) return;
    if (!confirm(`確定要刪除「${account.businessName}」的商家帳號嗎？`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/merchants/${encodeURIComponent(account.placeId)}`, { method: "DELETE" });
      router.push("/admin/merchants");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const toggleDisabled = async () => {
    if (!account) return;
    const next = !disabled;
    setTogglingStatus(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/merchants/${encodeURIComponent(account.placeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "操作失敗");
        return;
      }
      setDisabled(next);
      setMessage(next ? "已停用此商家帳號" : "已重新啟用此商家帳號");
      router.refresh();
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold" style={{ color: "#2f261f" }}>
            {isEdit ? "編輯商家帳號" : "開通新商家"}
          </h1>
          {isEdit && disabled ? (
            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "#f3d6d6", color: "#9c3b3b" }}>
              已停用
            </span>
          ) : null}
        </div>
        {isEdit ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDisabled}
              disabled={togglingStatus}
              className="text-[12.5px] font-medium underline disabled:opacity-50"
              style={{ color: disabled ? "#4a7594" : "#b0503f" }}
            >
              {togglingStatus ? "處理中…" : disabled ? "重新啟用" : "停用"}
            </button>
            <button type="button" onClick={remove} disabled={deleting} className="text-[12.5px] font-medium underline disabled:opacity-50" style={{ color: "#b0503f" }}>
              刪除
            </button>
          </div>
        ) : null}
      </div>

      {isEdit ? null : (
        <>
          <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
            選擇地點
          </label>
          <select
            value={placeId}
            onChange={(e) => {
              setPlaceId(e.target.value);
              const match = availablePlaces?.find((p) => p.placeId === e.target.value);
              if (match) setBusinessName(match.name);
            }}
            required
            className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]"
            style={inputStyle}
          >
            {availablePlaces?.length ? (
              availablePlaces.map((p) => (
                <option key={p.placeId} value={p.placeId}>
                  {p.name}
                </option>
              ))
            ) : (
              <option value="">（沒有可開通的地點，所有商家皆已開通）</option>
            )}
          </select>
        </>
      )}

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        顯示名稱
      </label>
      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required maxLength={60} className="w-full rounded-lg px-3 py-2.5 mb-4 text-[13px]" style={inputStyle} />

      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: "#766a5d" }}>
        通關密語{isEdit ? "（留空表示不變更）" : ""}
      </label>
      <div className="flex gap-2 mb-1">
        <input
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required={!isEdit}
          minLength={6}
          placeholder={isEdit ? "留空＝沿用現有密語" : undefined}
          className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-[13px]"
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => setPasscode(randomPasscode())}
          className="shrink-0 rounded-lg px-3 py-2.5 text-[12.5px] font-semibold"
          style={{ background: "#f4eee4", color: "#2f261f", border: "1px solid #dfd1bf" }}
        >
          {isEdit ? "重設新密語" : "隨機產生"}
        </button>
      </div>
      {isEdit ? (
        <p className="text-[11.5px] mb-4" style={{ color: "#766a5d" }}>
          密語已加密儲存，系統無法顯示原本的通關密語。要更換時請按「重設新密語」再存檔，並告知商家新密語。
        </p>
      ) : (
        <div className="mb-4" />
      )}

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
        disabled={saving || (!isEdit && !placeId)}
        className="rounded-full px-5 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70 disabled:opacity-50"
        style={{ background: "#a06a3a", color: "#fff", opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
