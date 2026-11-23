import type { ResidentIconKey } from "@/lib/residentNav";

// Line icons for the resident feature map, drawn on one 24px grid and one
// stroke weight so the menu, tabs and finder read as a single set.
const PATHS: Record<ResidentIconKey, string[]> = {
  outage: ["M13 3 5.5 13.5h4.8L11 21l7.5-10.5h-4.8L13 3Z"],
  garbage: ["M4 9h11v8H4z", "M15 11h3l2 3v3h-5", "M7.5 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z", "M7 12.5h5"],
  roadworks: ["M5 19h14", "M7.5 19 10 7h4l2.5 12", "M9 12h6", "M8.2 15.5h7.6"],
  announcement: ["M6.5 20.2V5.8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14.4", "M4.8 20.2h14.4", "M9.2 8h5.6", "M9.2 11.2h5.6", "M9.2 14.4h3.4"],
  bus: ["M6 17V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v11", "M6 11h12", "M6 17h12", "M8 17v3m8-3v3", "M9 14h.01m6 0h.01"],
  camera: ["M4 7.5h11v9H4z", "m15 10.5 5-2.5v8l-5-2.5", "M7 11h.01"],
  clinic: ["M12 7.5v9M7.5 12h9", "M4.5 8.5a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4z"],
  aed: ["M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z", "m12.6 9.5-2 3.3h3l-2 3.2"],
  phone: ["M6.5 4.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z"],
  bulletin: ["M4.5 5.5h15v11h-15z", "M8 20h8", "M12 16.5V20", "M7.5 9h6M7.5 12.5h9"],
  event: ["M5 5.5h14v14H5z", "M9 3.5v4M15 3.5v4M5 10h14", "M9 14h2"],
  report: ["M4.5 12c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5c-1.2 0-2.3-.3-3.3-.8L4.5 20l1.3-3.7C5 15.1 4.5 13.6 4.5 12Z", "M12 8.5v4", "M12 15.5h.01"],
  link: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"],
  profile: ["M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z", "M5.2 19.4a6.8 6.8 0 0 1 13.6 0"],
};

export default function ResidentIcon({ name, size = 22 }: { name: ResidentIconKey; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
