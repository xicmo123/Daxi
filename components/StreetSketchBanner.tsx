import Image from "next/image";

export default function StreetSketchBanner() {
  return (
    <div
      className="relative w-full h-16 overflow-hidden"
      style={{ background: "var(--paper)", borderTop: "1px solid var(--line)" }}
    >
      <Image
        src="/images/old-street-sketch.jpg"
        alt="大溪老街手繪速寫"
        fill
        sizes="448px"
        className="object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(250,249,246,0.12)" }} />
    </div>
  );
}
