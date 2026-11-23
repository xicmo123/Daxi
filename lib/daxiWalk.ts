import type { PhotoCredit } from "./data";

export const daxiWalkHref = "/old-street-walk";
export const daxiWalkTitle = "大溪老街散步";
export const daxiWalkLength = "約 1.2 公里";
export const daxiWalkVisitTime = "建議預留 60–90 分鐘";

export const oldStreetPhoto = {
  src: "/images/old-street-crowd.jpg",
  alt: "大溪和平路老街兩側的商家與往來遊客",
  author: "Andrewhaimerl",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Old_Street_Crowd.jpg",
};

export const oldStreetHistorySource = "https://travel.tycg.gov.tw/zh-tw/event/taoyuan-walker/3008";
export const photoLicense = "https://creativecommons.org/licenses/by-sa/4.0/";

type WalkStop = {
  name: string;
  address: string;
  description: string;
  coordinates: [number, number];
  minutesFromPrevious?: number;
  photo: Required<Pick<PhotoCredit, "src" | "author" | "sourceUrl">> & { alt: string };
};

export const daxiWalkStops: WalkStop[] = [
  {
    name: "和平老街",
    address: "大溪區和平路",
    description: "抬頭看看商號的山牆與雕飾。西式柱飾和閩南吉祥圖案並列，留下當年商家各自的門面。",
    coordinates: [24.8847, 121.28867],
    photo: oldStreetPhoto,
  },
  {
    name: "普濟堂",
    address: "大溪區普濟路 124 號",
    description: "從老街轉進巷子，看見供奉關聖帝君的普濟堂。每年大溪大禧的遶境，從這裡串起街區的社頭與居民。",
    coordinates: [24.8865338, 121.2860799],
    minutesFromPrevious: 5,
    photo: {
      src: "/images/businesses/puji-temple-b.jpg",
      alt: "大溪普濟堂的屋脊、廟埕與紅燈籠",
      author: "Taiwankengo",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Puji_Temple_b.jpg",
    },
  },
  {
    name: "中正公園",
    address: "大溪區普濟路",
    description: "從公園的老樹旁望向大漢溪與大溪橋。站在河階上，就能看出老城街道與溪畔之間的高低差。",
    coordinates: [24.883883, 121.28482],
    minutesFromPrevious: 5,
    photo: {
      src: "/images/businesses/zhongzheng-park.jpg",
      alt: "大溪中正公園的老樹、步道與涼亭",
      author: "Allervous",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Zhongzheng_Park-20250129.jpg",
    },
  },
  {
    name: "武德殿",
    address: "大溪區普濟路 33-3 號",
    description: "這座 1935 年落成的武道練習場，如今是木藝生態博物館的展館。可以在外頭看看屋頂和木構，再依當日開放時間入內參觀。",
    coordinates: [24.8810271, 121.286092],
    minutesFromPrevious: 5,
    photo: {
      src: "/images/wude-hall.jpg",
      alt: "大溪武德殿的正門與日式木構建築",
      author: "寺人孟子",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪武德殿.jpg",
    },
  },
];

export function walkNavigationHref(stop: WalkStop): string {
  const params = new URLSearchParams({
    api: "1",
    destination: stop.coordinates.join(","),
    travelmode: "walking",
    dir_action: "navigate",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
