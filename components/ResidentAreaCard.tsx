"use client";

import { useState, useSyncExternalStore } from "react";
import { readResidentArea, writeResidentArea, subscribeResidentArea } from "@/lib/residentArea";

function emptyArea() {
  return "";
}

export default function ResidentAreaCard() {
  const saved = useSyncExternalStore(subscribeResidentArea, readResidentArea, emptyArea);
  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);

  return (
    <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-[13px] font-bold mb-1" style={{ color: "var(--ink)" }}>
        我住的地方
      </div>
      <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: "var(--ink-soft)" }}>
        輸入街名或聚落（例如「仁美街」），停水停電通知會把跟你有關的排在最前面。
      </p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setJustSaved(false);
          }}
          placeholder="例如：仁美街"
          className="min-w-0 flex-1 rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
          style={{ background: "var(--paper-2)", color: "var(--ink)" }}
        />
        <button
          type="button"
          onClick={() => {
            writeResidentArea(draft);
            setJustSaved(true);
          }}
          className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: "var(--river-teal)", color: "#fff" }}
        >
          {justSaved && draft === saved ? "已儲存" : "儲存"}
        </button>
      </div>
    </div>
  );
}
