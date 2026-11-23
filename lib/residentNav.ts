// One map of everything 「我是大溪人」 offers, grouped the way a resident thinks
// about it. The header's full menu, the home 生活指南 tabs, the finder and the
// footer all read from here, so a new feature is added in exactly one place.

export type ResidentIconKey =
  | "outage"
  | "garbage"
  | "roadworks"
  | "announcement"
  | "bus"
  | "camera"
  | "clinic"
  | "aed"
  | "phone"
  | "bulletin"
  | "event"
  | "report"
  | "link"
  | "profile";

export type ResidentNavItem = {
  key: string;
  label: string;
  desc: string;
  href: string;
  icon: ResidentIconKey;
  /** Extra words the finder should match on. */
  keywords: string[];
  /** Opens an in-page sheet on /resident instead of a separate route. */
  sheet?: "garbage";
};

export type ResidentNavGroup = {
  key: string;
  label: string;
  intro: string;
  photo: { src: string; author: string; sourceUrl: string };
  items: ResidentNavItem[];
};

export const GARBAGE_SHEET_HREF = "/resident?open=garbage";

export const RESIDENT_NAV: ResidentNavGroup[] = [
  {
    key: "alerts",
    label: "民生示警",
    intro: "停水、停電、施工與清運，出門前先確認。",
    photo: {
      src: "/images/daxi-bridge.jpg",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg",
    },
    items: [
      {
        key: "outages",
        label: "停水停電",
        desc: "台水、台電預告的大溪區停水、降壓與停電",
        href: "/resident/outages",
        icon: "outage",
        keywords: ["停水", "停電", "降壓", "水壓", "台水", "台電", "斷水"],
      },
      {
        key: "garbage",
        label: "垃圾清運",
        desc: "附近垃圾車、資源回收車即時位置",
        href: GARBAGE_SHEET_HREF,
        icon: "garbage",
        keywords: ["垃圾", "垃圾車", "回收", "資源回收", "清運", "清潔隊"],
        sheet: "garbage",
      },
      {
        key: "roadworks",
        label: "道路施工",
        desc: "目前道路申挖與施工位置地圖",
        href: "/resident/roadworks",
        icon: "roadworks",
        keywords: ["施工", "挖路", "申挖", "封路", "管制", "道路"],
      },
      {
        key: "announcements",
        label: "區公所公告",
        desc: "同步大溪區公所的最新消息",
        href: "/resident/announcements",
        icon: "announcement",
        keywords: ["公告", "區公所", "新聞", "消息", "補助"],
      },
    ],
  },
  {
    key: "transport",
    label: "交通出行",
    intro: "客運在哪、路上塞不塞，看一眼再出門。",
    photo: {
      src: "/images/tea-factory.jpg",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Tea_Factory_i.jpg",
    },
    items: [
      {
        key: "bus",
        label: "客運動態",
        desc: "以目前位置為中心的即時公車位置",
        href: "/resident/bus",
        icon: "bus",
        keywords: ["公車", "客運", "巴士", "站牌", "到站", "桃園客運"],
      },
      {
        key: "live",
        label: "即時影像",
        desc: "大溪道路 CCTV 與景點畫面",
        href: "/resident/live",
        icon: "camera",
        keywords: ["影像", "cctv", "監視器", "路況", "塞車", "直播"],
      },
      {
        key: "roadworks-map",
        label: "施工地圖",
        desc: "繞路前先看哪裡在施工",
        href: "/resident/roadworks",
        icon: "roadworks",
        keywords: ["繞路", "地圖"],
      },
    ],
  },
  {
    key: "safety",
    label: "醫療安全",
    intro: "哪間診所現在有開、最近的 AED 在哪。",
    photo: {
      src: "/images/zhaiming-temple.jpg",
      author: "阿道",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Chan_Hall_of_Zhai_Ming_Monastery_01_20250618.jpg",
    },
    items: [
      {
        key: "clinics",
        label: "醫療輪值",
        desc: "大溪區診所、藥局，現在有開的先看",
        href: "/resident/clinics",
        icon: "clinic",
        keywords: ["診所", "藥局", "醫院", "看病", "輪值", "假日", "急診"],
      },
      {
        key: "aed",
        label: "尋找 AED",
        desc: "離你最近的自動體外心臟電擊去顫器",
        href: "/resident/aed",
        icon: "aed",
        keywords: ["aed", "電擊", "心臟", "急救", "cpr"],
      },
      {
        key: "emergency",
        label: "緊急聯絡",
        desc: "110、119、113、165、1999 一鍵撥打",
        href: "/resident/services#emergency",
        icon: "phone",
        keywords: ["報警", "警察", "消防", "救護車", "110", "119", "165", "詐騙", "電話"],
      },
    ],
  },
  {
    key: "community",
    label: "社區生活",
    intro: "里內公告、在地活動與陳情管道都在這。",
    photo: {
      src: "/images/wude-hall.jpg",
      author: "寺人孟子",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪武德殿.jpg",
    },
    items: [
      {
        key: "bulletin",
        label: "社區佈告欄",
        desc: "里長發布的里內消息",
        href: "/resident#bulletin",
        icon: "bulletin",
        keywords: ["里長", "里", "佈告欄", "社區", "疫苗", "噴藥"],
      },
      {
        key: "events",
        label: "在地活動",
        desc: "大溪大禧與老街周邊活動",
        href: "/resident/events",
        icon: "event",
        keywords: ["活動", "大禧", "遶境", "關公", "節慶", "表演"],
      },
      {
        key: "report",
        label: "陳情 / 報修",
        desc: "路燈壞了、道路坑洞怎麼通報",
        href: "/resident/services#report",
        icon: "report",
        keywords: ["陳情", "報修", "路燈", "坑洞", "1999", "檢舉", "路樹"],
      },
      {
        key: "links",
        label: "常用連結",
        desc: "戶政、地政、稅務與區公所入口",
        href: "/resident/services#links",
        icon: "link",
        keywords: ["戶政", "地政", "稅務", "連結", "網站", "申請"],
      },
    ],
  },
];

export const RESIDENT_PROFILE_ITEM: ResidentNavItem = {
  key: "profile",
  label: "我的設定",
  desc: "里別、通知與居民卡",
  href: "/resident/profile",
  icon: "profile",
  keywords: ["設定", "通知", "推播", "我的", "里別", "居民卡"],
};

/** Every distinct destination, first occurrence wins (施工 appears twice). */
export function allResidentItems(): ResidentNavItem[] {
  const seen = new Set<string>();
  const out: ResidentNavItem[] = [];
  for (const item of [...RESIDENT_NAV.flatMap((g) => g.items), RESIDENT_PROFILE_ITEM]) {
    if (seen.has(item.href)) continue;
    seen.add(item.href);
    out.push(item);
  }
  return out;
}

export function findResidentItems(query: string): ResidentNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allResidentItems().filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase())),
  );
}

/** Hashtag chips under the finder — the things residents look up most. */
export const RESIDENT_HASHTAGS: Array<{ label: string; href: string }> = [
  { label: "停水停電", href: "/resident/outages" },
  { label: "垃圾車", href: GARBAGE_SHEET_HREF },
  { label: "道路施工", href: "/resident/roadworks" },
  { label: "診所輪值", href: "/resident/clinics" },
  { label: "AED", href: "/resident/aed" },
  { label: "1999陳情", href: "/resident/services#report" },
];

/** Breadcrumb trail for a resident sub-page, from the nav map. */
export function residentTrail(href: string): { group?: ResidentNavGroup; item?: ResidentNavItem } {
  for (const group of RESIDENT_NAV) {
    const item = group.items.find((i) => i.href === href);
    if (item) return { group, item };
  }
  if (href === RESIDENT_PROFILE_ITEM.href) return { item: RESIDENT_PROFILE_ITEM };
  return {};
}
