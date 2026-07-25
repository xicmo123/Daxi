"use client";

import { useLang, setLang, useT } from "@/lib/i18n";

export default function LanguageToggle() {
  const lang = useLang();
  const t = useT();

  return (
    <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
      <div className="text-[13px] font-bold mb-3" style={{ color: "var(--ink)" }}>
        {t("languageLabel")}
      </div>
      <div className="inline-flex p-1 rounded-full" style={{ background: "var(--paper-2)" }}>
        {(["zh", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            className="px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-colors"
            style={
              lang === option
                ? { background: "var(--river-teal)", color: "#fff" }
                : { background: "transparent", color: "var(--ink-soft)" }
            }
          >
            {option === "zh" ? "中文" : "English"}
          </button>
        ))}
      </div>
      <p className="text-[11px] leading-relaxed mt-3" style={{ color: "var(--ink-soft)" }}>
        {lang === "zh"
          ? "目前僅切換選單與介面文字，商家、公告等內容仍為中文。"
          : "Only menus and interface labels switch for now — business listings and notices stay in Chinese."}
      </p>
    </div>
  );
}
