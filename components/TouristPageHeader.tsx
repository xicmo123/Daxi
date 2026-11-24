import type { ReactNode } from "react";
import type { PhotoCredit } from "@/lib/data";
import SkinPageHeader from "@/components/skin/SkinPageHeader";
import { TOURIST_NAV } from "@/lib/touristNav";

// Tourist sub-page masthead — the shared Jeju-style header (breadcrumb, big
// title, sibling-page pills, rounded photo banner) fed with the tourist map.
export default function TouristPageHeader({
  href,
  title,
  subtitle,
  photo,
  children,
}: {
  /** This page's own path — finds its menu group for the breadcrumb and tabs. */
  href: string;
  title: string;
  subtitle?: string;
  photo?: PhotoCredit;
  children?: ReactNode;
}) {
  return (
    <SkinPageHeader groups={TOURIST_NAV} root={{ name: "嗨大溪", href: "/" }} href={href} title={title} lead={subtitle} photo={photo}>
      {children}
    </SkinPageHeader>
  );
}
