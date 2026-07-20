import type { PhotoCredit } from "./data";

// Hand-curated overrides, keyed by Google Places placeId. Kept separate from
// the auto-generated lib/businesses.ts so the weekly refresh script never
// wipes them out. Google Places photos aren't usable here (no redistribution
// rights), so these are verified Wikimedia Commons (CC-licensed) photos, or
// official 桃園觀光導覽網 (travel.tycg.gov.tw) photos used under Taoyuan City
// Government's 政府資料開放授權條款 (attribution required, non-commercial —
// matched to our businesses.ts entries by exact lat/lng before use) —
// coverage only exists for well-known landmarks, not small shops/restaurants,
// so most businesses simply have no entry here and render without a photo.
export const businessPhotos: Record<string, PhotoCredit> = {
  // 大溪埔頂公園
  "ChIJT_aqYmkYaDQR427DjxHNCcU": {
    src: "/images/businesses/putingpark.jpg",
    author: "Casiocasio",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:桃園市大溪區埔頂公園.jpg",
  },
  // 李騰芳古宅
  "ChIJwSedXToYaDQRRzDG24ZPDzc": {
    src: "/images/businesses/liteng-fang.jpg",
    author: "Nobutaka67",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪李騰芳古宅.JPG",
  },
  // 大溪中正公園
  "ChIJAcbxQSIYaDQRY-uNQ8Xq704": {
    src: "/images/businesses/zhongzheng-park.jpg",
    author: "Allervous",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Zhongzheng_Park-20250129.jpg",
  },
  // 大溪橋 — reuses the same photo already credited on the homepage Discover section
  "ChIJ7QuhMh8YaDQRC4idli6CBik": {
    src: "/images/daxi-bridge.jpg",
    author: "Taiwankengo",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg",
  },
  // 大溪普濟堂
  "ChIJ59rofCIYaDQRNJ9N7g5dCQ4": {
    src: "/images/businesses/puji-temple-b.jpg",
    author: "Taiwankengo",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Puji_Temple_b.jpg",
  },
  // 壹號館-大溪木藝生態博物館
  "ChIJYzcTXx8YaDQRmoxhDCnC3Aw": {
    src: "/images/businesses/ecomuseum-hall1.jpg",
    author: "桃園市立大溪木藝生態博物館",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:桃園市立大溪木藝生態博物館壹號館.jpg",
  },
  // 桃園大溪木藝生態博物館（四連棟）
  "ChIJTcY5OiAYaDQRajctdjMUaH0": {
    src: "/images/businesses/ecomuseum-main.jpg",
    author: "桃園市立大溪木藝生態博物館",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:桃園市立大溪木藝生態博物館四連棟.jpg",
  },
  // 鳳飛飛故事館
  "ChIJa3TldjQZaDQRve2IXpVU5B4": {
    src: "/images/businesses/fongfeifei-house.jpg",
    author: "阿道",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Fong_Fei-fei_Story_House_01_20251030.jpg",
  },
  // 天主教方濟生活園區
  "ChIJ_46l74oXaDQRJ_gMsGzcgHg": {
    src: "/images/businesses/franciscan-centre.jpg",
    author: "lienyuan lee",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:天主教方濟生活園區_St_Francis_Xavier_Church_at_Daxi_-_panoramio.jpg",
  },
  // 大漢溪山豬湖生態親水園區
  "ChIJgYuMHPAZaDQRGLuAoxbKEBc": {
    src: "/images/businesses/shanzhuhu-lake.jpg",
    author: "lienyuan lee",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:山豬湖_Shanzhu_Lake_-_panoramio.jpg",
  },
  // 大溪河濱公園 — same 瑞興里 stretch of the Dahan River the park sits on
  "ChIJzRhetRcYaDQRF1DpSokjfjM": {
    src: "/images/businesses/dahan-river-zhongzhuang.jpg",
    author: "氏子",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:流經中庄的大嵙崁溪.jpg",
  },
  // 月眉休閒農業區
  "ChIJW-1AA7gZaDQRfAhvuPXyygU": {
    src: "/images/businesses/yuemei-old-house.jpg",
    author: "lienyuan lee",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:月眉老屋_Yuemei_Traditional_House_-_panoramio.jpg",
  },
  // 中庄吊橋 — coordinates matched exactly against travel.tycg.gov.tw
  "ChIJDQDEhlwZaDQRejZFHhM9iKo": {
    src: "/images/businesses/zhongzhuang-bridge.jpg",
    author: "桃園市政府觀光旅遊局",
    sourceUrl: "https://travel.tycg.gov.tw/zh-tw/travel/attraction/2185",
  },
  // 月眉人工濕地生態公園 — coordinates matched exactly against travel.tycg.gov.tw
  "ChIJA7odaOQZaDQROJIHrBxLEEI": {
    src: "/images/businesses/yuemei-wetland.jpg",
    author: "桃園市政府觀光旅遊局",
    sourceUrl: "https://travel.tycg.gov.tw/zh-tw/travel/attraction/1644",
  },
  // 桃園月眉人工濕地落羽松大道 — the tree-lined path sits inside the same
  // wetland park (~300m away), no separate official photo found; reuses
  // the park's photo rather than an unrelated stock image
  "ChIJ1WQEXWUZaDQRtmlHfLnTe3U": {
    src: "/images/businesses/yuemei-wetland.jpg",
    author: "桃園市政府觀光旅遊局",
    sourceUrl: "https://travel.tycg.gov.tw/zh-tw/travel/attraction/1644",
  },
  // 桃園市原住民族文化會館 — coordinates matched exactly against travel.tycg.gov.tw
  "ChIJ0bcpLxQYaDQRm0TakXa1I7A": {
    src: "/images/businesses/indigenous-culture-center.jpg",
    author: "桃園市政府觀光旅遊局",
    sourceUrl: "https://travel.tycg.gov.tw/zh-tw/travel/attraction/588",
  },
  // 東和音樂體驗館 — coordinates matched exactly against travel.tycg.gov.tw
  "ChIJS-0RFyUYaDQRr6-oJNVQcqI": {
    src: "/images/businesses/tonghe-piano.jpg",
    author: "桃園市政府觀光旅遊局",
    sourceUrl: "https://travel.tycg.gov.tw/zh-tw/travel/attraction/423",
  },
};
