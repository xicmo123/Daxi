export default function ResidentTemplate({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-[fade-in_180ms_ease-out]">{children}</div>;
}
