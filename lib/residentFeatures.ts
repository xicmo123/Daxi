export type ResidentFeatureKey =
  | "announcements"
  | "services"
  | "report"
  | "emergency"
  | "garbage"
  | "roadworks"
  | "outages"
  | "links"
  | "profile";

export type ResidentFeatureTag = "一般" | "緊急" | "活動";

export type ResidentFeature = {
  key: ResidentFeatureKey;
  tag: ResidentFeatureTag;
  title: string;
  subtitle: string;
  href: string;
};

export const RESIDENT_FEATURES: ResidentFeature[] = [
  {
    key: "announcements",
    tag: "一般",
    title: "區公所公告",
    subtitle: "最新公告與里民資訊",
    href: "/resident/announcements",
  },
  {
    key: "services",
    tag: "一般",
    title: "里民服務",
    subtitle: "生活大小事，這裡先找",
    href: "/resident/services",
  },
  {
    key: "report",
    tag: "一般",
    title: "陳情／報修",
    subtitle: "路燈、道路、環境問題通報",
    href: "/resident/services#report",
  },
  {
    key: "emergency",
    tag: "緊急",
    title: "緊急聯絡",
    subtitle: "警消、衛生所、市民專線",
    href: "/resident/services#emergency",
  },
  {
    key: "garbage",
    tag: "一般",
    title: "垃圾車即時地圖",
    subtitle: "查看目前清運車位置",
    href: "/resident/services#garbage",
  },
  {
    key: "roadworks",
    tag: "一般",
    title: "道路施工地圖",
    subtitle: "查看今日道路申挖與施工位置",
    href: "/resident/roadworks",
  },
  {
    key: "outages",
    tag: "緊急",
    title: "停水停電通知",
    subtitle: "預告中的停水停電整理",
    href: "/resident/outages",
  },
  {
    key: "links",
    tag: "一般",
    title: "常用連結",
    subtitle: "戶政、地政、稅務與區公所入口",
    href: "/resident/services#links",
  },
  {
    key: "profile",
    tag: "一般",
    title: "我的模式",
    subtitle: "切換遊客／大溪人模式",
    href: "/resident/profile",
  },
];

export function getResidentFeature(key: string | undefined): ResidentFeature | null {
  return RESIDENT_FEATURES.find((feature) => feature.key === key) ?? null;
}
