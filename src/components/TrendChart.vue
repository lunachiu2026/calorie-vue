<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ points: { type: Array, required: true }, title: String, unit: String, zero: Boolean })
const selected = ref(null)
const valid = computed(() => props.points.filter(p => p.value !== null))
const bounds = computed(() => {
  const values = valid.value.map(p => p.value)
  const min = props.zero ? 0 : Math.floor(Math.min(...values) - 0.5)
  const max = Math.max(min + 1, Math.ceil(Math.max(...values) + (props.zero ? 100 : 0.5)))
  return { min, max }
})
const timestamp = date => new Date(date + 'T12:00:00').getTime()
const x = date => {
  const first = timestamp(props.points[0].date), last = timestamp(props.points.at(-1).date)
  return first === last ? 370 : 62 + (timestamp(date) - first) / (last - first) * 608
}
const y = value => 206 - (value - bounds.value.min) / (bounds.value.max - bounds.value.min) * 174
const segments = computed(() => {
  const result = []; let segment = []
  for (const point of props.points) {
    if (point.value === null) { if (segment.length) result.push(segment.join(' ')); segment = [] }
    else segment.push(`${x(point.date)},${y(point.value)}`)
  }
  if (segment.length) result.push(segment.join(' '))
  return result
})
const ticks = computed(() => [bounds.value.min, (bounds.value.max + bounds.value.min) / 2, bounds.value.max])
const label = point => `${point.date}：${point.value === null ? '未記錄' : point.value + ' ' + props.unit}`
</script>

<template>
  <figure class="trend-chart">
    <figcaption>{{ title }} <small>單位：{{ unit }}</small></figcaption>
    <div v-if="!valid.length" class="chart-empty">尚無紀錄，儲存第一筆後即可查看趨勢。</div>
    <template v-else>
      <svg viewBox="0 0 710 254" role="img" :aria-label="title">
        <title>{{ title }}，詳細數據可展開下方表格查看</title>
        <g v-for="tick in ticks" :key="tick">
          <line x1="62" x2="670" :y1="y(tick)" :y2="y(tick)" stroke="#e0e8e2" />
          <text x="52" :y="y(tick) + 4" text-anchor="end">{{ Math.round(tick * 10) / 10 }}</text>
        </g>
        <polyline v-for="(segment, index) in segments" :key="index" :points="segment" fill="none" stroke="#39835b" stroke-width="3" />
        <circle v-for="point in valid" :key="point.date" :cx="x(point.date)" :cy="y(point.value)" r="5" fill="#39835b" tabindex="0" :aria-label="label(point)" @focus="selected = label(point)" @mouseenter="selected = label(point)" @click="selected = label(point)"><title>{{ label(point) }}</title></circle>
        <text x="62" y="239">{{ points[0].date.slice(5) }}</text>
        <text x="670" y="239" text-anchor="end">{{ points.at(-1).date.slice(5) }}</text>
      </svg>
      <p class="chart-tooltip" aria-live="polite">{{ selected || '點選圖上的圓點查看數值' }}</p>
      <details><summary>查看每日數據</summary><div class="table-scroll"><table><thead><tr><th>日期</th><th>{{ unit }}</th></tr></thead><tbody><tr v-for="point in points" :key="point.date"><td>{{ point.date }}</td><td>{{ point.value ?? '未記錄' }}</td></tr></tbody></table></div></details>
    </template>
  </figure>
</template>

<style scoped>
.trend-chart { margin: 18px 0 0; padding: 18px; border: 1px solid #e1e9e3; border-radius: 16px; background: #fbfdfb; }
figcaption { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; font-weight: 700; color: #334d3e; }
small, .chart-tooltip { color: #617569; font-size: 12px; font-weight: 400; }
svg { display: block; width: 100%; max-height: 310px; margin-top: 12px; }
svg text { font-size: 12px; fill: #617569; }
circle { cursor: pointer; } circle:focus { outline: none; stroke: #1c3828; stroke-width: 3; }
.chart-empty { padding: 40px 12px; color: #617569; text-align: center; }
.chart-tooltip { min-height: 20px; margin: 0 0 8px; }
summary { cursor: pointer; font-size: 13px; color: #365742; }
.table-scroll { overflow: auto; max-height: 250px; }
table { width: 100%; text-align: left; border-collapse: collapse; font-size: 13px; }
th, td { padding: 8px; border-bottom: 1px solid #e1e9e3; }
</style>
