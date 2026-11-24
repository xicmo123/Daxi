import ResidentBottomNav from "@/components/ResidentBottomNav";
import GoogleTagManager from "@/components/GoogleTagManager";
import PullToRefresh from "@/components/PullToRefresh";
import ResidentHeader from "@/components/resident/ResidentHeader";
import ResidentFooter from "@/components/resident/ResidentFooter";

// 「我是大溪人」 has its own skin (components/resident/ResidentSkin.module.css,
// tokens in app/globals.css under .daxi-skin): a white Visit Jeju-style
// canvas with a sticky header + full menu on every page and a site-map footer.
export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PullToRefresh />
      <div className="daxi-skin app-screen relative z-10 flex-1">
        <div className="w-full">
          <ResidentHeader />
          {children}
          <ResidentFooter />
        </div>
      </div>
      <ResidentBottomNav />
      <GoogleTagManager />
    </>
  );
}
