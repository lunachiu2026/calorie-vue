<script setup>
import { RouterLink } from 'vue-router'

// 匯入頭像圖片（圖片需與此 Vue 檔放在同目錄，或放置於 src/assets/）
import img1 from './11.jpg'
import img2 from './22.jpg'
import img3 from './33.jpg'
import img4 from './44.jpg'

// 營養師資料陣列
const nutritionists = [
  {
    id: 1,
    name: '李志宏',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    isGrayPrice: false,
    specialty: '減重體態雕塑',
    rating: '4.9',
    reviews: '211 則真實學員好評',
    tags: ['可視訊諮詢', '送一週菜單'],
    avatar: img1
  },
  {
    id: 2,
    name: '陳安妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    isGrayPrice: true,
    specialty: '三高飲食調理',
    rating: '4.8',
    reviews: '206 則真實學員好評',
    tags: ['可視訊諮詢', '送一週菜單'],
    avatar: img2
  },
  {
    id: 3,
    name: '陳家明',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    isGrayPrice: false,
    specialty: '運動營養學',
    rating: '4.9',
    reviews: '208 則真實學員好評',
    tags: ['可視訊諮詢', '送一週菜單'],
    avatar: img3
  },
  {
    id: 4,
    name: '陳姿妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    isGrayPrice: true,
    specialty: '孕期母嬰營養',
    rating: '4.8',
    reviews: '228 則真實學員好評',
    tags: ['可視訊諮詢', '送一週菜單'],
    avatar: img4
  }
]
</script>

<template>
  <div class="teacher-view">
    <!-- 導覽列 -->
    <header class="navbar">
      <div class="logo">
        <RouterLink to="/">
          <img src="../assets/logo.png" alt="卡路里 calorie" />
        </RouterLink>
      </div>
      <nav class="nav-links">
        <RouterLink to="/">首頁(熱量計算)</RouterLink>
        <RouterLink to="/sport">運動空間</RouterLink>
        <RouterLink to="/teacher" class="active">營養師介紹</RouterLink>
      </nav>
    </header>

    <!-- 主要預約內容區塊 -->
    <div class="booking-container">
      <div class="left-panel">
        <h2 class="section-title">🍊 專業營養師一對一諮詢</h2>
        <p class="subtitle">客製化飲食計畫，由權威臨床與運動營養師線上線下指導</p>

        <!-- 使用 v-for 迴圈動態渲染卡片 -->
        <div v-for="teacher in nutritionists" :key="teacher.id" class="card">
          <img :src="teacher.avatar" :alt="`${teacher.name} ${teacher.title}`" class="teacher-avatar" />
          <div class="card-info">
            <div class="card-header">
              <h3>
                {{ teacher.name }}
                <span class="title-tag">{{ teacher.title }}</span>
              </h3>
              <span :class="['price', { gray: teacher.isGrayPrice }]">
                {{ teacher.price }}
              </span>
            </div>

            <p class="specialty">專長：{{ teacher.specialty }}</p>

            <div class="rating">
              ⭐ {{ teacher.rating }}
              <span class="reviews">({{ teacher.reviews }})</span>
            </div>

            <div class="tags">
              <span v-for="(tag, idx) in teacher.tags" :key="idx" class="tag green">
                {{ tag }}
              </span>
            </div>

            <RouterLink to="/submit" class="submit-btn">
              確認並線上預約
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 將原本 goodhealth.css 內的樣式複製貼在下方，或直接用 @import 引入： */
@import './goodhealth.css';
</style>