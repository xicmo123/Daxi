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
npm test
npm run build
```

三個指令都必須通過，`.github/workflows/ci.yml` 會在每次 push / PR 自動跑一次。

測試只涵蓋 `lib/` 底下的純邏輯（距離標籤、外部連結改寫、session 驗證）— 也就是會安靜壞掉、壞掉又看不出來的那些規則。

## 部署

正式站由 PM2 管理，更新流程：

```bash
npm run build && npx pm2 restart daxi --update-env
```

## 資料備份

`data/` 裡的商家通行碼、預約、核銷紀錄都不在 git 裡，所以 git 不是它們的備份。

```bash
DAXI_BACKUP_DIR=/Volumes/外接碟/daxi-backups npm run backup:data
```

建議用 crontab 每天跑一次，並且 `DAXI_BACKUP_DIR` 要指向**不同顆硬碟**。還原：停掉服務、`tar -xzf <備份檔> -C .`、重新啟動。

## 推播設定

`lib/pushSend.ts` 走 Firebase Cloud Messaging HTTP v1（Android 原生、iOS 轉 APNs）。沒設定憑證時後台仍可用，只是統計對象、不實際送出。

```bash
FCM_PROJECT_ID=
FCM_CLIENT_EMAIL=
FCM_PRIVATE_KEY=
```

還需要：

1. Firebase 專案，並上傳 APNs Key（Apple Developer → Keys）。
2. Xcode 開啟 App ID 的 **Push Notifications** capability。
3. 後台在「大溪人管理 → 推播通知」發送。

## 深層連結設定

分享出去的網址要能開回 App，需要兩個環境變數，缺少時對應的 `.well-known` 路由會回 503：

```bash
APPLE_TEAM_ID=            # Apple Developer → Membership
ANDROID_CERT_FINGERPRINT= # Play Console → 應用程式簽署金鑰憑證的 SHA-256（不是本機 debug keystore）
```

還需要在 Xcode 開啟 App ID 的 **Associated Domains** capability。

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
  目前已有：雜湊、失敗鎖定、停權、操作紀錄、session 到期與強制登出；**仍缺**每商家獨立帳號與重設密碼流程。
- JSON file store 適合 MVP；正式營運建議搬到資料庫並加上備份與併發寫入保護。
- **服務仍跑在單一台 Mac 上**（PM2）。這台機器停電、換 IP 或重開機，App Store 上的 App 就只剩離線頁。
  上架前應搬到雲端主機，這是目前最大的單點風險。

## 資料來源

本服務整合政府開放資料、Google Maps Places API、OpenStreetMap、中央氣象署、TDX 運輸資料與人工維護資料。即時資訊仍應以官方公告、現場狀況或商家回覆為準。
