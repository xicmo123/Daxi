"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ReactNode } from "react";

export default function ParallaxHero({
  src,
  alt,
  children,
}: {
  src: string;
  alt: string;
  children?: ReactNode;
}) {
  const imgWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      if (imgWrapRef.current) {
        imgWrapRef.current.style.transform = `translate3d(0, ${Math.min(y * 0.32, 140)}px, 0)`;
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative h-[58vh] min-h-[400px] max-h-[560px] overflow-hidden">
      <div ref={imgWrapRef} className="absolute inset-x-0 -top-[12%] -bottom-[12%] will-change-transform">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "saturate(0.85) contrast(0.97)" }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,13,10,0.4) 0%, rgba(15,13,10,0.05) 28%, rgba(15,13,10,0.1) 52%, rgba(15,13,10,0.85) 100%)",
        }}
      />
      {children}
    </div>
  );
}
