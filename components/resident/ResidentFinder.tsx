import SkinFinder from "@/components/skin/SkinFinder";
import { RESIDENT_SHORTCUTS, allResidentItems } from "@/lib/residentNav";

export default function ResidentFinder() {
  return (
    <SkinFinder
      items={allResidentItems()}
      shortcuts={RESIDENT_SHORTCUTS}
      title="常用居民服務"
      placeholder="搜尋垃圾車、停水或診所"
      label="搜尋居民服務"
    />
  );
}
