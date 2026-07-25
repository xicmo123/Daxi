"use client";

import { useSyncExternalStore } from "react";

// Lightweight zh/en toggle for app chrome (nav, identity gate, home hero).
// Deliberately not a full i18n system — business/coupon/announcement
// content stays Chinese-only since it's editor-entered data, not UI copy.
export type Lang = "zh" | "en";
const STORAGE_KEY = "daxi-lang";
const CHANGE_EVENT = "daxi-lang-changed";

function readLang(): Lang {
  if (typeof window === "undefined") return "zh";
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "zh";
}

function serverLang(): Lang {
  return "zh";
}

export function setLang(lang: Lang) {
  window.localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, readLang, serverLang);
}

const dict = {
  navHome: { zh: "首頁", en: "Home" },
  navEvents: { zh: "活動", en: "Events" },
  navSpots: { zh: "景點", en: "Spots" },
  navBusinesses: { zh: "商家", en: "Shops" },
  navParking: { zh: "停車", en: "Parking" },
  navAbout: { zh: "關於", en: "About" },
  navAnnouncements: { zh: "公告", en: "Notices" },
  navServices: { zh: "服務", en: "Services" },
  navOutages: { zh: "停水停電", en: "Outages" },
  navProfile: { zh: "我的", en: "Profile" },
  searchPlaceholder: { zh: "搜尋景點、店家、活動", en: "Search spots, shops, events" },
  imTourist: { zh: "我是遊客", en: "Visitor" },
  imResident: { zh: "我是大溪人", en: "Local" },
  welcomeTo: { zh: "歡迎來到", en: "Welcome to" },
  gateSubtitle: { zh: "先告訴我們你是誰，內容會不一樣", en: "Tell us who you are — the content changes" },
  touristCardDesc: { zh: "景點推薦、美食優惠、地圖導覽", en: "Spot picks, food deals, map guide" },
  residentCardDesc: { zh: "里民服務、區公所公告、停水停電通知", en: "Resident services, official notices, outage alerts" },
  gateSwitchHint: { zh: "之後可以隨時在「我的」切換身份", en: "You can switch anytime later in Profile" },
  languageLabel: { zh: "語言", en: "Language" },
} as const;

export type DictKey = keyof typeof dict;

export function useT() {
  const lang = useLang();
  return (key: DictKey) => dict[key][lang];
}
