<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { findNutritionist } from '../data/nutritionists.js'
import NotFoundView from './NotFoundView.vue'
const route = useRoute()
const person = computed(() => findNutritionist(route.params.id))
</script>
<template>
  <main v-if="person" class="feature-page">
    <RouterLink to="/teacher" class="feature-link">← 所有營養師</RouterLink>
    <section class="feature-card specialist-header">
      <img :src="person.image" :alt="person.name" />
      <div><p class="feature-eyebrow">認識您的營養諮詢夥伴</p><h1>{{ person.name }} <small>{{ person.title }}</small></h1><p>{{ person.specialty }}</p><strong>{{ person.price }}（展示價格）</strong><p class="feature-notice">展示人物資料，資格、價格及服務內容尚待確認；目前可登記諮詢意向，尚未開放正式預約。</p><RouterLink class="feature-button" :to="{ name: 'teacher-booking', query: { teacher: person.id } }">登記諮詢意向</RouterLink></div>
    </section>
    <div class="feature-columns">
      <section class="feature-card"><h2>學經歷與專業資格</h2><dl class="feature-facts"><dt>服務方向</dt><dd>{{ person.specialty.replace('專長：', '') }}</dd><dt>學歷與證照</dt><dd>待本人提供與核實</dd><dt>任職經歷與年資</dt><dd>待本人提供與核實</dd></dl><p>正式服務前，請確認營養師資格與完整經歷。本頁不以展示照片或評分作為資格證明。</p></section>
      <section class="feature-card"><h2>預計服務內容</h2><ul class="feature-list"><li>了解目前的飲食習慣與個人目標</li><li>一起檢視飲食紀錄與日常作息</li><li>討論可執行的飲食調整方向</li><li>確認後續追蹤方式</li></ul><p>實際內容、諮詢時長、線上或實體方式與費用，須另行確認。</p></section>
    </div>
    <section class="feature-card"><h2>諮詢流程</h2><ol class="feature-list"><li><strong>了解服務：</strong>閱讀專長、服務範圍與資格資訊。</li><li><strong>登記意向：</strong>登入後填寫希望諮詢的日期與聯絡資料。</li><li><strong>查看紀錄：</strong>到會員中心「我的預約」查閱意向登記。本系統不會自動通知營養師。</li><li><strong>正式確認：</strong>待服務開放並另行確認時段、費用後，才成立正式預約。</li></ol></section>
  </main><NotFoundView v-else />
</template>
