import PageHeader from "@/components/PageHeader";

function LotSkeleton() {
  return (
    <div className="flex items-center justify-between gap-5 py-6" style={{ borderBottom: "1px solid var(--line)" }}>
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="h-4 w-1/2 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-3 w-1/3 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-2.5 w-2/3 rounded skeleton" style={{ background: "var(--line)" }} />
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <div className="h-7 w-12 rounded skeleton" style={{ background: "var(--line)" }} />
        <div className="h-2.5 w-16 rounded skeleton" style={{ background: "var(--line)" }} />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="pt-2">
      <PageHeader title="周邊停車" subtitle="距大溪老街由近到遠・每分鐘更新" tint="river" />
      <div className="px-6 pb-10" style={{ borderTop: "1px solid var(--line)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <LotSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
