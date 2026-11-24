// Feature map for the tourist half (大溪通). Same shape as lib/residentNav.ts
// so the shared skin components (header menu, finder, page-header trail,
// footer) drive both halves the same way.
import { daxiWalkHref, oldStreetPhoto } from "./daxiWalk";
import { allNavItems, findNavItems, navTrail, type SiteNavGroup, type SiteNavItem } from "./siteNav";
import { ABOUT_HREF } from "./aboutOwner";

export const TOURIST_NAV: SiteNavGroup[] = [
  {
    key: "explore",
    label: "探索大溪",
    intro: "老街的山牆、木藝與廟宇，用走的最好看。",
    photo: {
      src: "/images/wude-hall.jpg",
      author: "寺人孟子",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪武德殿.jpg",
    },
    items: [
      {
        key: "spots",
        label: "大溪景點",
        desc: "大溪橋、普濟堂、武德殿與步道",
        href: "/spots",
        icon: "spot",
        keywords: ["景點", "大溪橋", "武德殿", "普濟堂", "公園", "步道", "水庫", "老茶廠", "齋明寺"],
      },
      {
        key: "walk",
        label: "老街散步",
        desc: "4 站步行導覽，約 1.2 公里",
        href: daxiWalkHref,
        icon: "walk",
        keywords: ["老街", "和平路", "散步", "導覽", "路線", "步行"],
      },
      {
        key: "businesses",
        label: "美食與店家",
        desc: "豆干、小吃、伴手禮與市集",
        href: "/businesses",
        icon: "food",
        keywords: ["美食", "豆干", "小吃", "伴手禮", "餐廳", "咖啡", "店家", "市場"],
      },
      {
        key: "search",
        label: "搜尋",
        desc: "用名稱找景點和店家",
        href: "/search",
        icon: "search",
        keywords: ["找", "搜尋"],
      },
    ],
  },
  {
    key: "happenings",
    label: "活動優惠",
    intro: "大溪大禧、市集展覽，還有店家優惠。",
    photo: {
      src: "/images/guanyu-birthday-celebration.jpg",
      author: "fppp053",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪普濟堂關聖帝君聖誕慶典.jpg",
    },
    items: [
      {
        key: "events",
        label: "大溪活動",
        desc: "展覽、市集與地方慶典",
        href: "/events",
        icon: "event",
        keywords: ["活動", "大禧", "遶境", "關公", "節慶", "市集", "展覽", "表演"],
      },
      {
        key: "coupons",
        label: "優惠券",
        desc: "到店出示核銷碼就能用",
        href: "/coupons",
        icon: "coupon",
        keywords: ["優惠", "折扣", "優惠券", "coupon"],
      },
      {
        key: "announcements",
        label: "區公所公告",
        desc: "大溪區公所最新消息",
        href: "/announcements",
        icon: "announcement",
        keywords: ["公告", "區公所", "消息"],
      },
    ],
  },
  {
    key: "getting-here",
    label: "交通停車",
    intro: "開車停哪、公車到哪，出發前看天氣路況。",
    photo: {
      src: "/images/daxi-bridge.jpg",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg",
    },
    items: [
      {
        key: "parking",
        label: "周邊停車",
        desc: "停車場位置與即時空位",
        href: "/parking",
        icon: "parking",
        keywords: ["停車", "停車場", "車位", "開車"],
      },
      {
        key: "bus",
        label: "大溪公車",
        desc: "路線、站牌與即時車輛位置",
        href: "/bus",
        icon: "bus",
        keywords: ["公車", "客運", "巴士", "站牌", "到站"],
      },
      {
        key: "weather",
        label: "天氣與即時影像",
        desc: "逐時預報、道路 CCTV 與景點直播",
        href: "/weather",
        icon: "weather",
        keywords: ["天氣", "下雨", "氣溫", "路況", "cctv", "影像", "直播"],
      },
    ],
  },
  {
    key: "about",
    label: "關於大溪通",
    intro: "一個大溪孩子做給大溪的平台。",
    photo: { src: oldStreetPhoto.src, author: oldStreetPhoto.author, sourceUrl: oldStreetPhoto.sourceUrl },
    items: [
      {
        key: "about",
        label: "關於",
        desc: "網站的由來與聯絡方式",
        href: ABOUT_HREF,
        icon: "info",
        keywords: ["關於", "聯絡", "信箱", "建議"],
      },
      {
        key: "profile",
        label: "我的收藏",
        desc: "收藏的景點與店家",
        href: "/profile",
        icon: "heart",
        keywords: ["收藏", "我的", "最愛"],
      },
      {
        key: "privacy",
        label: "隱私權政策",
        desc: "資料收集與使用說明",
        href: "/privacy",
        icon: "doc",
        keywords: ["隱私"],
      },
      {
        key: "terms",
        label: "服務條款",
        desc: "使用條款與責任說明",
        href: "/terms",
        icon: "doc",
        keywords: ["條款"],
      },
    ],
  },
];

/** The groups worth a home-page tab (關於 is for the menu and footer). */
export const TOURIST_GUIDE_GROUPS = TOURIST_NAV.slice(0, 3);

export function allTouristItems(): SiteNavItem[] {
  return allNavItems(TOURIST_NAV);
}

export function findTouristItems(query: string): SiteNavItem[] {
  return findNavItems(allTouristItems(), query);
}

export function touristTrail(href: string) {
  return navTrail(TOURIST_NAV, href);
}

export const TOURIST_HASHTAGS: Array<{ label: string; href: string }> = [
  { label: "大溪老街", href: daxiWalkHref },
  { label: "豆干", href: "/search?q=豆干" },
  { label: "大溪橋", href: "/search?q=大溪橋" },
  { label: "停車", href: "/parking" },
  { label: "大溪大禧", href: "/events" },
  { label: "優惠券", href: "/coupons" },
];
