import SkinFinder from "@/components/skin/SkinFinder";
import { RESIDENT_HASHTAGS, allResidentItems } from "@/lib/residentNav";

export default function ResidentFinder() {
  return (
    <SkinFinder
      items={allResidentItems()}
      hashtags={RESIDENT_HASHTAGS}
      placeholder="今天要找什麼？例如：垃圾車、停水"
      label="搜尋居民服務"
    />
  );
}
