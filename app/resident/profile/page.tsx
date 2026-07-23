import PageHeader from "@/components/PageHeader";
import IdentitySwitchCard from "@/components/IdentitySwitchCard";

export default function ResidentProfilePage() {
  return (
    <div className="pt-2">
      <PageHeader title="我的" tint="river" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-4">
        <IdentitySwitchCard currentLabel="大溪人" switchToHref="/" switchToLabel="切換為遊客模式" switchToIdentity="tourist" />

        <div className="rounded-2xl border px-4 py-4 text-[12px] leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          大溪通・里民服務是給大溪居民的生活資訊入口，公告、停水停電等資料會持續更新。如發現資料有誤，歡迎透過「陳情 / 報修」回報。
        </div>
      </div>
    </div>
  );
}
