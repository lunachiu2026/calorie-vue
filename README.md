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
- Bootstrap Icons
- CSS
- Local Storage
- GitHub Actions
- GitHub Pages

## 本機執行

建議使用 Node.js 20。

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

## Demo 登入

```text
帳號：admin
密碼：1234
```

也可以在登入頁建立新的本機會員帳號。

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

目前專案沒有後端伺服器或資料庫，以下資料皆儲存在瀏覽器的 Local Storage：

- 註冊帳號與登入狀態
- 會員資料
- BMI 與每日熱量目標
- 飲食清單與歷史紀錄

清除瀏覽器網站資料、更換瀏覽器或更換裝置後，資料不會自動同步。

> 本專案的本機帳號機制僅供前端展示，密碼未經後端雜湊與安全驗證，不可直接用於正式環境。正式上線時應改用後端 API、資料庫、密碼雜湊、身分驗證與權限控管。

## 專案結構

```text
src/
├─ assets/          # 圖片與共用樣式
├─ components/      # 導覽列等共用元件
├─ data/            # 食物與地點資料
├─ router/          # Vue Router 路由設定
├─ views/           # 各頁面元件
├─ auth.js          # 本機會員與個人熱量狀態
├─ App.vue
└─ main.js
```

## GitHub Pages 部署

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

