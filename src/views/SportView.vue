<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { themes } from '../data/locations'

const track = ref(null)

const currentIndex = ref(0)
const visibleCount = ref(3)

const maxIndex = computed(() => Math.max(0, themes.length - visibleCount.value))
const dots = computed(() => Array.from({ length: maxIndex.value + 1 }, (_, i) => i))

const getVisibleCount = () => {
  if (window.innerWidth <= 640) return 1
  if (window.innerWidth <= 1024) return 2
  return 3
}

const updateSlider = () => {
  if (!track.value || track.value.children.length === 0) return
  const slideWidth = track.value.children[0].getBoundingClientRect().width
  const gap = 24
  const offset = currentIndex.value * (slideWidth + gap)
  track.value.style.transform = `translateX(-${offset}px)`
}

const createDots = () => {
  visibleCount.value = getVisibleCount()
}

const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    updateSlider()
  }
}

const next = () => {
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++
    updateSlider()
  }
}

const goTo = i => {
  currentIndex.value = i
  updateSlider()
}

const onResize = () => {
  if (currentIndex.value > maxIndex.value) currentIndex.value = maxIndex.value
  createDots()
  updateSlider()
}

onMounted(() => {
  createDots()
  updateSlider()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <main class="slider-section">
    <div class="section-header">
      <h1>台中市運動空間選擇</h1>
      <p>精選台中公共體適能、單次免約、連鎖旗艦與 24H 智能健身據點</p>
    </div>

    <div class="carousel-wrapper">
      <button class="nav-arrow prev" :disabled="currentIndex === 0" @click="prev" aria-label="上一頁">
        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <div class="carousel-viewport">
        <div class="carousel-track" ref="track">
          <div
            v-for="theme in themes"
            :key="theme.key"
            class="card-slide"
          >
            <div class="card-img-box">
              <img :src="theme.image" :alt="theme.title" />
            </div>
            <div class="card-content">
              <div>
                <h3 class="card-title">{{ theme.title }}</h3>
                <p class="card-desc">{{ theme.desc }}</p>
              </div>
              <RouterLink class="btn-action" :to="'/sport/' + theme.key">查看運動據點</RouterLink>
            </div>
          </div>
        </div>
      </div>

      <button
        class="nav-arrow next"
        :disabled="currentIndex >= maxIndex"
        @click="next"
        aria-label="下一頁"
      >
        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

    <div class="slider-dots">
      <div
        v-for="d in dots"
        :key="d"
        class="dot"
        :class="{ active: d === currentIndex }"
        @click="goTo(d)"
      ></div>
    </div>
  </main>
</template>

<style scoped>
.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
