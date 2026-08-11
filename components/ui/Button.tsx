import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ComponentProps } from "react";
import { buttonRecipe, cx, type Size, type Tone } from "./styles";

type Shared = { tone?: Tone; size?: Size; fullWidth?: boolean };

// No "use client" on purpose — these render fine inside a Server Component
// as long as no handler is passed, and get pulled into the client bundle
// automatically when imported by one.
export function Button({
  tone,
  size,
  fullWidth,
  className,
  style,
  ...rest
}: Shared & ButtonHTMLAttributes<HTMLButtonElement>) {
  const recipe = buttonRecipe(tone, size, fullWidth);
  return <button {...rest} className={cx(recipe.className, className)} style={{ ...recipe.style, ...style }} />;
}

// Internal navigation. Same look as Button, but a real <a> so long-press,
// middle-click and the native context menu all behave.
export function ButtonLink({
  tone,
  size,
  fullWidth,
  className,
  style,
  ...rest
}: Shared & ComponentProps<typeof Link>) {
  const recipe = buttonRecipe(tone, size, fullWidth);
  return <Link {...rest} className={cx(recipe.className, className)} style={{ ...recipe.style, ...(style as CSSProperties) }} />;
}

// External links and tel:/mailto: — never routed through next/link.
export function ButtonAnchor({
  tone,
  size,
  fullWidth,
  className,
  style,
  ...rest
}: Shared & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const recipe = buttonRecipe(tone, size, fullWidth);
  return <a {...rest} className={cx(recipe.className, className)} style={{ ...recipe.style, ...style }} />;
}
