import SkinHeader from "@/components/skin/SkinHeader";
import { daxiWalkHref } from "@/lib/daxiWalk";
import { TOURIST_NAV } from "@/lib/touristNav";

export default function TouristSkinHeader() {
  return (
    <SkinHeader
      brand="大溪通"
      sub="桃園大溪旅遊指南"
      homeHref="/"
      gnb={[
        { href: "/spots", label: "景點", alsoActiveOn: ["/businesses"] },
        { href: daxiWalkHref, label: "老街散步" },
        { href: "/businesses", label: "美食" },
        { href: "/events", label: "活動" },
        { href: "/parking", label: "停車交通", alsoActiveOn: ["/bus"] },
        { href: "/weather", label: "天氣" },
      ]}
      groups={TOURIST_NAV}
      menuExtras={[{ href: "/search", label: "搜尋景點與店家" }]}
      switchTo={{ identity: "resident", href: "/resident", label: "我是大溪人", menuLabel: "切換為大溪人模式" }}
    />
  );
}
