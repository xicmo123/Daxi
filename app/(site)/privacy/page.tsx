import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "隱私權政策｜大溪通",
  description: "大溪通的資料收集、使用、保存與刪除說明。",
};

const updatedAt = "2026-07-28";

export default function PrivacyPage() {
  return (
    <div className="pt-2">
      <PageHeader title="隱私權政策" subtitle={`最後更新：${updatedAt}`} tint="river" />

      <main className="safe-page-x pb-24 pt-5 fade-in">
        <div className="rounded-2xl border px-5 py-5 text-[13px] leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink)" }}>
          <p>
            大溪通提供桃園大溪周邊活動、景點、停車、交通、居民生活資訊與商家優惠。本政策說明我們在提供服務時可能收集、使用與保存的資料。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">我們會收集的資料</h2>
          <p>
            使用者主動填寫的資料，例如預約姓名、電話、人數、備註、居民模式中的暱稱或常用地點。這些資料用於完成預約、顯示個人化資訊或提供使用者設定。
          </p>
          <p className="mt-2">
            裝置端資料，例如收藏、身份模式、倒垃圾提醒點，主要儲存在使用者裝置的 localStorage。移除瀏覽資料或重新安裝 App 可能會清除這些設定。
          </p>
          <p className="mt-2">
            使用紀錄，例如首頁點擊的景點、商家、優惠券或功能入口，用於了解功能使用狀況與改善內容排序。這些紀錄不會用於第三方廣告追蹤。
          </p>
          <p className="mt-2">
            位置資料僅在使用者主動允許時，用於地圖定位、尋找附近停車、AED 或交通資訊。拒絕定位權限仍可使用大部分功能。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">第三方資料來源</h2>
          <p>
            本服務會讀取政府開放資料、Google Maps Places API、OpenStreetMap、中央氣象署、TDX 運輸資料等第三方資料來源。第三方服務可能依其政策處理請求資訊。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">資料保存與刪除</h2>
          <p>
            預約、核銷與點擊紀錄會保存在系統資料檔中，以便商家服務、營運查詢與問題排除。若需查詢、更正或刪除與你相關的資料，請透過下方 email 聯絡我們。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">聯絡方式</h2>
          <p>
            若你對資料使用、刪除或隱私權政策有任何問題，請來信：
            <a href="mailto:xicmo123@gmail.com" className="font-semibold underline" style={{ color: "var(--daxi-red)" }}>
              xicmo123@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
