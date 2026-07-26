import PageHeaderT from "@/components/PageHeaderT";
import IdentitySwitchCard from "@/components/IdentitySwitchCard";
import ResidentIdCard from "@/components/ResidentIdCard";
import ResidentAreaCard from "@/components/ResidentAreaCard";
import LanguageToggle from "@/components/LanguageToggle";

export default function ResidentProfilePage() {
  return (
    <div className="pt-2">
      <PageHeaderT titleKey="navProfile" tint="river" />

      <div className="safe-page-x pb-10 fade-in flex flex-col gap-4">
        <ResidentIdCard />
        <ResidentAreaCard />
        <IdentitySwitchCard currentLabelKey="residentLabel" switchToHref="/" switchToLabelKey="switchToTouristLabel" switchToIdentity="tourist" />
        <LanguageToggle />

        <div className="rounded-2xl border px-4 py-4 text-[12px] leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink-soft)" }}>
          大溪通・里民服務是給大溪居民的生活資訊入口，公告、停水停電等資料會持續更新。如發現資料有誤，歡迎透過「陳情 / 報修」回報。
        </div>
      </div>
    </div>
  );
}
