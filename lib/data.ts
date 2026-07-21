export type Status = "ok" | "mid" | "full";

export type PhotoCredit = {
  src: string;
  author?: string;
  sourceUrl?: string; // omitted for admin-uploaded photos with no external source
  historical?: boolean; // photo predates the 2026 event, shown as illustrative only
};

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

// Carousel content (the home page's event milestones) moved to
// lib/carousel.ts + data/carousel-slides.json — admin-editable now instead
// of hardcoded here.

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

export type LiveCam = {
  title: string;
  location: string;
  youtubeId: string;
};

export const liveCams: LiveCam[] = [
  { title: "石門水庫", location: "大溪區・石門水庫壩區", youtubeId: "GUCaVR88ZFU" },
  { title: "大溪老街", location: "大溪區・和平路老街", youtubeId: "XUWjAsajKXg" },
  { title: "後慈湖", location: "大溪區・後慈湖", youtubeId: "AF550Wx7Ba0" },
  { title: "阿姆坪薑母島", location: "大溪區・阿姆坪", youtubeId: "EUOp2LchPQM" },
];

export type DiscoverTag = "景點" | "文化" | "美食";

export type DiscoverItem = {
  title: string;
  desc: string;
  tag: DiscoverTag;
  photo: PhotoCredit;
};

export const discoverItems: DiscoverItem[] = [
  {
    title: "大溪橋",
    desc: "紅色鋼橋夜間點燈，眺望大漢溪天際線。",
    tag: "景點",
    photo: {
      src: "/images/daxi-bridge.jpg",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg",
    },
  },
  {
    title: "武德殿",
    desc: "日治木構建築，現為藝文展演空間。",
    tag: "文化",
    photo: {
      src: "/images/wude-hall.jpg",
      author: "寺人孟子",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪武德殿.jpg",
    },
  },
  {
    title: "老街豆干街",
    desc: "百年豆干老店聚集，現場試吃比風味。",
    tag: "美食",
    photo: {
      src: "/images/doufu-street.jpg",
      author: "bryan...（Flickr）",
      sourceUrl:
        "https://commons.wikimedia.org/wiki/File:Food_%E7%8F%BE%E6%BB%B7%E8%B1%86%E5%B9%B2,_%E9%BB%83%E6%97%A5%E9%A6%99%E8%B1%86%E5%B9%B2,_%E5%A4%A7%E6%BA%AA,_%E6%A1%83%E5%9C%92,_%E5%8F%B0%E7%81%A3,_Daxi,_Taoyuan,_Taiwan_(47202231432).jpg",
    },
  },
  {
    title: "大溪老茶廠",
    desc: "1926 年製茶廠改建，工業風建築。",
    tag: "景點",
    photo: {
      src: "/images/tea-factory.jpg",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Tea_Factory_i.jpg",
    },
  },
  {
    title: "齋明寺",
    desc: "清代古剎與清水模禪堂並置，寧靜清幽。",
    tag: "文化",
    photo: {
      src: "/images/zhaiming-temple.jpg",
      author: "阿道",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Chan_Hall_of_Zhai_Ming_Monastery_01_20250618.jpg",
    },
  },
  {
    title: "和平老街小吃",
    desc: "花生糖、月光饅頭、碗粿，遶境期間延長營業。",
    tag: "美食",
    photo: {
      src: "/images/old-street-crowd.jpg",
      author: "Andrewhaimerl",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Old_Street_Crowd.jpg",
    },
  },
];
