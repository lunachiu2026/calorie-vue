<script setup>
const year = new Date().getFullYear()
</script>
<template><footer class="site-footer"><div><strong>卡路里 calorie</strong><p>從每一餐開始，認識自己的飲食與生活節奏。<br />記錄飲食、追蹤體重、探索運動與營養諮詢。</p></div><nav aria-label="頁尾導覽"><RouterLink to="/about/contact">聯絡我們</RouterLink><RouterLink to="/about/sources">資料來源</RouterLink><RouterLink to="/about/privacy">隱私政策</RouterLink></nav><small>© {{ year }} 卡路里智慧管家 · 健康生活紀錄網站</small></footer></template>