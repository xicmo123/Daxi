import type { PhotoCredit } from "./data";

// Hand-curated overrides, keyed by Google Places placeId. Kept separate from
// the auto-generated lib/businesses.ts so the weekly refresh script never
// wipes them out. Google Places photos aren't usable here (no redistribution
// rights), so these are verified Wikimedia Commons (CC-licensed) photos —
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
};
