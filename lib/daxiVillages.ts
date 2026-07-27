// Official list of all 28 villages (里) in 大溪區 (Daxi District, Taoyuan),
// verified against the district office's own page (states "共有28個里"):
// https://www.daxi.tycg.gov.tw/cp.aspx?n=7509
//
// Pure data, no server-only imports — safe for client components (the
// bulletin admin form's dropdown) to import directly.
export const DAXI_VILLAGES = [
  "興和里",
  "福仁里",
  "一心里",
  "田心里",
  "康安里",
  "一德里",
  "義和里",
  "福安里",
  "月眉里",
  "永福里",
  "美華里",
  "復興里",
  "新峰里",
  "僑愛里",
  "仁義里",
  "仁善里",
  "仁美里",
  "仁愛里",
  "仁和里",
  "南興里",
  "光明里",
  "三元里",
  "員林里",
  "瑞源里",
  "仁武里",
  "仁文里",
  "中新里",
  "瑞興里",
] as const;

export type DaxiVillage = (typeof DAXI_VILLAGES)[number];
