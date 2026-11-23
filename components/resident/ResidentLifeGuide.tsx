"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GarbageTruckMap from "@/components/GarbageTruckMap";
import SkinGuide from "@/components/skin/SkinGuide";
import SkinSheet from "@/components/skin/SkinSheet";
import styles from "@/components/skin/Skin.module.css";
import { RESIDENT_NAV } from "@/lib/residentNav";

// 垃圾清運 has no page of its own; it opens the live truck map as a sheet,
// addressable as /resident?open=garbage so the menu, finder and hero can
// link to it.
export default function ResidentLifeGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const garbageOpen = params.get("open") === "garbage";
  const closeGarbage = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return (
    <>
      <SkinGuide groups={RESIDENT_NAV} label="生活指南分類" />
      {garbageOpen ? (
        <SkinSheet title="垃圾車即時位置" eyebrow={<span className={styles.badge} data-tone="main">垃圾清運</span>} wide onClose={closeGarbage}>
          <GarbageTruckMap />
        </SkinSheet>
      ) : null}
    </>
  );
}
