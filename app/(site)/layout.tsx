import BottomNav from "@/components/BottomNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-1 pb-20">
        <div
          className="mx-auto w-full max-w-md md:border-x"
          style={{ background: "var(--paper)", borderColor: "var(--line)" }}
        >
          {children}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
