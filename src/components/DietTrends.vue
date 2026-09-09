<script setup>
import { computed, ref } from 'vue'
import TrendChart from './TrendChart.vue'
import { dailySeries, recordedAverage } from '../progress.js'
const props = defineProps({ records: { type: Array, required: true } })
const days = ref(7)
const series = computed(() => dailySeries(props.records, days.value))
const week = computed(() => recordedAverage(dailySeries(props.records, 7)))
</script>
<template>
  <section class="diet-trends">
    <div class="trend-head"><div><h2>歷史飲食趨勢</h2><p>近 7 天平均 <strong>{{ week.average === null ? '—' : week.average.toLocaleString() }}</strong> kcal <small>已記錄 {{ week.count }} / 7 天</small></p></div><div class="range-buttons"><button v-for="count in [7, 30]" :key="count" :aria-pressed="days === count" @click="days = count">近 {{ count }} 天</button></div></div>
    <p class="trend-note">平均只計入已儲存的日期；未記錄的日子不當作 0 kcal，圖表會留空。</p>
    <TrendChart :key="days" :points="series" title="每日總熱量" unit="kcal" zero />
  </section>
</template>
<style scoped>
.diet-trends { margin: 24px 0; padding: 24px; border: 1px solid #e1e9e3; border-radius: 18px; background: white; }
.trend-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
h2 { margin: 0 0 12px; font-size: 20px; color: #334d3e; } p { margin: 0; color: #526b5d; } strong { font-size: 26px; color: #35734e; } small { margin-left: 10px; }
.trend-note { margin-top: 8px; font-size: 12px; line-height: 1.6; }
.range-buttons { display: flex; gap: 8px; } button { padding: 9px 12px; border: 1px solid #d3e0d7; border-radius: 9px; background: white; color: #365742; cursor: pointer; } button[aria-pressed="true"] { background: #e6f2e9; border-color: #7ba98a; }
@media(max-width: 500px) { .diet-trends { padding: 16px; } }
</style>
