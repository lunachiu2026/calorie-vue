# 卡路里智慧管家

以 Vue 3 與 Vite 製作的飲食熱量管理網站，提供食物熱量估算、每日飲食紀錄、會員資料、BMI 與每日需求熱量評估，以及運動場所與營養師預約資訊。

## 線上網站

[GitHub Pages](https://lunachiu2026.github.io/calorie-vue/)

## 主要功能

- 搜尋食物並依重量估算熱量、蛋白質、脂肪與碳水化合物。
- 將食物加入早餐、午餐或晚餐清單。
- 選擇紀錄日期並儲存每日飲食。
- 顯示每日總熱量、營養素與熱量赤字／超標狀態。
- 超出個人熱量目標時，圓形進度顯示為鮮紅色。
- 會員登入、註冊與個人資料編輯。
- BMI、體位狀態與每日估算維持熱量評估。
- 個人熱量目標同步至首頁與導覽列。
- 會員中心可依日期、近一週或近一個月查看紀錄。
- 每天只顯示最後儲存的一筆熱量紀錄。
- 運動場所分類與詳細資訊。
- 營養師介紹與預約頁面。
- 響應式版面，可在桌面與手機瀏覽。

## 使用技術

- Vue 3
- Vue Router 4
- Vite 5
- PHP 8.2
- MySQL / MariaDB
- Bootstrap Icons
- CSS
- MySQL（會員資料與飲食紀錄）
- GitHub Actions
- GitHub Pages

## 本機執行

建議使用 Node.js 20 與 XAMPP，並先從 XAMPP 控制台啟動 MySQL。

第一次執行時：

1. 在 `backend/config/local.php` 的 `password` 填入本機 MySQL `root` 密碼。
2. 執行 `npm run db:setup` 建立資料庫與資料表。
3. 開啟終端機啟動 PHP API：

```bash
npm run api
```

API 預設位於 `http://127.0.0.1:8000/api/`。這個終端機需保持執行。

另開一個終端機安裝套件並啟動 Vue：

```bash
npm install
npm run dev
```

開發伺服器預設位於：

```text
http://localhost:5173/calorie-vue/
```

## 建置與預覽

建立正式版本：

```bash
npm run build
```

在本機預覽正式版本：

```bash
npm run preview
```

正式檔案會輸出至 `dist/`。

## 會員 API

目前已提供以下 PHP API：

- `POST /api/register.php`
- `POST /api/login.php`
- `POST /api/logout.php`
- `GET /api/me.php`
- `GET/PATCH /api/profile.php`
- `GET /api/foods.php`（公開食物清單，讀取 MySQL foods 表）
- `GET/PUT/DELETE /api/records.php`（僅操作目前登入會員的飲食紀錄）

密碼使用 PHP `password_hash()` 儲存，登入狀態使用 HttpOnly Session Cookie，修改資料時會驗證 CSRF Token。第一次使用請從註冊頁建立帳號。

## BMI 與每日熱量評估

會員中心可輸入以下資料：

- 身高
- 體重
- 生理性別
- 出生日期
- 日常活動程度

BMI 使用公式：

```text
BMI = 體重（kg）÷ 身高（m）²
```

成人體位分級採用台灣衛生福利部國民健康署標準：

- BMI 小於 18.5：體重過輕
- BMI 18.5 至未滿 24：正常範圍
- BMI 24 至未滿 27：體重過重
- BMI 27 以上：肥胖

靜息能量使用 Mifflin–St Jeor 公式估算，再依活動程度計算每日維持熱量。結果會成為會員的每日熱量目標，並同步用於首頁進度圈、熱量赤字與超標判斷。

參考資料：

- [衛生福利部國民健康署：關於過重與肥胖](https://www.hpa.gov.tw/Pages/List.aspx?nodeid=1757)
- [Mifflin–St Jeor 原始研究（PubMed）](https://pubmed.ncbi.nlm.nih.gov/2305711/)
- [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp)

> BMI 與熱量結果僅供一般成人自我管理參考，不是醫療診斷，也不適用於未滿 18 歲、孕期、哺乳期或特殊疾病狀況。

## 資料儲存方式

目前後端串接範圍：

- 註冊帳號、登入狀態、會員資料、BMI 與每日熱量目標儲存在 MySQL。
- 已儲存的飲食清單與歷史紀錄存於 MySQL，依 Session 會員 ID 隔離；同一會員同一天再次儲存會更新整天內容。
- 首頁會載入所選日期的已儲存清單；切換日期前請先儲存目前內容。
- 舊版 Local Storage 紀錄保留在原瀏覽器，但不再讀取，也不自動匯入，因為無法確認所屬會員。
- 營養師預約目前尚未送到後端。

### 查看會員的食物與熱量

執行一次 `npm run db:setup` 即可新增 `meal_records` 與 `meal_items` 資料表，不會清除既有會員。
在 phpMyAdmin 選擇 `calorie_db`，開啟 SQL 分頁，貼上 `backend/database/view-meals.sql` 的查詢，即可查看帳號、日期、餐別、食物、重量、熱量及營養素。這是資料庫管理者的查詢方式，目前未新增網站管理後台。

API 不接受前端指定會員 ID，寫入與刪除皆驗證 CSRF Token。熱量與營養素由後端依 MySQL `foods` 表重新計算後保存。首頁也讀取同一份資料庫清單。

### 飲食紀錄測試

先啟動 MySQL 並執行 `npm run db:setup`，再執行 `node tests/records.mjs`。
測試會啟動獨立 PHP API、建立兩個隨機測試帳號，驗證未登入拒絕、CSRF、輸入驗證、熱量計算、同日更新、跨帳號隔離與刪除，最後清除這兩個測試帳號及其紀錄。
PHP 預設使用 `C:\xampp\php\php.exe`，可透過 `PHP_BINARY` 環境變數指定。

手動驗證：登入 → 首頁加入白米飯 150 克 → 儲存 → 會員中心確認 195 kcal → 無痕視窗登入同帳號確認紀錄 → 換另一帳號確認紀錄不共用。

## 專案結構

```text
src/
├─ assets/          # 圖片與共用樣式
├─ components/      # 導覽列等共用元件
├─ data/            # 食物與地點資料
├─ router/          # Vue Router 路由設定
├─ views/           # 各頁面元件
├─ api.js           # PHP API 請求與 CSRF Token
├─ auth.js          # Session 會員與個人熱量狀態
├─ demo.js          # GitHub Pages 瀏覽器 Demo 資料層
├─ App.vue
└─ main.js

backend/
├─ api/             # PHP JSON API
├─ config/          # PDO 與本機資料庫設定
└─ database/        # MySQL schema
```

## GitHub Pages 部署

GitHub Pages 無法執行 PHP，因此線上版提供獨立的「一鍵進入 Demo」展示帳號。Demo 內含 7 天飲食紀錄、5 筆體重趨勢、會員資料及完整 241 筆食物；所有操作只保存在訪客瀏覽器的 `localStorage`，不會寫入正式 MySQL。登入頁的「重新載入範例資料」可恢復預設內容。

一般帳號的註冊、登入及跨裝置同步仍需 PHP/MySQL。正式上線時應部署到支援 PHP/MySQL 的主機，或另外部署 API 並設定 `VITE_API_BASE_URL`。

專案已設定 GitHub Actions。推送到 `main` 分支後，會自動執行：

1. 安裝套件。
2. 執行 `npm run build`。
3. 上傳 `dist/`。
4. 部署至 GitHub Pages。

推送修改：

```bash
git add .
git commit -m "更新網站功能"
git push
```

可在 GitHub 專案的 `Actions` 頁面查看部署狀態。


## 維護食物清單

在 phpMyAdmin 選擇 `calorie_db` → `foods`，即可新增或修改食物。四項營養素均以 100 克為基準；飲料也以克計，不是毫升。網站重新整理後載入最新清單。

初始化會匯入原有 81 筆及 160 筆食藥署資料，共 241 筆；其中最新增加優格 12 筆、早餐 16 筆、零食 16 筆與飲料 16 筆。重跑只補缺少名稱，不覆蓋既有資料。新增資料與授權、欄位對照請見 [FOOD-SOURCES.md](backend/database/FOOD-SOURCES.md)。

食物名稱以一般常用的「優格」顯示；搜尋「發酵乳」或「優酪乳」也能找到相同資料。

## 食物搜尋效能

首頁使用 `GET /api/foods.php?q=關鍵字&category=分類&after=上一頁游標`，每頁最多 20 筆，回傳 `hasMore` 與 `nextCursor`，捲至清單底部時自動繼續查詢（載入中不重複請求，失敗時可點選重試）。`meta=1` 另回傳分類與三筆推薦食物。輸入搜尋延遲 250 毫秒送出，過時回應不更新畫面。

儲存飲食時只依本次食物名稱查詢營養資料，使用既有名稱唯一索引。分類搜尋使用 `(category, id)` 索引；執行 `npm run db:setup` 可補上索引。關鍵字保留任意位置包含搜尋（LIKE），不保證一般索引可加速子字串比對；本次主要減少傳輸量與前端一次渲染的資料量，未做大規模負載測試。
