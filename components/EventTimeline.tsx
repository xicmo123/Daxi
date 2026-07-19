import { eventMilestones } from "@/lib/data";

const phaseLabel: Record<string, string> = {
  past: "已結束",
  ongoing: "進行中",
  upcoming: "即將登場",
};

export default function EventTimeline() {
  return (
    <div className="px-5 flex flex-col gap-3 pb-4">
      {eventMilestones.map((item) => {
        const muted = item.phase === "past";
        return (
          <div
            key={item.date}
            className="rounded-2xl card-shadow p-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              opacity: muted ? 0.75 : 1,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-semibold text-[14px]" style={{ color: "var(--cognac-deep)" }}>
                {item.date}
              </span>
              <span
                className="text-[10.5px] font-semibold rounded-full px-2.5 py-1"
                style={
                  item.phase === "ongoing"
                    ? { background: "var(--bordeaux-tint)", color: "var(--bordeaux)" }
                    : item.phase === "upcoming"
                      ? { background: "var(--cognac-tint)", color: "var(--cognac-deep)" }
                      : { background: "var(--paper-2)", color: "var(--ink-soft)" }
                }
              >
                {phaseLabel[item.phase]}
              </span>
            </div>
            <div className="text-[12.5px] mb-1" style={{ color: "var(--ink-soft)" }}>
              {item.time}
            </div>
            <h4 className="text-[14.5px] font-semibold mb-1.5">
              {item.title}
              {item.badges?.includes("route") ? (
                <span
                  className="ml-1.5 text-[10.5px] font-semibold rounded-full px-2 py-0.5 align-middle"
                  style={{ background: "var(--cognac-tint)", color: "var(--cognac-deep)" }}
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
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold mt-3"
                style={{ color: "var(--bordeaux)" }}
              >
                {item.ctaLabel}
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
