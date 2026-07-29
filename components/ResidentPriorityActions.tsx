import Link from "next/link";

function BusIllustration() {
  return (
    <svg viewBox="0 0 180 132" aria-hidden="true" className="absolute bottom-0 right-0 h-[66px] w-[84px] opacity-90">
      <path d="M16 104c21-34 39-52 64-54 31-3 55 19 84-18" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="8" strokeLinecap="round" />
      <path d="M24 110h124" stroke="rgba(43,36,32,0.18)" strokeWidth="5" strokeLinecap="round" />
      <rect x="50" y="38" width="90" height="52" rx="17" fill="rgba(255,255,255,0.9)" />
      <path d="M63 54h26M101 54h25" stroke="#4a7594" strokeWidth="10" strokeLinecap="round" />
      <path d="M66 74h58" stroke="#2b2420" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="91" r="10" fill="#2b2420" />
      <circle cx="119" cy="91" r="10" fill="#2b2420" />
      <circle cx="72" cy="91" r="4" fill="#d7a06b" />
      <circle cx="119" cy="91" r="4" fill="#d7a06b" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CameraIllustration() {
  return (
    <svg viewBox="0 0 120 78" aria-hidden="true" className="absolute bottom-0 right-0 h-[58px] w-[88px] opacity-95">
      <path d="M10 58c22-18 40-24 58-18 18 7 28 2 42-14" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="7" strokeLinecap="round" />
      <rect x="34" y="22" width="47" height="31" rx="9" fill="rgba(255,255,255,0.88)" />
      <path d="m81 32 23-10v31L81 43Z" fill="rgba(255,255,255,0.7)" />
      <circle cx="55" cy="38" r="9" fill="#2b2420" fillOpacity="0.18" />
      <circle cx="55" cy="38" r="4" fill="#4a7594" />
      <path d="M44 58h31" stroke="rgba(43,36,32,0.2)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function ResidentPriorityActions() {
  return (
    <section className="safe-page-x pt-3 fade-in-delay-1" aria-labelledby="resident-priority-title">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: "var(--block-wood-deep)" }}>
            生活動線
          </div>
          <h2 id="resident-priority-title" className="text-[15px] font-black leading-tight" style={{ color: "var(--ink)" }}>
            出門前先看
          </h2>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>
          即時資訊
        </span>
      </div>

      <div className="mr-5 grid min-w-0 grid-cols-2 gap-1.5 sm:mr-0">
        <Link
          href="/resident/bus"
          className="group relative block h-[120px] min-w-0 overflow-hidden rounded-[20px] px-2.5 py-3 transition-transform active:scale-[0.98] md:h-[138px]"
          style={{
            background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-moss) 100%)",
            boxShadow: "var(--shadow-float)",
            color: "var(--block-fg)",
          }}
        >
          <BusIllustration />
          <div className="relative z-10 flex h-full flex-col justify-between gap-2">
            <div>
              <div className="mb-1.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.48)" }}>
                客運資訊
              </div>
              <div className="text-[15px] font-black leading-tight">客運在哪</div>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-bold">
              <span className="min-w-0 truncate leading-tight">位置 / 時刻</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "rgba(255,255,255,0.42)" }}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/resident/live"
          className="group relative block h-[120px] min-w-0 overflow-hidden rounded-[20px] px-2.5 py-3 transition-transform active:scale-[0.98] md:h-[138px]"
          style={{
            background: "linear-gradient(140deg, var(--block-river) 0%, var(--block-wood) 100%)",
            boxShadow: "var(--shadow-card)",
            color: "var(--block-fg)",
          }}
        >
          <CameraIllustration />
          <div className="relative z-10 flex h-full flex-col justify-between gap-2">
            <div className="min-w-0">
              <div className="mb-1.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.5)" }}>
                即時影像
              </div>
              <div className="text-[15px] font-black leading-tight">先看路況</div>
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] font-bold">
              <span className="min-w-0 truncate leading-tight">CCTV / 景點</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ background: "rgba(255,255,255,0.38)" }}>
                <ArrowIcon />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
