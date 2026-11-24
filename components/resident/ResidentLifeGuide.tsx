import SkinGuide from "@/components/skin/SkinGuide";
import { RESIDENT_NAV } from "@/lib/residentNav";

// 生活指南 tabs on the resident home. 垃圾清運 used to open here as a sheet
// (/resident?open=garbage); it is its own page now and the home redirects
// that old address.
export default function ResidentLifeGuide() {
  return <SkinGuide groups={RESIDENT_NAV} label="生活指南分類" />;
}
