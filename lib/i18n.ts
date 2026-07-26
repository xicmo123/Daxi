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

  langChooseTitle: { zh: "選擇語言", en: "Choose a language" },
  langChooseSubtitle: { zh: "之後可以在「我的」再次切換", en: "You can switch anytime later in Profile" },

  busTitle: { zh: "公車資訊", en: "Bus Info" },
  busSubtitle: { zh: "大溪老街方圓 5 公里內的即時公車位置", en: "Live bus positions within 5km of Daxi Old Street" },
  searchTitle: { zh: "搜尋", en: "Search" },
  businessesSubtitleTemplate: { zh: "美食・市集・{updated} 更新", en: "Food & Market · Updated {updated}" },
  profileSubtitleTourist: { zh: "收藏的景點與店家", en: "Your saved spots & shops" },
  announcementsTitle: { zh: "區公所公告", en: "District Office Notices" },
  announcementsSubtitle: { zh: "同步大溪區公所最新消息", en: "Synced with the latest Daxi District Office notices" },
  weatherTitle: { zh: "即時狀態", en: "Live Status" },
  weatherSubtitle: { zh: "大溪區・即時影像與交通管制", en: "Daxi District · Live cameras & traffic control" },
  couponsTitle: { zh: "優惠券", en: "Deals" },
  couponsSubtitle: { zh: "到店出示核銷碼，店員掃碼即可使用", en: "Show the redeem code in-store for the clerk to scan" },
  spotsSubtitle: { zh: "老街周邊景點與順路走走", en: "Spots around the Old Street worth a stop" },
  eventsSubtitle: { zh: "大溪大禧與老街周邊活動", en: "Daxi Grand Festival & Old Street events" },
  residentEventsTitle: { zh: "在地活動", en: "Local Events" },
  parkingTitle: { zh: "周邊停車", en: "Nearby Parking" },
  parkingSubtitleOk: { zh: "距大溪老街由近到遠・每分鐘更新", en: "Sorted by distance from Old Street · updated every minute" },
  parkingSubtitleFailed: { zh: "即時資料暫時整理中", en: "Live data is temporarily unavailable" },
  findingParkingLabel: { zh: "正在幫你找車位…", en: "Finding you a parking spot…" },
  residentParadeTitle: { zh: "大溪大拜拜", en: "Daxi Grand Parade" },
  residentParadeSubtitle: { zh: "繞境交通管制與陣頭動態", en: "Procession traffic control & troupe updates" },
  residentRoadworksTitle: { zh: "道路施工", en: "Roadworks" },
  residentRoadworksSubtitle: { zh: "目前道路申挖與施工位置", en: "Current road excavation & construction sites" },
  residentOutagesTitle: { zh: "民生示警看板", en: "Utility Alerts" },
  residentOutagesSubtitle: { zh: "影響大溪區的停水、降壓、停電預告", en: "Water/power outage notices affecting Daxi" },
  residentServicesTitle: { zh: "里民服務", en: "Resident Services" },
  residentServicesSubtitle: { zh: "生活大小事，這裡先找", en: "Everyday matters, start here" },
  serviceReportTitle: { zh: "陳情 / 報修", en: "Report an Issue" },
  serviceEmergencyTitle: { zh: "緊急聯絡", en: "Emergency Contacts" },
  serviceGarbageTitle: { zh: "垃圾清運", en: "Garbage Collection" },
  serviceLinksTitle: { zh: "常用連結", en: "Useful Links" },

  currentIdentityLabel: { zh: "目前身份", en: "Current" },
  touristLabel: { zh: "遊客", en: "Visitor" },
  residentLabel: { zh: "大溪人", en: "Local" },
  switchToTouristLabel: { zh: "切換為遊客模式", en: "Switch to Visitor mode" },
  switchToResidentLabel: { zh: "切換為大溪人模式", en: "Switch to Resident mode" },
  switchingLabel: { zh: "切換中…", en: "Switching…" },
} as const;

export type DictKey = keyof typeof dict;

export function useT() {
  const lang = useLang();
  return (key: DictKey, vars?: Record<string, string>) => {
    const text = dict[key][lang];
    if (!vars) return text;
    return Object.entries(vars).reduce((acc, [name, value]) => acc.replaceAll(`{${name}}`, value), text as string);
  };
}
