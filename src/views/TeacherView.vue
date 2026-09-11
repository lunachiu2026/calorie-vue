<script setup>
import { RouterLink } from 'vue-router'
import { nutritionists } from '../data/nutritionists.js'

</script>

<template>
  <main class="booking-container teacher-page">
    <section class="left-panel">
      <h1 class="section-title">專業營養師一對一諮詢</h1>
      <p class="subtitle">客製化飲食計畫，由權威臨床與運動營養師線上線下指導</p>

      <p class="feature-notice">營養師資料為展示內容；學經歷與服務資訊待本人確認，預約為意向登記。</p>
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
              :to="{ name: 'teacher-detail', params: { id: nutritionist.id } }"
              class="submit-btn"
            >
              查看介紹
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
    align-items: flex-start;
    flex-direction: row;
    gap: 14px; padding: 18px;
  }

  .teacher-page .teacher-avatar {
    flex: 0 0 76px; width: 76px;
    height: 96px;
  }

  .teacher-page .card-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
.teacher-page .card-info { min-width: 0; }
.teacher-page .price, .teacher-page .tag { color: #365d46; }
.teacher-page .reviews { color: #657169; }
@media (max-width: 560px) {
  .teacher-page { padding-top: 26px; }
  .teacher-page .section-title { font-size: 25px; }
  .teacher-page .card-header h2 { font-size: 18px; }
  .teacher-page .title-tag { display: block; margin-top: 4px; }
  .teacher-page .submit-btn { padding: 12px 8px; font-size: 15px; }
  .teacher-page .tags { flex-wrap: wrap; }
}
</style>
