import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "服務條款｜大溪通",
  description: "大溪通的使用條款、資料來源限制與責任說明。",
};

const updatedAt = "2026-07-28";

export default function TermsPage() {
  return (
    <div className="pt-2">
      <PageHeader title="服務條款" subtitle={`最後更新：${updatedAt}`} tint="wood" />

      <main className="safe-page-x pb-24 pt-5 fade-in">
        <div className="rounded-2xl border px-5 py-5 text-[13px] leading-relaxed" style={{ background: "var(--card)", borderColor: "var(--line)", color: "var(--ink)" }}>
          <p>
            歡迎使用大溪通。使用本服務即表示你理解並同意以下條款。本服務由熱愛大溪的民間開發者維護，並非政府機關或官方單位。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">資訊僅供參考</h2>
          <p>
            活動、停車、交通、天氣、停水停電、道路施工、診所、AED 與商家資訊可能來自政府開放資料、第三方 API、商家或人工整理。實際狀況請以現場公告、官方網站或相關單位回覆為準。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">緊急狀況</h2>
          <p>
            本服務不是緊急通報或救援系統。遇到人身安全、醫療、火災、治安或其他緊急狀況，請立即撥打 110、119 或相關官方專線。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">優惠與預約</h2>
          <p>
            商家優惠、營業狀態與預約名額由商家或管理者維護。優惠是否可用、預約是否成立與現場服務內容，仍以商家確認為準。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">禁止事項</h2>
          <p>
            請勿嘗試未授權存取後台、偽造核銷碼、濫用預約功能、干擾服務運作，或以任何方式造成其他使用者、商家或服務維護者損害。
          </p>

          <h2 className="mt-5 mb-2 text-[15px] font-bold">聯絡方式</h2>
          <p>
            若發現資料錯誤、權利侵害或需要協助，請來信：
            <a href="mailto:xicmo123@gmail.com" className="font-semibold underline" style={{ color: "var(--daxi-red)" }}>
              xicmo123@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
