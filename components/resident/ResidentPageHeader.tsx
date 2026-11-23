import type { ComponentProps } from "react";
import SkinPageHeader from "@/components/skin/SkinPageHeader";
import { RESIDENT_NAV } from "@/lib/residentNav";

type Props = Omit<ComponentProps<typeof SkinPageHeader>, "groups" | "root">;

export default function ResidentPageHeader(props: Props) {
  return <SkinPageHeader {...props} groups={RESIDENT_NAV} root={{ name: "我是大溪人", href: "/resident" }} />;
}
