import Link from "next/link";
import { HeaderShapes, type PageTint } from "@/components/PageHeader";

type FeatureStatus = "已上線" | "資料串接" | "後台可控" | "可優化";

type FeatureItem = {
  title: string;
  desc: string;
  href?: string;
  status: FeatureStatus;
};

type FeatureSection = {
  id: string;
  title: string;
  subtitle: string;
  tint: PageTint;
  count: string;
  items: FeatureItem[];
};

const statusTone: Record<FeatureStatus, { bg: string; fg: string }> = {
  已上線: { bg: "rgba(69,125,112,0.14)", fg: "var(--status-ok)" },
  資料串接: { bg: "rgba(74,117,148,0.14)", fg: "var(--river-teal)" },
  後台可控: { bg: "rgba(160,106,58,0.14)", fg: "var(--daxi-red)" },
  可優化: { bg: "rgba(184,129,76,0.16)", fg: "var(--status-warn)" },
};

const sections: FeatureSection[] = [
  {
    id: "tourist",
    title: "遊客首頁",
    subtitle: "把第一次來大溪的人導到景點、活動、停車和店家",
    tint: "wood",
    count: "11",
    items: [
      { title: "身分切換", desc: "遊客首頁可切換到大溪人模式，保留兩套底部導覽與首頁資訊架構。", href: "/", status: "已上線" },
      { title: "首頁搜尋", desc: "搜尋景點、店家、活動，送到全站搜尋結果頁。", href: "/search", status: "已上線" },
      { title: "活動輪播", desc: "大溪大禧與老街周邊活動，支援日期、狀態、詳情彈窗與後台編輯。", href: "/events", status: "後台可控" },
      { title: "天氣情境推薦", desc: "依大溪天氣把室內、避暑或雨天適合景點排到前面。", href: "/", status: "資料串接" },
      { title: "景點地圖", desc: "景點定位、分類、照片、詳細頁、附近推薦與建議路線。", href: "/spots", status: "資料串接" },
      { title: "商家列表", desc: "美食與市集清單，支援評分、距離、排隊狀態、寄放服務與詳細頁。", href: "/businesses", status: "資料串接" },
      { title: "公車資訊", desc: "大溪老街周邊即時公車位置、路線方向與時刻資訊。", href: "/bus", status: "資料串接" },
      { title: "周邊停車", desc: "停車場即時空位、距離排序、建議步行與交通提醒。", href: "/parking", status: "資料串接" },
      { title: "即時影像", desc: "道路 CCTV、景點直播、天氣與交通管制集中查看。", href: "/weather", status: "資料串接" },
      { title: "優惠券", desc: "遊客可瀏覽優惠，到店出示核銷碼讓店員掃描。", href: "/coupons", status: "已上線" },
      { title: "我的收藏", desc: "收藏景點與店家，形成個人化再次造訪清單。", href: "/profile", status: "已上線" },
    ],
  },
  {
    id: "resident",
    title: "大溪人模式",
    subtitle: "讓居民第一眼看見公告、今日動態和生活動線",
    tint: "river",
    count: "13",
    items: [
      { title: "社區佈告欄", desc: "黑板式公告區，里別下拉複選，保留較大的公告閱讀空間。", href: "/resident", status: "後台可控" },
      { title: "大溪今日動態", desc: "停水停電、道路施工、區公所公告三項狀態快速入口。", href: "/resident", status: "資料串接" },
      { title: "客運資訊", desc: "居民首頁主打入口，內頁可看路線方向、即時位置與時刻。", href: "/resident/bus", status: "資料串接" },
      { title: "垃圾清運", desc: "居民首頁主打入口，點開跳窗查看大溪區目前在線清運車。", href: "/resident", status: "資料串接" },
      { title: "即時影像", desc: "大溪人出門前可看道路 CCTV 與景點直播。", href: "/resident/live", status: "資料串接" },
      { title: "區公所公告", desc: "同步大溪區公所最新消息，也可從居民底部導覽進入。", href: "/resident/announcements", status: "資料串接" },
      { title: "停水停電", desc: "整理影響大溪區的停水、降壓與停電預告。", href: "/resident/outages", status: "資料串接" },
      { title: "道路施工", desc: "道路申挖與施工位置地圖，支援從今日動態直達。", href: "/resident/roadworks", status: "資料串接" },
      { title: "里民服務", desc: "陳情報修、緊急聯絡、常用連結與居民生活服務集中頁。", href: "/resident/services", status: "已上線" },
      { title: "醫療輪值", desc: "診所與藥局時刻表資料可由後台建置，前台顯示現在有開。", href: "/resident/clinics", status: "後台可控" },
      { title: "AED 尋找", desc: "大溪區 AED 點位與最近位置查找。", href: "/resident/aed", status: "資料串接" },
      { title: "在地活動", desc: "居民版活動入口，沿用活動資料但語境更偏在地生活。", href: "/resident/events", status: "已上線" },
      { title: "居民首頁輪播", desc: "可用後台替居民首頁配置獨立輪播內容。", status: "後台可控" },
      { title: "居民個人頁", desc: "居民模式下的個人與設定入口。", href: "/resident/profile", status: "已上線" },
    ],
  },
  {
    id: "live",
    title: "即時資料與地圖",
    subtitle: "這些功能決定 app 是否真的能幫使用者少走冤枉路",
    tint: "moss",
    count: "9",
    items: [
      { title: "中央氣象署天氣", desc: "大溪區天氣、溫度與天氣情境，用於首頁推薦與即時影像頁。", href: "/weather", status: "資料串接" },
      { title: "桃園停車資料", desc: "停車場空位與每分鐘更新的周邊停車列表。", href: "/parking", status: "資料串接" },
      { title: "公車即時位置", desc: "客運路線、方向、站點與即時車輛位置。", href: "/bus", status: "資料串接" },
      { title: "垃圾車位置", desc: "全區清運車位置彙整，前端顯示大溪區目前在線車輛。", href: "/resident", status: "資料串接" },
      { title: "台電停電預告", desc: "彙整大溪區停電資訊到居民民生示警看板。", href: "/resident/outages", status: "資料串接" },
      { title: "道路施工資料", desc: "桃園道路施工與申挖資訊，地圖化呈現。", href: "/resident/roadworks", status: "資料串接" },
      { title: "區公所公告", desc: "一般公告與居民公告共用官方來源。", href: "/announcements", status: "資料串接" },
      { title: "公廁與友善設施", desc: "景點頁提供公廁外部入口，後台可管理設施點位。", href: "/spots", status: "後台可控" },
      { title: "即時影像", desc: "大溪道路 CCTV 優先顯示，並保留老街、石門水庫等景點直播入口。", href: "/weather", status: "資料串接" },
    ],
  },
  {
    id: "merchant",
    title: "商家與優惠",
    subtitle: "把店家資訊、現場狀態和優惠券串成可營運的閉環",
    tint: "wood",
    count: "8",
    items: [
      { title: "商家卡片", desc: "照片、距離、評分、類別與狀態標籤。", href: "/businesses", status: "已上線" },
      { title: "商家詳細頁", desc: "營業時間、電話、社群、附近推薦、停車建議、優惠與收藏。", href: "/businesses", status: "已上線" },
      { title: "排隊燈號", desc: "店家可更新免排隊、排隊中、號碼牌發放完畢。", status: "後台可控" },
      { title: "等候時間", desc: "店家可送出預估等待分鐘數，前台即時顯示。", status: "後台可控" },
      { title: "完售狀態", desc: "店家可標記今日商品已完售，減少遊客白跑。", status: "後台可控" },
      { title: "寄放服務", desc: "店家可標示是否提供伴手禮寄放。", status: "後台可控" },
      { title: "優惠券展示", desc: "遊客可在優惠券頁或商家詳細頁查看可用優惠。", href: "/coupons", status: "已上線" },
      { title: "掃碼核銷", desc: "商家後台提供優惠券核銷結果頁與登入保護。", href: "/merchant/login", status: "已上線" },
    ],
  },
  {
    id: "ops",
    title: "營運後台",
    subtitle: "目前 app 不是單純靜態展示，已有內容與資料維護能力",
    tint: "river",
    count: "12",
    items: [
      { title: "景點 / 店家管理", desc: "新增、編輯、隱藏、刪除地點，維護照片、故事與分類。", href: "/admin", status: "後台可控" },
      { title: "首頁活動輪播", desc: "維護遊客首頁活動卡、圖像、CTA 與顯示狀態。", href: "/admin/carousel", status: "後台可控" },
      { title: "活動管理", desc: "新增與編輯活動，供遊客與居民活動頁使用。", href: "/admin/events", status: "後台可控" },
      { title: "優惠券管理", desc: "管理優惠內容、有效期限與啟用狀態。", href: "/admin/coupons", status: "後台可控" },
      { title: "商家帳號", desc: "建立商家登入帳號，讓店家自行維護現場狀態與優惠。", href: "/admin/merchants", status: "後台可控" },
      { title: "居民佈告欄", desc: "管理里內公告、里別、分類、完整內容與發布時間。", href: "/admin/resident-bulletin", status: "後台可控" },
      { title: "居民首頁輪播", desc: "維護居民模式首頁專用輪播。", href: "/admin/resident-carousel", status: "後台可控" },
      { title: "診所輪值", desc: "建置診所與藥局資訊，供居民醫療輪值頁顯示。", href: "/admin/resident-clinics", status: "後台可控" },
      { title: "步行路線", desc: "管理景點頁建議路線與地圖路線。", href: "/admin/routes", status: "後台可控" },
      { title: "友善設施", desc: "管理公廁、飲水機、無障礙路線等地圖設施點。", href: "/admin/amenities", status: "後台可控" },
      { title: "交通管制", desc: "建立交通警示與即時狀態頁的管制資訊。", href: "/admin/traffic-alerts", status: "後台可控" },
      { title: "稽核紀錄", desc: "後台變更紀錄可查，方便追蹤資料維護狀況。", href: "/admin/audit-log", status: "後台可控" },
    ],
  },
];

const totals = [
  { label: "功能模組", value: "53" },
  { label: "主要模式", value: "3" },
  { label: "即時來源", value: "7+" },
  { label: "後台模組", value: "12" },
];

function tintGradient(tint: PageTint) {
  if (tint === "wood") return "linear-gradient(160deg, var(--block-wood) 0%, var(--block-wood-deep) 100%)";
  if (tint === "moss") return "linear-gradient(160deg, var(--block-moss) 0%, var(--block-moss-deep) 100%)";
  if (tint === "river") return "linear-gradient(160deg, var(--block-river) 0%, var(--block-river-deep) 100%)";
  return "linear-gradient(160deg, var(--daxi-red) 0%, color-mix(in srgb, var(--daxi-red) 100%, black 28%) 100%)";
}

function SectionGlyph({ tint }: { tint: PageTint }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: tintGradient(tint), color: tint === "red" ? "#fff" : "var(--block-fg)" }}
      aria-hidden
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6.5h14" />
        <path d="M5 12h14" />
        <path d="M5 17.5h9" />
      </svg>
    </span>
  );
}

function FeatureCard({ item }: { item: FeatureItem }) {
  const tone = statusTone[item.status];
  const hrefLabel = item.href === "/" ? "首頁" : item.href;
  const content = (
    <>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <h3 className="min-w-0 text-[15px] font-black leading-snug" style={{ color: "var(--ink)" }}>
          {item.title}
        </h3>
        <span className="w-fit shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold leading-none" style={{ background: tone.bg, color: tone.fg }}>
          {item.status}
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        {item.desc}
      </p>
      {item.href ? (
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color: "var(--daxi-red)" }}>
          <span>{hrefLabel}</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      ) : null}
    </>
  );

  if (!item.href) {
    return (
      <div className="rounded-2xl border p-4" style={{ background: "var(--card)", borderColor: "var(--line)", boxShadow: "var(--shadow-card)" }}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="block rounded-2xl border p-4 text-left transition-transform active:scale-[0.99]"
      style={{ background: "var(--card)", borderColor: "var(--line)", boxShadow: "var(--shadow-card)", textDecoration: "none" }}
    >
      {content}
    </Link>
  );
}

export default function FeaturesPage() {
  return (
    <div className="overflow-x-hidden">
      <section
        className="relative overflow-hidden safe-page-x pt-7 pb-6 fade-in"
        style={{
          background: "linear-gradient(160deg, var(--block-river) 0%, var(--block-moss) 56%, var(--block-wood) 100%)",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: "var(--shadow-float)",
        }}
      >
        <HeaderShapes />
        <div className="relative">
          <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(43,36,32,0.7)" }}>
            Product Map
          </div>
          <h1 className="mt-1 text-[28px] font-black leading-tight sm:text-[34px]" style={{ color: "var(--block-fg)" }}>
            大溪通功能總覽
          </h1>
          <p className="mt-2 max-w-2xl break-words text-[13px] font-semibold leading-relaxed" style={{ color: "rgba(43,36,32,0.78)" }}>
            目前 app 已分成遊客、大溪人、商家與營運後台四條主軸；這裡把所有已做出的功能集中盤點，方便下一步安排首頁入口、資料優先級與開發順序。
          </p>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {totals.map((total) => (
            <div key={total.label} className="min-w-0 rounded-2xl px-2 py-3 text-center" style={{ background: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.28)" }}>
              <div className="text-[21px] font-black leading-none" style={{ color: "var(--block-fg)" }}>
                {total.value}
              </div>
              <div className="mt-1 text-[10.5px] font-bold" style={{ color: "rgba(43,36,32,0.68)" }}>
                {total.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="safe-page-x pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-black"
              style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink)", textDecoration: "none" }}
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-7 pt-4 pb-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-4">
            <div className="safe-page-x mb-3 flex items-center gap-3">
              <SectionGlyph tint={section.tint} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-black leading-tight" style={{ color: "var(--ink)" }}>
                    {section.title}
                  </h2>
                  <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: "var(--paper-2)", color: "var(--ink-soft)" }}>
                    {section.count} 項
                  </span>
                </div>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: "var(--ink-soft)" }}>
                  {section.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 safe-page-x md:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <FeatureCard key={`${section.id}-${item.title}`} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
