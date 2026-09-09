<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiRequest } from '../api.js'
import { localDate, weightSummary } from '../progress.js'
import TrendChart from './TrendChart.vue'
const records = ref([]), target = ref(null), targetDraft = ref('')
const date = ref(localDate()), weight = ref(''), busy = ref(false), loaded = ref(false), error = ref(''), success = ref('')
const summary = computed(() => weightSummary(records.value))
const points = computed(() => records.value.map(r => ({ date: r.date, value: r.weight })))
const signed = value => value === null ? '—' : `${value > 0 ? '+' : ''}${value} kg`
const load = async () => {
  const result = await apiRequest('weights.php')
  records.value = result.records; target.value = result.target; targetDraft.value = result.target ?? ''; loaded.value = true
}
const refresh = async () => {
  busy.value = true; error.value = ''
  try { await load() } catch (e) { error.value = e.message } finally { busy.value = false }
}
const mutate = async (method, body, message) => {
  if (busy.value) return
  busy.value = true; error.value = ''; success.value = ''
  try {
    await apiRequest('weights.php', { method, body })
    await load(); success.value = message
  } catch (e) { error.value = e.message } finally { busy.value = false }
}
const remove = record => {
  if (confirm(`確定刪除 ${record.date} 的體重紀錄？`)) mutate('DELETE', { id: record.id }, '已刪除體重紀錄')
}
const edit = record => { date.value = record.date; weight.value = record.weight; success.value = '已帶入紀錄，修改後按「儲存體重」' }
onMounted(refresh)
</script>
<template>
  <section class="weight-tracker" id="weight-progress">
    <h2>體重紀錄與趨勢</h2>
    <p class="intro">記下每次量測，查看從起始到現在的變化。</p>
    <p v-if="busy" role="status">處理中…</p>
    <p v-if="error" role="alert" class="error">{{ error }} <button type="button" :disabled="busy" @click="refresh">重新讀取</button></p>
    <p v-if="success" role="status" class="success">{{ success }}</p>
    <template v-if="loaded">
      <div class="weight-stats">
        <div><span>起始體重</span><strong>{{ summary.start ? summary.start.weight + ' kg' : '—' }}</strong><small>{{ summary.start?.date || '尚無紀錄' }}</small></div>
        <div><span>目前體重</span><strong>{{ summary.current ? summary.current.weight + ' kg' : '—' }}</strong><small>{{ summary.current?.date || '尚無紀錄' }}</small></div>
        <div><span>目標體重</span><strong>{{ target === null ? '—' : target + ' kg' }}</strong><small>{{ target === null ? '尚未設定' : '個人設定目標' }}</small></div>
        <div><span>本週變化</span><strong>{{ signed(summary.weekChange) }}</strong><small>本週最新 − 週一前最後一筆</small></div>
        <div><span>累計變化</span><strong>{{ signed(summary.totalChange) }}</strong><small>目前 − 起始</small></div>
      </div>
      <div class="weight-forms">
        <form @submit.prevent="mutate('PUT', { date, weight }, '體重已儲存')">
          <label>量測日期<input v-model="date" type="date" min="1900-01-01" :max="localDate()" required :disabled="busy" /></label>
          <label>體重（kg）<input v-model.number="weight" type="number" min="20" max="300" step="0.01" placeholder="例如 51.8" required :disabled="busy" /></label>
          <button :disabled="busy" type="submit">儲存體重</button>
        </form>
        <form @submit.prevent="mutate('PATCH', { target: targetDraft }, '目標體重已更新')">
          <label>目標體重（kg）<input v-model.number="targetDraft" type="number" min="20" max="300" step="0.01" placeholder="例如 48" required :disabled="busy" /></label>
          <button :disabled="busy" type="submit">儲存目標</button>
        </form>
      </div>
      <p class="note">同一天再次儲存會更新該日體重。本週以週一開始，缺少比較紀錄時顯示「—」。體重紀錄不會自動更改 BMI 評估與每日熱量目標。</p>
      <TrendChart :key="JSON.stringify(points)" :points="points" title="體重量測趨勢（依實際日期間隔）" unit="kg" />
      <details v-if="records.length" class="weight-history"><summary>管理體重紀錄（{{ records.length }} 筆）</summary><div class="table-scroll"><table><thead><tr><th>日期</th><th>體重</th><th>操作</th></tr></thead><tbody><tr v-for="record in [...records].reverse()" :key="record.id"><td>{{ record.date }}</td><td>{{ record.weight }} kg</td><td><button type="button" :disabled="busy" @click="edit(record)">編輯</button><button type="button" :disabled="busy" @click="remove(record)">刪除</button></td></tr></tbody></table></div></details>
    </template>
  </section>
</template>
<style scoped>
.weight-tracker { margin: 28px 0; padding: 24px; border: 1px solid #dce7df; border-radius: 18px; background: white; color: #334d3e; }
h2 { margin: 0 0 8px; font-size: 20px; } .intro, .note { color: #617569; font-size: 13px; line-height: 1.7; }
.weight-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 20px 0; }
.weight-stats > div { display: grid; gap: 8px; padding: 15px 12px; background: #f2f7f3; border-radius: 12px; }
.weight-stats span { font-size: 13px; } .weight-stats strong { font-size: 23px; } small { font-size: 11px; color: #617569; }
.weight-forms { display: flex; flex-wrap: wrap; gap: 20px; } form { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; }
label { display: grid; gap: 7px; font-size: 13px; } input { box-sizing: border-box; width: 155px; padding: 10px; border: 1px solid #c8d8cd; border-radius: 8px; font: inherit; }
button { padding: 10px 12px; background: #e8f1ea; color: #34583f; border: 1px solid #c8d8cd; border-radius: 8px; cursor: pointer; } button:disabled { opacity: .5; cursor: wait; }
.error { color: #a32b28; } .success { color: #35734e; } .weight-history { margin-top: 16px; } summary { cursor: pointer; }
.table-scroll { max-height: 280px; overflow: auto; } table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; } td, th { padding: 10px; border-bottom: 1px solid #e1e9e3; } td button { margin: 2px; }
@media(max-width: 760px) { .weight-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .weight-tracker { padding: 16px; } }
</style>
