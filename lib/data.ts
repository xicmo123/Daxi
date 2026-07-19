export type Status = "ok" | "mid" | "full";

export type EventItem = {
  time: string;
  title: string;
  desc: string;
  badges?: ("live" | "route")[];
};

export type EventDay = {
  id: string;
  label: string;
  items: EventItem[];
};

export const eventDays: EventDay[] = [
  {
    id: "d1",
    label: "7/18（六）",
    items: [
      {
        time: "18:00",
        title: "社頭集合暖身",
        desc: "普濟堂廣場集合，開放近距離欣賞神將裝扮。",
      },
      {
        time: "19:30",
        title: "夜巡暖場遶境",
        desc: "中山路晚間 19:00–22:00 管制通行。",
        badges: ["route"],
      },
    ],
  },
  {
    id: "d2",
    label: "7/19（日）・今天",
    items: [
      {
        time: "09:00",
        title: "關聖帝君祝壽大典",
        desc: "普濟堂內舉行祝壽儀式，開放信眾參拜。",
      },
      {
        time: "14:00",
        title: "主日遶境出巡",
        desc: "沿線交通管制至 21:00，建議改停外圍停車場並步行前往。",
        badges: ["live", "route"],
      },
      {
        time: "19:00",
        title: "老街封街踩街表演",
        desc: "和平路、中央路全區徒步，社頭匯演接力登場。",
      },
    ],
  },
  {
    id: "d3",
    label: "7/20（一）",
    items: [
      {
        time: "10:00",
        title: "謝神儀式",
        desc: "舉行謝神與收尾儀式，活動圓滿落幕，管制解除。",
      },
    ],
  },
];

export type ParkingLot = {
  name: string;
  meta: string;
  status: Status;
  statusLabel: string;
  pct: number;
};

export const parkingLots: ParkingLot[] = [
  { name: "中正公園地下停車場", meta: "距老街 250m・剩餘 41/230", status: "mid", statusLabel: "略滿", pct: 18 },
  { name: "河濱停車場（月眉）", meta: "距老街 900m・接駁車・剩餘 260/400", status: "ok", statusLabel: "充裕", pct: 65 },
  { name: "大溪國小旁停車場", meta: "距老街 400m・剩餘 0/120", status: "full", statusLabel: "已滿", pct: 0 },
  { name: "武德殿停車場", meta: "距老街 350m・剩餘 26/100", status: "mid", statusLabel: "略滿", pct: 26 },
  { name: "大溪橋觀光停車場", meta: "距老街 600m・剩餘 90/150", status: "ok", statusLabel: "充裕", pct: 60 },
  { name: "員林路臨時停車場", meta: "距老街 1.1km・接駁車・剩餘 310/400", status: "ok", statusLabel: "充裕", pct: 78 },
];

export const hourlyForecast = [
  { hour: "15時", temp: "33°", icon: "☀️" },
  { hour: "18時", temp: "30°", icon: "⛅" },
  { hour: "21時", temp: "27°", icon: "🌦️" },
  { hour: "明日", temp: "26–34°", icon: "⛈️" },
];

export type Alert = {
  level: "block" | "warn" | "info";
  title: string;
  desc: string;
};

export const trafficAlerts: Alert[] = [
  { level: "block", title: "老街全區徒步管制", desc: "14:00–21:00・和平路、中央路禁止車輛通行" },
  { level: "warn", title: "中山路單向管制", desc: "19:00–22:00・請改道復興路通行" },
  { level: "info", title: "免費接駁車", desc: "月眉／員林路停車場 ↔ 老街，每 15 分鐘一班" },
];

export type DiscoverItem = {
  title: string;
  desc: string;
  tag: string;
  tone: "cognac" | "bordeaux";
};

export const discoverItems: DiscoverItem[] = [
  { title: "大溪橋", desc: "紅色鋼橋夜間點燈，眺望大漢溪天際線。", tag: "景點", tone: "bordeaux" },
  { title: "武德殿", desc: "日治木構建築，現為藝文展演空間。", tag: "文化", tone: "cognac" },
  { title: "老街豆干街", desc: "百年豆干老店聚集，現場試吃比風味。", tag: "美食", tone: "cognac" },
  { title: "大溪老茶廠", desc: "1926 年製茶廠改建，工業風建築。", tag: "景點", tone: "bordeaux" },
  { title: "齋明寺", desc: "清代古剎與清水模禪堂並置，寧靜清幽。", tag: "文化", tone: "cognac" },
  { title: "和平老街小吃", desc: "花生糖、月光饅頭、碗粿，遶境期間延長營業。", tag: "美食", tone: "bordeaux" },
];
