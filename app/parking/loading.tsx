import PageHeader from "@/components/PageHeader";

function LotSkeleton() {
  return (
    <div
      className="rounded-2xl card-shadow p-4 flex items-center gap-3.5"
      style={{ background: "var(--card)", border: "1px solid var(--line)" }}
    >
      <div className="w-11 h-11 rounded-full shrink-0 animate-pulse" style={{ background: "var(--line)" }} />
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <div className="h-3.5 w-2/3 rounded animate-pulse" style={{ background: "var(--line)" }} />
        <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "var(--line)" }} />
        <div className="h-2.5 w-3/4 rounded animate-pulse" style={{ background: "var(--line)" }} />
      </div>
      <div className="h-6 w-14 rounded-full shrink-0 animate-pulse" style={{ background: "var(--line)" }} />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="pt-2">
      <PageHeader title="周邊停車" subtitle="距大溪老街由近到遠・每分鐘更新" />
      <div className="px-5 flex flex-col gap-3 pb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <LotSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
