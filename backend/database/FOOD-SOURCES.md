# 食物資料來源

`foods-additional.json` 共 100 筆，`foods-expanded.json` 共 60 筆，來源皆為衛生福利部食品藥物管理署「食品營養成分資料集」。第二批資料包含優格 12 筆、早餐 16 筆、零食 16 筆與飲料 16 筆，並已排除原有食物名稱。

- 資料集：https://data.gov.tw/dataset/8543
- 下載：https://data.fda.gov.tw/data/opendata/export/20/json
- 下載日期：第一批 2026-09-08；第二批 2026-09-09
- 授權：政府資料開放授權條款第 1 版（https://data.gov.tw/license）
- 原始檔：下載 ZIP 中的 `20_5.json`。

以「整合編號」整合各分析項，保留原始樣品名稱與編號。數值直接取自「每100克含量」：熱量 → calories（kcal）、粗蛋白 → protein_g、粗脂肪 → fat_g、總碳水化合物 → carbs_g（g）。使用「熱量」而非「修正熱量」。缺少四項中任何一項的樣品不納入，不把缺值當成零。分類依網站搜尋需求重新歸類。

保留生、熟、乾燥及加糖等狀態差異；內容物描述會在首頁選擇食物後顯示。飲料也以 100 克計算，不直接視為 100 毫升。

原有 `src/data/foods.json` 共 81 筆，保留原數值，來源未標示，不聲稱其來自食藥署。三份種子資料合計 241 筆。

執行 `npm run db:setup` 建表及匯入。若只需重跑種子資料，執行 `C:\xampp\php\php.exe backend/database/seed-foods.php`。匯入只補缺少的名稱，不覆蓋管理者修改過的數值。

`foods.aliases` 儲存替代搜尋名稱。官方「發酵乳」資料在網站上以常用的「優格」顯示，並保留「發酵乳、優酪乳」作為搜尋別名。

後續可在 phpMyAdmin 的 `calorie_db.foods` 新增或編輯食物，weight_g 必須為 100，四項營養值不可為負值。前端及後端都使用 foods 表；歷史飲食紀錄保存當時的營養快照。
