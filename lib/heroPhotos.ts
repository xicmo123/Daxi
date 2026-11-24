// Photos for the home-page carousels, chosen by what each slide is about.
// Both carousels used to hand out photos by slide position, so 豆干旅遊節
// sat on 普濟堂 and 停水停電 on an old-street crowd. Every photo here is
// freely licensed (Wikimedia Commons) and credited on the slide.

export type HeroPhoto = { src: string; author?: string; sourceUrl?: string };

const P = {
  oldStreet: { src: "/images/old-street-crowd.jpg", author: "Andrewhaimerl", sourceUrl: "https://commons.wikimedia.org/wiki/File:Daxi_Old_Street_Crowd.jpg" },
  doufu: {
    src: "/images/doufu-street.jpg",
    author: "bryan...（Flickr）",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Food_%E7%8F%BE%E6%BB%B7%E8%B1%86%E5%B9%B2,_%E9%BB%83%E6%97%A5%E9%A6%99%E8%B1%86%E5%B9%B2,_%E5%A4%A7%E6%BA%AA,_%E6%A1%83%E5%9C%92,_%E5%8F%B0%E7%81%A3,_Daxi,_Taoyuan,_Taiwan_(47202231432).jpg",
  },
  puji: { src: "/images/puji-temple.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Puji_Temple.jpg" },
  procession: { src: "/images/guanyu-birthday-celebration.jpg", author: "fppp053", sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪普濟堂關聖帝君聖誕慶典.jpg" },
  bridge: { src: "/images/daxi-bridge.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Bridge.jpg" },
  teaFactory: { src: "/images/tea-factory.jpg", author: "Taiwankengo", sourceUrl: "https://commons.wikimedia.org/wiki/File:2021_Daxi_Tea_Factory_i.jpg" },
  wudeHall: { src: "/images/wude-hall.jpg", author: "寺人孟子", sourceUrl: "https://commons.wikimedia.org/wiki/File:大溪武德殿.jpg" },
  zhaiming: { src: "/images/zhaiming-temple.jpg", author: "阿道", sourceUrl: "https://commons.wikimedia.org/wiki/File:Chan_Hall_of_Zhai_Ming_Monastery_01_20250618.jpg" },
  topSpinning: { src: "/images/top-spinning-plaque.jpg" },
  // Added for topics no Daxi photo covered.
  shimen: { src: "/images/topics/shimen-reservoir.jpg", author: "Ken Marshall", sourceUrl: "https://commons.wikimedia.org/wiki/File:Shimen_Dam_Overlook.jpg" },
  garbage: { src: "/images/topics/garbage-truck.jpg", author: "T Gordon Cheng", sourceUrl: "https://commons.wikimedia.org/wiki/File:Zhubei_Garbage_truck_2025-02-19.jpg" },
  roadworks: { src: "/images/topics/roadworks.jpg", author: "Dquai", sourceUrl: "https://commons.wikimedia.org/wiki/File:Construction_site_of_sidewalks_along_Wenxin_Road_in_Taichung.jpg" },
  outages: { src: "/images/topics/utility-pole.jpg", author: "Lobester00", sourceUrl: "https://commons.wikimedia.org/wiki/File:2022-01-28_utility_pole_in_downtown_Changhua.jpg" },
} satisfies Record<string, HeroPhoto>;

export const HERO_PHOTOS = P;

// First match wins, so the more specific topics come first.
const RULES: Array<[RegExp, HeroPhoto]> = [
  [/豆干|豆乾|豆腐/, P.doufu],
  [/石門|水庫|半馬|馬拉松|楓/, P.shimen],
  [/陀螺/, P.topSpinning],
  [/遶境|隨香|社頭|北管|神將|藝陣|關聖|關公|六月廿四|大禧|迎神/, P.procession],
  [/普濟堂|廟|宮|祈福/, P.puji],
  [/齋明寺|禪/, P.zhaiming],
  [/茶/, P.teaFactory],
  [/木藝|木博館|武德殿|工藝|日式/, P.wudeHall],
  [/大溪橋|河岸|河濱|大漢溪|夜景|自行車|單車/, P.bridge],
  [/垃圾|資源回收|清運/, P.garbage],
  [/施工|道路|封路|挖路/, P.roadworks],
  [/停水|停電|降壓|台電|台水/, P.outages],
  [/老街|散步|牌樓|和平路|中山路/, P.oldStreet],
];

// Generic scenery for slides no rule recognises, used in turn.
const SCENERY: HeroPhoto[] = [P.oldStreet, P.bridge, P.teaFactory, P.wudeHall];

/** The photo for a slide about `text` (its title, plus subtitle if useful). */
export function photoForTopic(text: string, fallbackIndex = 0): HeroPhoto {
  return RULES.find(([re]) => re.test(text))?.[1] ?? SCENERY[fallbackIndex % SCENERY.length];
}

// 我是大溪人 slides point at features; the feature decides the picture.
const BY_FEATURE: Record<string, HeroPhoto> = {
  garbage: P.garbage,
  roadworks: P.roadworks,
  outages: P.outages,
  events: P.procession,
};

export function photoForResidentSlide(slide: { featureKey?: string; href?: string; title: string; subtitle?: string }, index: number): HeroPhoto {
  const byKey = slide.featureKey ? BY_FEATURE[slide.featureKey] : undefined;
  return byKey ?? photoForTopic(`${slide.title} ${slide.subtitle ?? ""} ${slide.href ?? ""}`, index);
}
