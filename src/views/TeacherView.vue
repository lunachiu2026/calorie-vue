<script setup>
import { RouterLink } from 'vue-router'
import img1 from './teacher/11.jpg'
import img2 from './teacher/22.jpg'
import img3 from './teacher/33.jpg'
import img4 from './teacher/44.jpg'

const nutritionists = [
  {
    name: '李志宏',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    specialty: '專長：減重體態雕塑',
    rating: '⭐ 4.9',
    reviews: '(211 則真實學員好評)',
    image: img1
  },
  {
    name: '陳安妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    specialty: '專長：三高飲食調理',
    rating: '⭐ 4.8',
    reviews: '(206 則真實學員好評)',
    image: img2
  },
  {
    name: '陳家明',
    title: '營養師',
    price: '每堂 NT$ 1,500',
    specialty: '專長：運動營養學',
    rating: '⭐ 4.9',
    reviews: '(208 則真實學員好評)',
    image: img3
  },
  {
    name: '陳姿妤',
    title: '臨床營養師',
    price: '每堂 NT$ 1,600',
    specialty: '專長：孕期母嬰營養',
    rating: '⭐ 4.8',
    reviews: '(228 則真實學員好評)',
    image: img4
  }
]
</script>

<template>
  <main class="booking-container teacher-page">
    <section class="left-panel">
      <h1 class="section-title">專業營養師一對一諮詢</h1>
      <p class="subtitle">客製化飲食計畫，由權威臨床與運動營養師線上線下指導</p>

      <div class="teacher-grid">
        <article v-for="nutritionist in nutritionists" :key="nutritionist.name" class="card">
          <img
            :src="nutritionist.image"
            :alt="`${nutritionist.name} ${nutritionist.title}`"
            class="teacher-avatar"
          />

          <div class="card-info">
            <div class="card-header">
              <h2>
                {{ nutritionist.name }}
                <span class="title-tag">{{ nutritionist.title }}</span>
              </h2>
              <span class="price">{{ nutritionist.price }}</span>
            </div>

            <p class="specialty">{{ nutritionist.specialty }}</p>
            <div class="rating">
              {{ nutritionist.rating }}
              <span class="reviews">{{ nutritionist.reviews }}</span>
            </div>

            <div class="tags">
              <span class="tag green">可視訊諮詢</span>
              <span class="tag green">送一週菜單</span>
            </div>

            <RouterLink
              :to="{ name: 'teacher-booking', query: { teacher: nutritionist.name } }"
              class="submit-btn"
            >
              確認並線上預約
            </RouterLink>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.teacher-page {
  width: min(1100px, 92%);
  margin: 0 auto;
  padding-top: 42px;
  padding-bottom: 64px;
}

.teacher-page .left-panel {
  width: 100%;
}

.teacher-page .section-title {
  margin: 0 0 8px;
  font-size: clamp(27px, 4vw, 38px);
  text-align: center;
}

.teacher-page .subtitle {
  margin: 0 0 30px;
  text-align: center;
}

.teacher-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.teacher-page .card {
  height: 100%;
  margin: 0;
}

.teacher-page .teacher-avatar {
  flex: 0 0 150px;
  width: 150px;
  height: 180px;
  object-fit: cover;
}

.teacher-page .card-header h2 {
  margin: 0;
  font-size: 19px;
}

.teacher-page .submit-btn {
  margin-top: 18px;
  background: #AAC0AF;
}

.teacher-page .submit-btn:hover {
  background: #FAAC9A;
}

@media (max-width: 900px) {
  .teacher-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .teacher-page .card {
    align-items: center;
    flex-direction: column;
  }

  .teacher-page .teacher-avatar {
    width: 100%;
    height: 260px;
  }

  .teacher-page .card-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
