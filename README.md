# 大溪通 Daxi Journal

大溪通是桃園大溪的在地資訊 App/PWA，包含遊客導覽、居民生活資訊、商家自助後台與管理後台。

## 功能範圍

- 遊客端：活動、景點、商家、優惠券、停車、公車、即時影像與天氣路況。
- 居民端：區公所公告、停水停電、道路施工、垃圾清運、診所輪值、AED、居民服務連結。
- 商家端：營業時間、排隊狀態、完售狀態、寄放服務、優惠券設定與掃碼核銷。
- 管理端：景點/商家、活動輪播、居民公告、診所、路線、優惠券與商家帳號管理。

## 開發

```bash
npm install
npm run dev
```

開發伺服器預設使用：

```text
http://localhost:8475
```

## 驗證

```bash
npm run lint
npm run build
```

上架前兩個指令都必須通過。

## 必要環境變數

```bash
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
GOOGLE_MAPS_API_KEY=
CWA_API_KEY=
TDX_CLIENT_ID=
TDX_CLIENT_SECRET=
```

說明：

- `ADMIN_PASSWORD`：管理後台登入密碼。
- `ADMIN_SESSION_SECRET`：簽署 admin、merchant session 與優惠券核銷 token。正式環境必填，建議與 `ADMIN_PASSWORD` 分開。
- `GOOGLE_MAPS_API_KEY`：Google Places / Maps 相關資料。
- `CWA_API_KEY`：中央氣象署天氣資料。
- `TDX_CLIENT_ID` / `TDX_CLIENT_SECRET`：公車與運輸資料。

## 上架前檢查

- 隱私權政策與服務條款需保持線上可訪問，並與 App Store Connect / Google Play Console 填寫內容一致。
- App Store / Google Play 需揭露定位、預約聯絡資料、點擊紀錄、第三方資料來源與商家核銷流程。
- 需要提供審核帳號：管理後台與商家後台的測試登入資料。
- 商家正式營運前應改用完整帳號系統：密碼雜湊、登入失敗限制、重設密碼、停權與操作紀錄。
- JSON file store 適合 MVP；正式營運建議搬到資料庫並加上備份與併發寫入保護。

## 資料來源

本服務整合政府開放資料、Google Maps Places API、OpenStreetMap、中央氣象署、TDX 運輸資料與人工維護資料。即時資訊仍應以官方公告、現場狀況或商家回覆為準。
