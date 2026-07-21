import type { ReactNode } from "react";
import Image from "next/image";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="relative px-6 pt-10 pb-8 text-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/old-street-sketch-2.jpg"
          alt=""
          fill
          sizes="448px"
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
        />
        <div className="absolute inset-0" style={{ background: "var(--paper)", opacity: 0.62 }} />
      </div>
      <div className="relative">
        {eyebrow ? (
          <div
            className="text-[11px] font-normal tracking-[0.2em] uppercase mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-serif text-2xl font-bold tracking-wide" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        {subtitle ? (
          <div className="text-[13px] mt-2 font-medium" style={{ color: "var(--ink)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {right ? <div className="absolute right-6 top-10">{right}</div> : null}
    </div>
  );
}
