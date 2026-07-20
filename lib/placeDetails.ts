// Hand-curated overlay, keyed by Google Places placeId — same pattern as
// businessPhotos.ts, kept separate so the weekly refresh script never wipes
// it out. `story` is only written for places we can verify from public
// sources (temples, museums, historic sites); ordinary shops and
// restaurants get a `category` label only, never an invented backstory.
export type PlaceDetail = {
  category?: string;
  story?: string;
  tags?: string[];
};

export const placeDetails: Record<string, PlaceDetail> = {
  // 老阿伯現滷豆干 — the shop's own long queues are well documented; the
  // dark-tofu process described here is general, well-known Daxi craft
  // knowledge, not a specific unverified claim about this one shop.
  "ChIJuwRV3SEYaDQRiEQnq6NCVw4": {
    category: "豆干老店",
    story: "大溪滷豆干色澤深黑，源自長時間反覆滷煮的糖色工法，早年為延長保存期限而生。",
    tags: ["#大溪豆干", "#排隊美食"],
  },
  // 東和音樂體驗館 — 1960s wooden TV-cabinet maker turned piano manufacturer
  // via a Japanese partnership; verified via 桃園觀光導覽網/觀光署開放資料.
  "ChIJS-0RFyUYaDQRr6-oJNVQcqI": {
    category: "木藝職人",
    story: "1960年代從木製電視機殼起家，後與日方合作轉型製琴，見證大溪木藝產業的轉型軌跡。",
    tags: ["#木藝職人", "#工廠觀光"],
  },
  // 大溪埔頂公園
  "ChIJT_aqYmkYaDQR427DjxHNCcU": {
    category: "自然景觀",
    story: "居高俯瞰大漢溪河谷，是大溪人口耳相傳的看夕陽秘境。",
    tags: ["#夕陽景點", "#河谷美景"],
  },
  // 李騰芳古宅
  "ChIJwSedXToYaDQRRzDG24ZPDzc": {
    category: "國定古蹟",
    story: "清代李騰芳中舉後興建的閩南式大宅，見證大溪河運鼎盛的仕紳歲月。",
    tags: ["#國定古蹟", "#閩南建築"],
  },
  // 大溪中正公園
  "ChIJAcbxQSIYaDQRY-uNQ8Xq704": {
    category: "自然景觀",
    story: "日治時期即已闢建，是大溪歷史最悠久的公共庭園之一。",
    tags: ["#老字號公園", "#散步好去處"],
  },
  // 大溪橋
  "ChIJ7QuhMh8YaDQRC4idli6CBik": {
    category: "歷史地標",
    story: "仿巴洛克式牌樓橋身，夜間點燈成為大溪最具代表性的地標剪影。",
    tags: ["#夜間點燈", "#拍照打卡"],
  },
  // 大溪普濟堂
  "ChIJ59rofCIYaDQRNJ9N7g5dCQ4": {
    category: "信仰古蹟",
    story: "供奉關聖帝君的信仰中心，每年六月廿四遶境即由此起駕。",
    tags: ["#信仰中心", "#624遶境起駕"],
  },
  // 壹號館-大溪木藝生態博物館
  "ChIJYzcTXx8YaDQRmoxhDCnC3Aw": {
    category: "木藝職人",
    story: "日治警察宿舍活化再利用，展示大溪家具產業的木藝職人技藝。",
    tags: ["#木藝職人", "#日式建築"],
  },
  // 桃園大溪木藝生態博物館（四連棟）
  "ChIJTcY5OiAYaDQRajctdjMUaH0": {
    category: "木藝職人",
    story: "四棟相連的日式宿舍建築群，是木藝生態博物館的核心展區之一。",
    tags: ["#日式建築群", "#木藝展區"],
  },
  // 鳳飛飛故事館
  "ChIJa3TldjQZaDQRve2IXpVU5B4": {
    category: "名人故事館",
    story: "紀念出身大溪的國民歌后鳳飛飛，展出其生平物件與經典金曲。",
    tags: ["#名人故事", "#懷舊金曲"],
  },
  // 天主教方濟生活園區
  "ChIJ_46l74oXaDQRJ_gMsGzcgHg": {
    category: "宗教建築",
    story: "天主教方濟會在大溪設立的靈修生活園區，鬧區裡的一方靜謐角落。",
    tags: ["#靜謐角落", "#靈修園區"],
  },
  // 大漢溪山豬湖生態親水園區
  "ChIJgYuMHPAZaDQRGLuAoxbKEBc": {
    category: "自然景觀",
    story: "沿溪而建的生態步道，保留大漢溪支流原始溪谷樣貌。",
    tags: ["#生態步道", "#原始溪谷"],
  },
  // 大溪河濱公園
  "ChIJzRhetRcYaDQRF1DpSokjfjM": {
    category: "自然景觀",
    story: "大漢溪畔的開闊河濱綠地，落羽松步道是近年新興打卡熱點。",
    tags: ["#落羽松", "#河濱綠地"],
  },
  // 月眉休閒農業區
  "ChIJW-1AA7gZaDQRfAhvuPXyygU": {
    category: "自然景觀",
    story: "月眉里的休閒農業聚落，田園景致保留大溪早期農村風貌。",
    tags: ["#田園風光", "#休閒農業"],
  },
};

// Google's own place-type classification, translated — a safe, non-invented
// fallback category for the many shops/restaurants with no curated entry
// above. Falls back to the business's tag (美食/景點/市集) when unmapped.
const GOOGLE_TYPE_LABELS: Record<string, string> = {
  restaurant: "餐廳",
  chinese_restaurant: "中式餐廳",
  taiwanese_restaurant: "台式料理",
  vegetarian_restaurant: "素食餐廳",
  vegan_restaurant: "蔬食餐廳",
  european_restaurant: "歐式餐廳",
  fast_food_restaurant: "速食",
  cafe: "咖啡廳",
  bakery: "烘焙坊",
  dessert_shop: "甜點店",
  pastry_shop: "糕餅舖",
  deli: "熟食店",
  bar: "酒吧",
  meal_takeaway: "外帶美食",
  market: "市場",
  supermarket: "超市",
  convenience_store: "便利商店",
  shopping_mall: "購物中心",
  clothing_store: "服飾店",
  gift_shop: "伴手禮店",
  store: "商店",
  pharmacy: "藥局",
  park: "公園",
  city_park: "公園",
  tourist_attraction: "觀光景點",
  historical_place: "歷史遺跡",
  museum: "博物館",
  bridge: "橋樑地標",
  place_of_worship: "宗教場所",
  church: "教堂",
};

export function categoryLabel(placeId: string, googleType: string | null, fallback: string): string {
  const curated = placeDetails[placeId]?.category;
  if (curated) return curated;
  if (googleType && GOOGLE_TYPE_LABELS[googleType]) return GOOGLE_TYPE_LABELS[googleType];
  return fallback;
}
