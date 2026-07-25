"use client";

import { motion } from "framer-motion";

// A little car looping a track — used for "still loading / nothing here yet"
// states so blank screens feel intentional instead of broken.
function CircleCarIllustration() {
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <circle cx="56" cy="56" r="40" stroke="var(--line)" strokeWidth="2" strokeDasharray="4 7" />
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
        style={{ originX: "56px", originY: "56px" }}
      >
        <g transform="translate(56 16)">
          <rect x="-10" y="-6" width="20" height="11" rx="4" fill="var(--river-teal)" />
          <circle cx="-5" cy="6" r="3" fill="var(--ink)" />
          <circle cx="5" cy="6" r="3" fill="var(--ink)" />
        </g>
      </motion.g>
    </svg>
  );
}

// A slightly confused mascot blob — used for genuine "nothing to show /
// something went wrong" states.
function ConfusedMascotIllustration() {
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <motion.g
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "56px", originY: "56px" }}
      >
        <ellipse cx="56" cy="60" rx="34" ry="30" fill="var(--accent)" opacity="0.16" />
        <circle cx="45" cy="54" r="4.2" fill="var(--ink)" />
        <circle cx="70" cy="54" r="4.2" fill="var(--ink)" />
        <path d="M46 74q10 8 20 0" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M30 34q6-10 12-2" stroke="var(--ink-soft)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </motion.g>
    </svg>
  );
}

export default function EmptyState({
  variant = "mascot",
  title,
  subtitle,
  action,
}: {
  variant?: "car" | "mascot";
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-2 py-10 text-center"
    >
      {variant === "car" ? <CircleCarIllustration /> : <ConfusedMascotIllustration />}
      <div className="mt-1 text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
        {title}
      </div>
      {subtitle ? (
        <div className="max-w-[240px] text-[12px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {subtitle}
        </div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </motion.div>
  );
}
