import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { readClinics, withOpenStatus } from "@/lib/clinicData";

export const dynamic = "force-dynamic";

const TYPE_COLOR: Record<string, string> = {
  診所: "var(--river-teal)",
  藥局: "var(--block-moss-deep)",
  醫院: "var(--daxi-red)",
};

export default async function ResidentClinicsPage() {
  const clinics = await readClinics();
  const rows = withOpenStatus(clinics);

  return (
    <div className="pt-2">
      <PageHeader title="醫療輪值地圖" subtitle="大溪區診所、藥局現在有開的先看" tint="river" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-3">
        {rows.length === 0 ? (
          <EmptyState
            variant="mascot"
            title="診所資料建置中"
            subtitle="尚無經核實的大溪區診所/藥局時刻表資料，之後會陸續補上"
          />
        ) : (
          rows.map((clinic) => (
            <div
              key={clinic.id}
              className="rounded-2xl px-4 py-3.5"
              style={{ background: "var(--card)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.06)", color: TYPE_COLOR[clinic.type] ?? "var(--ink-soft)" }}
                  >
                    {clinic.type}
                  </span>
                  {clinic.isHolidayDuty ? (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--daxi-red)", color: "#fff" }}>
                      假日急診
                    </span>
                  ) : null}
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={
                    clinic.isOpenNow
                      ? { background: "var(--status-ok)", color: "#fff" }
                      : { background: "var(--paper-2)", color: "var(--ink-soft)" }
                  }
                >
                  {clinic.isOpenNow ? "現在有開" : "已休診"}
                </span>
              </div>
              <div className="text-[14px] font-bold mb-1" style={{ color: "var(--ink)" }}>
                {clinic.name}
              </div>
              <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>
                {clinic.address}
              </div>
              {clinic.phone ? (
                <a href={`tel:${clinic.phone}`} className="mt-2 inline-block text-[12.5px] font-semibold" style={{ color: "var(--river-teal)" }}>
                  {clinic.phone}
                </a>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
