import Image from "next/image";
import { eventMilestones } from "@/lib/data";

const phaseLabel: Record<string, string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export default function EventTimeline() {
  return (
    <div className="flex flex-col pb-4 fade-in">
      {eventMilestones.map((item, i) => {
        const muted = item.phase === "past";
        const isLast = i === eventMilestones.length - 1;
        return (
          <div key={item.date} className="flex gap-4 px-6">
            <div className="flex flex-col items-center pt-2.5 shrink-0">
              <span
                className="w-[7px] h-[7px] rounded-full shrink-0"
                style={{ background: muted ? "var(--line)" : "var(--ink)", border: muted ? "1px solid var(--ink-soft)" : "none" }}
              />
              {!isLast ? <span className="w-px flex-1 mt-1" style={{ background: "var(--line)" }} /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-10" style={{ opacity: muted ? 0.6 : 1 }}>
              <div className="rounded-xl overflow-hidden mb-3">
                <div className="relative h-32">
                  <Image
                    src={item.photo.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 448px) 100vw, 420px"
                    className="object-cover"
                    style={{ filter: "saturate(0.82) contrast(0.96)" }}
                  />
                  <div className="absolute inset-0" style={{ background: "rgba(122, 112, 92, 0.1)" }} />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.5) 100%)" }}
                  />
                  <span className="absolute right-3 top-3 text-[10.5px] font-normal tracking-wide text-white/85">
                    {phaseLabel[item.phase]}
                  </span>
                  {item.photo.historical ? (
                    <span className="absolute left-3 top-3 text-[10px] text-white/85 rounded-full px-2 py-0.5 bg-black/30">
                      示意圖・舊照
                    </span>
                  ) : null}
                  <span className="absolute left-3 bottom-2.5 font-serif font-semibold text-[14px] text-white">
                    {item.date}
                  </span>
                </div>
              </div>
              <div className="text-[12.5px] mb-1" style={{ color: "var(--ink-soft)" }}>
                {item.time}
              </div>
              <h4 className="text-[15px] font-serif font-semibold mb-1.5">
                {item.title}
                {item.badges?.includes("route") ? (
                  <span
                    className="ml-2 text-[10.5px] font-normal rounded-full px-2 py-0.5 align-middle"
                    style={{ border: "1px solid var(--line)", color: "var(--ink-soft)" }}
                  >
                    交通管制
                  </span>
                ) : null}
              </h4>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {item.desc}
              </p>
              {item.ctaUrl ? (
                <a
                  href={item.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium mt-3 transition-opacity active:opacity-60"
                  style={{ color: "var(--ink)", borderBottom: "1px solid var(--ink)" }}
                >
                  {item.ctaLabel}
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
