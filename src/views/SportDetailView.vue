<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { locationData, mapsUrl } from '../data/locations'

const props = defineProps({
  category: { type: String, required: true }
})

const data = computed(() => locationData[props.category] || null)
</script>

<template>
  <main class="location-page-container">
    <div class="back-nav">
      <RouterLink to="/sport" class="btn-back">&#8592; 返回運動空間選擇</RouterLink>
    </div>

    <template v-if="data">
      <h1 class="page-title">{{ data.title }}</h1>
      <div class="place-list">
        <div v-for="place in data.places" :key="place.name" class="place-card">
          <h2 class="place-name">{{ place.name }}</h2>
          <h3>{{ place.address }}</h3>
          <span class="tag">{{ place.tag }}</span>
          <a
            :href="mapsUrl(place)"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-map-link"
          >
            📍 Google 地圖導航
          </a>
        </div>
      </div>
    </template>

    <p v-else class="empty-meal">找不到該運動類別的資料。</p>
  </main>
</template>

<style scoped>
.location-page-container {
  max-width: 880px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  margin: 16px 0 24px;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.place-card {
  border: 1px solid #e3e3e3;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.place-card h3 {
  margin: 0;
  font-weight: 400;
  color: #555;
}

.tag {
  align-self: flex-start;
  background: #eaf7ef;
  color: #2e9e5b;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 13px;
}

.btn-map-link {
  align-self: flex-start;
  background: #AAC0AF;
  color: #fff;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
}

.btn-map-link:hover {
  background: #FAAC9A;
}
</style>
