<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotFoundView from './NotFoundView.vue'
const route = useRoute()
const page = computed(() => route.params.page)
const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL || '').trim()
const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
</script>
<template><main v-if="['contact','sources','privacy'].includes(page)" class="feature-page information-page"><RouterLink class="feature-link" to="/">← 返回首頁</RouterLink>
<section v-if="page === 'contact'" class="feature-card"><h1>聯絡我們</h1><p>若有網站操作、資料更正或個人資料相關問題，請透過本站公開的聯絡管道提出。</p><template v-if="emailValid"><h2>電子郵件</h2><a class="feature-link" :href="'mailto:' + contactEmail">{{ contactEmail }}</a></template><p v-else class="feature-notice">正式聯絡信箱尚未公布。請先向提供本網站的管理者聯繫；此頁不會代為送出訊息。</p><p>諮詢意向登記不代表已聯絡到營養師，也不代表已確認時段。</p></section>
<section v-else-if="page === 'sources'" class="feature-card"><h1>資料來源與使用說明</h1><h2>食物營養資料</h2><p>依專案匯入紀錄，新增的 160 筆食物資料取自衛生福利部食品藥物管理署食品營養成分資料集，於 2026 年 9 月 8、9 日下載，以每 100 公克含量換算。</p><a class="feature-link" href="https://data.gov.tw/dataset/8543" target="_blank" rel="noopener noreferrer">食品營養成分資料集 ↗</a><a class="feature-link" href="https://data.gov.tw/license" target="_blank" rel="noopener noreferrer">政府資料開放授權條款 ↗</a><p>原有 81 筆食物資料尚未標示來源，不能視為全部均來自食藥署。烹調與份量差異會影響估算結果。</p><h2>營養師、餐點與場館</h2><p>營養師人物、照片、評分與價格為展示內容，正式學經歷及服務資訊待確認。推薦餐點的圖片、評分及營養數值不等同餐廳實際商品資料。場館設施、價格與營業資訊請以各場館公告為準。</p><h2>計算用途</h2><p>熱量、BMI 與體重趨勢用於個人紀錄及參考，不能取代個別營養諮詢或診斷。</p></section>
<section v-else class="feature-card"><h1>隱私政策與資料使用說明</h1><p class="feature-notice">此頁說明目前網站的資料處理方式；正式營運者與聯絡管道尚待補齊。</p><h2>儲存哪些資料</h2><p>會員模式會儲存帳號、聯絡資料、身體評估、飲食與體重紀錄，以及您提交的諮詢意向日期、營養師與聯絡資料。這些資料用於登入、呈現個人紀錄與查閱登記內容。</p><h2>會員與展示模式</h2><p>一般會員資料儲存在網站後端資料庫，登入使用工作階段 Cookie。Demo 展示資料保存在目前瀏覽器的本機儲存空間；清除網站資料後可能無法復原。請勿在 Demo 輸入真實敏感資料。</p><h2>諮詢意向登記</h2><p>目前只儲存登記資料供會員查看，不會自動寄信、通知營養師、付款或成立正式預約。</p><h2>查看與更正</h2><p>您可以在會員中心查看及編輯個人資料，管理飲食與體重紀錄；其他資料處理需求請聯繫網站管理者。</p><RouterLink class="feature-link" to="/about/contact">查看聯絡方式</RouterLink><h2>外部網站</h2><p>前往餐廳、場館或資料來源網站後，其資料處理方式依該網站說明。</p></section></main><NotFoundView v-else /></template>