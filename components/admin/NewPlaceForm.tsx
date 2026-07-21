"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessTag } from "@/lib/businesses";

const TAGS: BusinessTag[] = ["美食", "景點", "市集"];

const inputStyle = {
  background: "var(--paper-2)",
  border: "1px solid var(--line)",
  color: "var(--ink)",
} as const;

export default function NewPlaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tag, setTag] = useState<BusinessTag>("美食");
  const [lat, setLat] = useState("24.884952");
  const [lng, setLng] = useState("121.288238");
  const [category, setCategory] = useState("");
  const [story, setStory] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          tag,
          lat: Number(lat),
          lng: Number(lng),
          category,
          story,
          tags: tagsText
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "新增失敗");
        return;
      }
      router.push(`/admin/${data.placeId}`);
      router.refresh();
    } finally {
      setSaving(false);
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
        新增自訂項目
      </h1>
      <p className="text-[12px] mb-6" style={{ color: "var(--ink-soft)" }}>
        用於新增不在 Google Places 資料範圍內的商家或景點。座標可從 Google 地圖上點擊該地點複製經緯度。
      </p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
            店名 *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
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
            className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              分類 Tag *
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as BusinessTag)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
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
              緯度 lat *
            </label>
            <input
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex-1">
            <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
              經度 lng *
            </label>
            <input
              required
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label className="text-[11.5px] block mb-1" style={{ color: "var(--ink-soft)" }}>
            分類標籤（例如：豆干老店）
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
            故事引言
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
            標籤（用逗號分隔）
          </label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-[13.5px] outline-none"
            style={inputStyle}
          />
        </div>

        {error ? (
          <div className="text-[12.5px]" style={{ color: "var(--status-warn)" }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="self-start text-[13.5px] font-medium rounded-lg px-5 py-2.5 transition-opacity active:opacity-80 disabled:opacity-50"
          style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
        >
          {saving ? "建立中…" : "建立，接著上傳照片"}
        </button>
      </form>
    </div>
  );
}
