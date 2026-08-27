<script setup>
import { ref, computed, onMounted } from 'vue'
import foods from '../data/foods.json'

const STORAGE_KEY = 'calorie-meals'

const foodDatabase = ref(foods)
const selectedCategory = ref('全部')
const selectedFoodName = ref('')
const inputWeight = ref(100)

const meals = ref({
  早餐: [],
  午餐: [],
  晚餐: []
})

const categories = computed(() => [
  ...new Set(foodDatabase.value.map(item => item.category))
])

const searchQuery = ref('')

const filteredFoods = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  return foodDatabase.value.filter(item => {
    const matchCategory =
      selectedCategory.value === '全部' || item.category === selectedCategory.value
    const matchKeyword = keyword === '' || item.name.toLowerCase().includes(keyword)
    return matchCategory && matchKeyword
  })
})

const dropdownOpen = ref(true)

const onSearchInput = () => {
  if (searchQuery.value.trim() !== '') {
    selectedCategory.value = '全部'
  }
  selectedFoodName.value = ''
  dropdownOpen.value = true
}

const onCategoryChange = () => {
  searchQuery.value = ''
  selectedFoodName.value = ''
}

const isSearching = computed(() => searchQuery.value.trim() !== '')

const selectSearchResult = food => {
  selectedFoodName.value = food.name
  dropdownOpen.value = false
}

const currentSelectedFood = computed(() =>
  foodDatabase.value.find(item => item.name === selectedFoodName.value)
)

const calculatedPreview = computed(() => {
  if (!currentSelectedFood.value || !inputWeight.value) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 }
  }

  const ratio = inputWeight.value / 100
  const food = currentSelectedFood.value

  return {
    calories: Math.round(food.calories * ratio),
    protein: (food.protein_g * ratio).toFixed(1),
    fat: (food.fat_g * ratio).toFixed(1),
    carbs: (food.carbs_g * ratio).toFixed(1)
  }
})

const addFoodToMeal = mealType => {
  if (!currentSelectedFood.value || inputWeight.value <= 0) return

  const food = currentSelectedFood.value
  const ratio = inputWeight.value / 100

  meals.value[mealType].push({
    name: food.name,
    weight_g: inputWeight.value,
    calories: Math.round(food.calories * ratio),
    protein_g: Number((food.protein_g * ratio).toFixed(1)),
    fat_g: Number((food.fat_g * ratio).toFixed(1)),
    carbs_g: Number((food.carbs_g * ratio).toFixed(1))
  })
}

const removeFoodFromMeal = (mealType, idx) => {
  meals.value[mealType].splice(idx, 1)
}

const getMealSummary = mealType =>
  meals.value[mealType].reduce(
    (acc, item) => {
      acc.calories += item.calories
      acc.protein += item.protein_g
      acc.fat += item.fat_g
      acc.carbs += item.carbs_g
      return acc
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

const breakfastCalories = computed(() => getMealSummary('早餐').calories)
const lunchCalories = computed(() => getMealSummary('午餐').calories)
const dinnerCalories = computed(() => getMealSummary('晚餐').calories)

const totalMealCalories = computed(
  () => breakfastCalories.value + lunchCalories.value + dinnerCalories.value
)

const CALORIE_TARGET = 2000
const calorieDeficit = computed(() => CALORIE_TARGET - totalMealCalories.value)

const totalMacros = computed(() => {
  const s = getMealSummary('早餐')
  const l = getMealSummary('午餐')
  const d = getMealSummary('晚餐')
  return {
    carbs: s.carbs + l.carbs + d.carbs,
    protein: s.protein + l.protein + d.protein,
    fat: s.fat + l.fat + d.fat
  }
})

const macroRatio = computed(() => {
  const c = totalMacros.value.carbs * 4
  const p = totalMacros.value.protein * 4
  const f = totalMacros.value.fat * 9
  const t = c + p + f || 1
  return {
    carbs: Math.round((c / t) * 100),
    protein: Math.round((p / t) * 100),
    fat: Math.round((f / t) * 100)
  }
})

const clearAllMeals = () => {
  if (confirm('確定要清空今日的三餐紀錄嗎？')) {
    meals.value = {
      早餐: [],
      午餐: [],
      晚餐: []
    }
  }
}

const saveMeals = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals.value))

  const records = JSON.parse(localStorage.getItem('calorie-records') || '[]')
  records.unshift({
    id: Date.now(),
    savedAt: new Date().toISOString(),
    meals: JSON.parse(JSON.stringify(meals.value))
  })
  localStorage.setItem('calorie-records', JSON.stringify(records))

  alert('今日紀錄已儲存！')
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') {
        meals.value = {
          早餐: Array.isArray(parsed['早餐']) ? parsed['早餐'] : [],
          午餐: Array.isArray(parsed['午餐']) ? parsed['午餐'] : [],
          晚餐: Array.isArray(parsed['晚餐']) ? parsed['晚餐'] : []
        }
      }
    } catch (e) {
      console.error('讀取儲存紀錄失敗', e)
    }
  }
})
</script>

<template>
  <main class="container">
    <!-- 上半部：計算與數據看板 -->
    <div class="top-section">
      <!-- 左側熱量估算表單 -->
      <div class="calc-box">
        <h1>吃得聰明，卡路里幫您精準計算</h1>
        <p class="subtitle">輸入您今天享用的食物，<br />為您的健康旅程精準把關。</p>

        <div class="search-title">🔍 快速估算食物熱量</div>

        <!-- 篩選與輸入列 -->
        <div class="form-group food-form">
          <select v-model="selectedCategory" class="select-serving" @change="onCategoryChange">
            <option value="全部">全部類別</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>

          <select v-model="selectedFoodName" class="input-food" :class="{ selected: selectedFoodName }">
            <option value="" disabled>-- 請選擇食物 --</option>
            <option v-for="food in filteredFoods" :key="food.name" :value="food.name">
              {{ food.name }} (每100g: {{ food.calories }}kcal)
            </option>
          </select>

          <input type="number" v-model.number="inputWeight" min="1" class="input-food" />
          g(公克)

          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            @input="onSearchInput"
            @focus="dropdownOpen = true"
            placeholder="輸入食物名稱搜尋…"
          />

          <div v-if="isSearching && dropdownOpen" class="search-dropdown">
            <button
              v-for="food in filteredFoods"
              :key="food.name"
              type="button"
              class="search-dropdown-item"
              @click="selectSearchResult(food)"
            >
              {{ food.name }} <span class="search-dropdown-cal">({{ food.calories }} kcal/100g)</span>
            </button>
            <p v-if="filteredFoods.length === 0" class="search-dropdown-empty">
              找不到符合「{{ searchQuery }}」的食物
            </p>
          </div>
        </div>

        <!-- 加入餐別按鈕區 -->
        <div class="btn-group">
          <button
            v-for="mealType in ['早餐', '午餐', '晚餐']"
            :key="mealType"
            @click="addFoodToMeal(mealType)"
            :disabled="!selectedFoodName || inputWeight <= 0"
            class="btn-calc"
          >
            + 加入<br />{{ mealType }}
          </button>
        </div>

        <!-- 即時估算數值明細 -->
        <div class="result-bar">
          <span>預估熱量：<strong class="highlight-green">{{ calculatedPreview.calories }} kcal</strong></span>
          <span>碳水：<strong>{{ calculatedPreview.carbs }}g</strong></span>
          <span>蛋白質：<strong>{{ calculatedPreview.protein }}g</strong></span>
          <span>脂肪：<strong>{{ calculatedPreview.fat }}g</strong></span>
        </div>
      </div>
    </div>

    <!-- 下半部：三餐明細記錄區 -->
    <div class="bottom-section">
      <div class="meals-container">
        <div class="meals-header">
          <h2>🥗 今日三餐飲食明細</h2>
          <button @click="clearAllMeals" class="btn-clear">清空紀錄</button>
        </div>

        <div class="meals-grid">
          <div v-for="mealType in ['早餐', '午餐', '晚餐']" :key="mealType" class="meal-card">
            <div>
              <h4>{{ mealType }} ({{ meals[mealType].length }} 項)</h4>
              <span class="highlight-green">{{ getMealSummary(mealType).calories }} kcal</span>
            </div>

            <div v-if="meals[mealType].length === 0" class="empty-meal">
              尚未加入任何食物
            </div>

            <ul v-else class="meal-list">
              <li v-for="(item, idx) in meals[mealType]" :key="idx" class="meal-item">
                <div>
                  <div>{{ item.name }} ({{ item.weight_g }}g)</div>
                  <div>P:{{ item.protein_g }}g | C:{{ item.carbs_g }}g | F:{{ item.fat_g }}g</div>
                </div>
                <div>
                  <span>{{ item.calories }} kcal</span>
                  <button @click="removeFoodFromMeal(mealType, idx)" class="btn-delete">
                    <img
                      width="16"
                      height="16"
                      src="https://img.icons8.com/office/16/delete-sign.png"
                      alt="delete-sign"
                    />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="total-summary-card">
          <div class="card-head">
            <h3>三餐食物比例</h3>
            <span class="card-target">每日目標 {{ CALORIE_TARGET }} kcal</span>
          </div>

          <div class="macro-layout">
            <div class="macro-ratio">
              <div class="macro-bar-item">
                <div class="macro-bar-head">
                  <span class="macro-bar-label"><span class="dot carbs"></span>碳水</span>
                  <span class="macro-bar-val">{{ Math.round(totalMacros.carbs) }}g · {{ macroRatio.carbs }}%</span>
                </div>
                <div class="macro-track">
                  <span class="macro-fill carbs" :style="{ width: macroRatio.carbs + '%' }"></span>
                </div>
              </div>

              <div class="macro-bar-item">
                <div class="macro-bar-head">
                  <span class="macro-bar-label"><span class="dot protein"></span>蛋白質</span>
                  <span class="macro-bar-val">{{ Math.round(totalMacros.protein) }}g · {{ macroRatio.protein }}%</span>
                </div>
                <div class="macro-track">
                  <span class="macro-fill protein" :style="{ width: macroRatio.protein + '%' }"></span>
                </div>
              </div>

              <div class="macro-bar-item">
                <div class="macro-bar-head">
                  <span class="macro-bar-label"><span class="dot fat"></span>脂肪</span>
                  <span class="macro-bar-val">{{ Math.round(totalMacros.fat) }}g · {{ macroRatio.fat }}%</span>
                </div>
                <div class="macro-track">
                  <span class="macro-fill fat" :style="{ width: macroRatio.fat + '%' }"></span>
                </div>
              </div>
            </div>

            <div class="formula-box">
              <div class="total-hero">
                <span class="tb-label">熱量總計</span>
                <div class="total-number">{{ totalMealCalories }}<span class="unit">kcal</span></div>
              </div>
            </div>
          </div>

          <div class="deficit-box">熱量赤字 <strong>{{ calorieDeficit }}</strong> kcal</div>
        </div>

        <div class="meals-header" style="margin-top: 24px;">
          <h2></h2>
          <button @click="saveMeals" class="btn-clear" style="width:100%">儲存今日紀錄</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.food-form {
  position: relative;
}

.search-input {
  flex-basis: 100%;
  width: 100%;
  min-height: 44px;
  margin-top: 12px;
  padding: 0 12px;
  background: #fff;
  border: 1px solid #d6d6d6;
  border-radius: 9px;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #27b86e;
  box-shadow: 0 0 0 3px rgba(39, 184, 110, 0.12);
}

.search-dropdown {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 100%;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #d6d6d6;
  border-radius: 9px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 20;
}

.search-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.search-dropdown-item:hover {
  background: #eaf7ef;
  color: #2e9e5b;
}

.search-dropdown-cal {
  font-size: 12px;
  color: #888;
}

.search-dropdown-empty {
  margin: 0;
  padding: 12px;
  font-size: 14px;
  color: #888;
}

.input-food.selected {
  background: #eaf7ef;
  border-color: #2e9e5b;
  color: #2e9e5b;
}

.total-summary-card {
  position: relative;
  margin-top: 12px;
  padding: 28px;
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
}

.total-summary-card h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.card-target {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.3px;
}

.macro-layout {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 36px;
  align-items: center;
  min-height: 150px;
}

.macro-ratio {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  min-width: 0;
}

.macro-bar-item {
  min-width: 0;
}

.macro-bar-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 13px;
}

.macro-bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #334155;
}

.macro-bar-val {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.macro-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}

.macro-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.macro-fill.carbs {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.macro-fill.protein {
  background: linear-gradient(90deg, #fde047, #facc15);
}

.macro-fill.fat {
  background: linear-gradient(90deg, #f87171, #ef4444);
}

.macro-bar-label .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.macro-bar-label .dot.carbs {
  background: #3b82f6;
}

.macro-bar-label .dot.protein {
  background: #facc15;
}

.macro-bar-label .dot.fat {
  background: #ef4444;
}

.formula-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.total-hero {
  text-align: center;
}

.tb-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.total-number {
  font-size: 52px;
  font-weight: 800;
  color: #ef4444;
  line-height: 1;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.total-number .unit {
  font-size: 17px;
  font-weight: 600;
  color: #cbd5e1;
  margin-left: 6px;
}

.deficit-box {
  position: absolute;
  right: 20px;
  bottom: 20px;
  height: 30px;
  padding: 0 14px;
  box-sizing: border-box;
  background: #fef2f3;
  border: 1px solid #fbd0d6;
  border-radius: 999px;
  color: #e11d48;
  font-size: 12px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
  letter-spacing: 0.5px;
}

.deficit-box strong {
  font-weight: 700;
  margin: 0 2px;
}

@media (max-width: 600px) {
  .macro-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
