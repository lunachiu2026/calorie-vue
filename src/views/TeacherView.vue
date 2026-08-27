<script setup>
import { RouterLink } from 'vue-router'
import img1 from '../assets/teacher-01.png'
import img2 from '../assets/teacher-02.png'

const nutritionists = [
  {
    name: '陳冠宇',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    priceGray: false,
    specialty: '專長：減重體態雕塑、運動營養學',
    rating: '⭐ 4.9',
    reviews: '(128 則真實學員好評)',
    image: img1
  },
  {
    name: '林佳蓉',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    priceGray: true,
    specialty: '專長：三高飲食調理、孕期母嬰營養',
    rating: '⭐ 4.8',
    reviews: '(94 則真實學員好評)',
    image: img2
  }
]
</script>

<template>
  <div class="booking-container">
    <div class="left-panel">
      <h2 class="section-title">🍊 專業營養師一對一諮詢</h2>
      <p class="subtitle">客製化飲食計畫，由權威臨床與運動營養師線上線下指導</p>

      <div v-for="(n, i) in nutritionists" :key="i" class="card" :class="{ active: i === 0 }">
        <img :src="n.image" :alt="`${n.name} ${n.title}`" class="teacher-avatar" />
        <div class="card-info">
          <div class="card-header">
            <h3>{{ n.name }} <span class="title-tag">{{ n.title }}</span></h3>
            <span class="price" :class="{ gray: n.priceGray }">{{ n.price }}</span>
          </div>
          <p class="specialty">{{ n.specialty }}</p>
          <div class="rating">{{ n.rating }} <span class="reviews">{{ n.reviews }}</span></div>
          <div class="tags">
            <span class="tag green">可視訊諮詢</span>
            <span class="tag green">送一週菜單</span>
          </div>
          <RouterLink :to="{ name: 'teacher-booking', query: { teacher: n.name } }" class="submit-btn">確認並線上預約</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
