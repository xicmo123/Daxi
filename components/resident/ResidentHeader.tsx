import SkinHeader from "@/components/skin/SkinHeader";
import { RESIDENT_NAV, RESIDENT_PROFILE_ITEM } from "@/lib/residentNav";
import { ABOUT_HREF } from "@/lib/aboutOwner";

export default function ResidentHeader() {
  return (
    <SkinHeader
      brand="我是大溪人"
      sub="大溪通 · 居民生活資訊"
      homeHref="/resident"
      gnb={[
        { href: "/resident/outages", label: "民生示警" },
        { href: "/resident/bus", label: "交通出行" },
        { href: "/resident/clinics", label: "醫療安全" },
        { href: "/resident/events", label: "社區生活" },
        { href: "/resident/services", label: "里民服務" },
      ]}
      groups={RESIDENT_NAV}
      menuExtras={[
        { href: RESIDENT_PROFILE_ITEM.href, label: RESIDENT_PROFILE_ITEM.label },
        { href: ABOUT_HREF, label: "關於" },
        { href: "tel:1999", label: "市民專線 1999" },
      ]}
      switchTo={{ identity: "tourist", href: "/", label: "遊客模式", menuLabel: "切換為遊客模式" }}
    />
  );
}
