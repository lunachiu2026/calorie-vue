<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../auth.js'

const { currentUser } = useAuth()

const RECORDS_KEY = 'calorie-records'
const records = ref([])

const mealTypes = [
  { key: '早餐', label: '早餐' },
  { key: '午餐', label: '午餐' },
  { key: '晚餐', label: '晚餐' }
]

const loadRecords = () => {
  try {
    records.value = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
  } catch (e) {
    records.value = []
  }
}

const mealSummary = items => {
  return items.reduce(
    (acc, it) => {
      acc.calories += it.calories || 0
      acc.protein += it.protein_g || 0
      acc.fat += it.fat_g || 0
      acc.carbs += it.carbs_g || 0
      return acc
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )
}

const totalSummary = rec => {
  const t = { calories: 0, protein: 0, fat: 0, carbs: 0 }
  mealTypes.forEach(m => {
    const s = mealSummary(rec.meals[m.key] || [])
    t.calories += s.calories
    t.protein += s.protein
    t.fat += s.fat
    t.carbs += s.carbs
  })
  return t
}

const formatDate = savedAt => {
  const d = new Date(savedAt)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const deleteRecord = id => {
  if (!confirm('確定要刪除這筆紀錄嗎？')) return
  records.value = records.value.filter(r => r.id !== id)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records.value))
}

const clearAll = () => {
  if (!confirm('確定要清除全部紀錄嗎？')) return
  records.value = []
  localStorage.removeItem(RECORDS_KEY)
}

onMounted(loadRecords)
</script>

<template>
  <main class="records-page">
    <div class="page-head">
      <div>
        <h2>我的儲存紀錄</h2>
        <p v-if="currentUser" class="user-line">使用者：<strong>{{ currentUser }}</strong></p>
      </div>
      <button v-if="records.length" class="btn-clear-all" @click="clearAll">清除全部</button>
    </div>

    <div v-if="!records.length" class="empty-state">
      <p>尚無儲存紀錄</p>
      <span>回到首頁「儲存今日紀錄」即可產生第一筆資料。</span>
    </div>

    <div v-for="rec in records" :key="rec.id" class="record-card">
      <div class="record-head">
        <span class="record-date">{{ formatDate(rec.savedAt) }}</span>
        <button class="btn-del" @click="deleteRecord(rec.id)">刪除</button>
      </div>

      <div class="meals-grid">
        <div v-for="m in mealTypes" :key="m.key" class="meal-block">
          <div class="meal-title">{{ m.label }}</div>
          <ul v-if="(rec.meals[m.key] || []).length" class="food-list">
            <li v-for="(item, idx) in rec.meals[m.key]" :key="idx">
              <span class="food-name">{{ item.name }}</span>
              <span class="food-meta">{{ item.weight_g }}g · {{ item.calories }} kcal</span>
            </li>
          </ul>
          <p v-else class="food-empty">— 未紀錄 —</p>
          <div class="meal-subtotal">
            小計 {{ mealSummary(rec.meals[m.key] || []).calories }} kcal
          </div>
        </div>
      </div>

      <div class="record-total">
        <span class="total-cal">總熱量 <strong>{{ totalSummary(rec).calories }}</strong> kcal</span>
        <span class="total-macro">
          碳水 {{ Math.round(totalSummary(rec).carbs) }}g ／
          蛋白質 {{ Math.round(totalSummary(rec).protein) }}g ／
          脂肪 {{ Math.round(totalSummary(rec).fat) }}g
        </span>
      </div>
    </div>
  </main>
</template>

<style scoped>
.records-page {
  max-width: 760px;
  margin: 32px auto;
  padding: 0 16px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.user-line {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.btn-clear-all {
  border: 1px solid #fecdd3;
  background: #fef2f3;
  color: #e11d48;
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.empty-state {
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
}

.empty-state p {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.empty-state span {
  font-size: 13px;
}

.record-card {
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  padding: 22px 24px;
  margin-bottom: 18px;
}

.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.record-date {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.3px;
}

.btn-del {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
}

.btn-del:hover {
  color: #e11d48;
}

.meals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.meal-block {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
}

.meal-title {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
}

.food-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.food-name {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.food-meta {
  font-size: 12px;
  color: #94a3b8;
}

.food-empty {
  margin: 0;
  font-size: 13px;
  color: #cbd5e1;
}

.meal-subtotal {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.record-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.total-cal {
  font-size: 15px;
  color: #334155;
}

.total-cal strong {
  font-size: 22px;
  color: #ef4444;
  margin: 0 2px;
}

.total-macro {
  font-size: 13px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .meals-grid {
    grid-template-columns: 1fr;
  }
}
</style>
