"use client";

import type { ReactNode } from "react";
import PageHeader, { type PageTint } from "./PageHeader";
import { useT, type DictKey } from "@/lib/i18n";

// Translated wrapper around PageHeader so server-component pages can pass
// dictionary keys instead of hardcoded Chinese strings, without themselves
// becoming client components.
export default function PageHeaderT({
  eyebrowKey,
  titleKey,
  subtitleKey,
  subtitleVars,
  right,
  tint,
}: {
  eyebrowKey?: DictKey;
  titleKey: DictKey;
  subtitleKey?: DictKey;
  subtitleVars?: Record<string, string>;
  right?: ReactNode;
  tint?: PageTint;
}) {
  const t = useT();
  return (
    <PageHeader
      eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
      title={t(titleKey)}
      subtitle={subtitleKey ? t(subtitleKey, subtitleVars) : undefined}
      right={right}
      tint={tint}
    />
  );
}
