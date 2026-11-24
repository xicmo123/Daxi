import BottomNav from "@/components/BottomNav";
import PullToRefresh from "@/components/PullToRefresh";
import TouristSkinHeader from "@/components/tourist/TouristSkinHeader";
import TouristFooter from "@/components/tourist/TouristFooter";

// 嗨大溪 wears the same Visit Jeju-style skin as 我是大溪人
// (components/skin/Skin.module.css, tokens in app/globals.css under
// .daxi-skin): sticky header + full menu, site-map footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PullToRefresh />
      <div className="daxi-skin app-screen relative z-10 flex-1">
        <div className="w-full">
          <TouristSkinHeader />
          {children}
          <TouristFooter />
        </div>
      </div>
      <BottomNav />
    </>
  );
}
