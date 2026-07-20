import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  美食: <path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M18 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" />,
  景點: (
    <>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </>
  ),
  市集: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v10h16V9" />
      <path d="M9 19v-5h6v5" />
    </>
  ),
  event: <path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z" />,
};

export default function PlaceholderIcon({ kind }: { kind: "美食" | "景點" | "市集" | "event" }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        width="34"
        height="34"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1"
      >
        {paths[kind]}
      </svg>
    </div>
  );
}
