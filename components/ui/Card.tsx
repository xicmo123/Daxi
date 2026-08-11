import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cardRecipe, cx, type CardTone } from "./styles";

export function Card({
  tone,
  padded = true,
  className,
  style,
  ...rest
}: { tone?: CardTone; padded?: boolean } & HTMLAttributes<HTMLDivElement>) {
  const recipe = cardRecipe(tone);
  return (
    <div
      {...rest}
      className={cx(recipe.className, padded ? "px-4 py-4" : "", className)}
      style={{ ...recipe.style, ...style }}
    />
  );
}

// The small all-caps eyebrow used above nearly every section in the app
// (社區佈告欄, 聯絡資訊, 最近的 3 台 AED …). It was hand-rolled with slightly
// different tracking/size in a dozen places; this is the canonical one.
export function SectionLabel({
  children,
  icon,
  color,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  color?: string;
  className?: string;
}) {
  const style: CSSProperties = { color: color ?? "var(--ink-soft)" };
  return (
    <div className={cx("flex items-center gap-1.5", className)}>
      {icon ? <span aria-hidden>{icon}</span> : null}
      <div className="text-app-micro font-bold tracking-[0.18em] uppercase" style={style}>
        {children}
      </div>
    </div>
  );
}
