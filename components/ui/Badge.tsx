import type { HTMLAttributes } from "react";
import { badgeRecipe, cx, type BadgeTone } from "./styles";

export function Badge({
  tone,
  className,
  style,
  ...rest
}: { tone?: BadgeTone } & HTMLAttributes<HTMLSpanElement>) {
  const recipe = badgeRecipe(tone);
  return <span {...rest} className={cx(recipe.className, className)} style={{ ...recipe.style, ...style }} />;
}
