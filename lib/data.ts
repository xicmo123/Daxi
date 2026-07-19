export type Status = "ok" | "mid" | "full";

// Verified against official sources as of 2026-07-19:
// https://daxidaxi.tycg.gov.tw/ and https://news.ltn.com.tw/news/life/breakingnews/5508842
export const festival = {
  name: "2026 大溪大禧",
  theme: "聲聲不息",
  startDate: "2026-07-18",
  endDate: "2026-08-06",
  sourceUrl: "https://daxidaxi.tycg.gov.tw/",
  facebookUrl: "https://www.facebook.com/DaxiCulFes/",
};

export type Milestone = {
  date: string;
  isoDate?: string; // set only for single-day milestones (opening / procession)
  phase: "past" | "ongoing" | "upcoming";
  time: string;
  title: string;
  desc: string;
  badges?: ("route" | "live")[];
  ctaLabel?: string;
  ctaUrl?: string;
};

export const eventMilestones: Milestone[] = [
  {
    date: "7/18（六）",
    isoDate: "2026-07-18",
    phase: "past",
    time: "13:00–18:00",
    title: "開幕式暨大匯演",
    desc: "大溪天幕籃球場、老城區及普濟堂登場，集結在地社頭、藝陣團隊及北管傳習成果。當日康莊路、復興路、得勝路、中正路、和平路、登龍路及普濟路一帶交通管制，和平老街全段劃設為行人徒步區。",
    badges: ["route"],
  },
  {
    date: "7/19（日）－8/5（三）",
    phase: "ongoing",
    time: "系列活動期間",
    title: "北管、社頭文化、戲劇走讀、音樂展演",
    desc: "以「聲聲不息」為主軸，串聯百年迎六月廿四慶典的系列活動陸續登場，詳細場次時間以大溪大禧官方粉專公告為準。",
    badges: ["live"],
    ctaLabel: "前往官方粉專看最新場次 →",
    ctaUrl: "https://www.facebook.com/DaxiCulFes/",
  },
  {
    date: "8/6（四）",
    isoDate: "2026-08-06",
    phase: "upcoming",
    time: "全日",
    title: "遶境隨香：社頭隨香四部曲",
    desc: "規劃神轎、北管、神將、神龍四條主題路線，民眾可實際跟隨隊伍深入街巷，非僅在路邊觀賞。",
    badges: ["route"],
  },
];

export type Alert = {
  level: "block" | "warn" | "info";
  title: string;
  desc: string;
};

// Only the opening-day control is officially confirmed (see festival.sourceUrl).
// Day-to-day control for the rest of the festival isn't published — that feed
// needs a TDX (運輸資料流通服務) client id/secret to go live.
export const trafficAlerts: Alert[] = [
  {
    level: "info",
    title: "開幕日交通管制（7/18，已解除）",
    desc: "13:00–18:00・康莊路、復興路、得勝路、中正路、和平路、登龍路、普濟路一帶管制，和平老街全段行人徒步區",
  },
];

export type DiscoverTag = "景點" | "文化" | "美食";

// Tone is a function of category, not a per-item choice — keeps the color
// system meaningful (which two accents exist is a design constraint; which
// category gets which one should be consistent everywhere it appears).
export const discoverTagTone: Record<DiscoverTag, "cognac" | "bordeaux"> = {
  景點: "bordeaux",
  文化: "cognac",
  美食: "cognac",
};

export type DiscoverItem = {
  title: string;
  desc: string;
  tag: DiscoverTag;
};

export const discoverItems: DiscoverItem[] = [
  { title: "大溪橋", desc: "紅色鋼橋夜間點燈，眺望大漢溪天際線。", tag: "景點" },
  { title: "武德殿", desc: "日治木構建築，現為藝文展演空間。", tag: "文化" },
  { title: "老街豆干街", desc: "百年豆干老店聚集，現場試吃比風味。", tag: "美食" },
  { title: "大溪老茶廠", desc: "1926 年製茶廠改建，工業風建築。", tag: "景點" },
  { title: "齋明寺", desc: "清代古剎與清水模禪堂並置，寧靜清幽。", tag: "文化" },
  { title: "和平老街小吃", desc: "花生糖、月光饅頭、碗粿，遶境期間延長營業。", tag: "美食" },
];
