<script setup>
import { computed, onMounted, ref } from 'vue'
import foods from '../data/foods.json'
import mealPhoto from '../assets/healthy-meals.png'

const STORAGE_KEY = 'calorie-meals'
const CALORIE_TARGET = 2000
const mealTypes = ['早餐', '午餐', '晚餐']
const foodDatabase = ref(foods)
const searchQuery = ref('')
const selectedFoodName = ref('')
const inputWeight = ref(100)
const activeMeal = ref('午餐')
const dropdownOpen = ref(false)
const meals = ref({ 早餐: [], 午餐: [], 晚餐: [] })

const recommendations = [
  { name: '雞胸肉(去皮)', title: '低卡舒肥雞胸肉餐盒', description: '高蛋白、低脂肪，搭配蔬菜與優質澱粉。', weight: 180, position: 'left' },
  { name: '鮭魚', title: '煙燻鮭魚藜麥溫沙拉', description: '鮭魚好油脂搭配藜麥，營養均衡有飽足感。', weight: 180, position: 'center' },
  { name: '牛排(沙朗)', title: '厚切嫩煎牛肉高纖燕麥碗', description: '豐富蛋白質搭配蔬菜，適合運動後補充。', weight: 180, position: 'right' }
]

const filteredFoods = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return foodDatabase.value.slice(0, 8)
  return foodDatabase.value.filter(food => food.name.toLowerCase().includes(keyword)).slice(0, 8)
})

const currentSelectedFood = computed(() =>
  foodDatabase.value.find(food => food.name === selectedFoodName.value)
)

const calculatedPreview = computed(() => {
  if (!currentSelectedFood.value || inputWeight.value <= 0) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 }
  }
  const ratio = inputWeight.value / 100
  const food = currentSelectedFood.value
  return {
    calories: Math.round(food.calories * ratio),
    protein: Number((food.protein_g * ratio).toFixed(1)),
    fat: Number((food.fat_g * ratio).toFixed(1)),
    carbs: Number((food.carbs_g * ratio).toFixed(1))
  }
})

const selectSearchResult = food => {
  selectedFoodName.value = food.name
  searchQuery.value = food.name
  dropdownOpen.value = false
}

const addFood = (food, weight, mealType) => {
  if (!food || weight <= 0) return
  const ratio = weight / 100
  meals.value[mealType].push({
    name: food.name,
    weight_g: weight,
    calories: Math.round(food.calories * ratio),
    protein_g: Number((food.protein_g * ratio).toFixed(1)),
    fat_g: Number((food.fat_g * ratio).toFixed(1)),
    carbs_g: Number((food.carbs_g * ratio).toFixed(1))
  })
}

const addCurrentFood = () => addFood(currentSelectedFood.value, inputWeight.value, activeMeal.value)
const addRecommendation = item => {
  const food = foodDatabase.value.find(foodItem => foodItem.name === item.name)
  addFood(food, item.weight, activeMeal.value)
}
const removeFoodFromMeal = (mealType, index) => meals.value[mealType].splice(index, 1)

const getMealSummary = mealType => meals.value[mealType].reduce(
  (summary, item) => ({
    calories: summary.calories + item.calories,
    protein: summary.protein + item.protein_g,
    fat: summary.fat + item.fat_g,
    carbs: summary.carbs + item.carbs_g
  }),
  { calories: 0, protein: 0, fat: 0, carbs: 0 }
)

const selectedItems = computed(() => mealTypes.flatMap(mealType =>
  meals.value[mealType].map((item, index) => ({ ...item, mealType, index }))
))
const totalMealCalories = computed(() => mealTypes.reduce(
  (total, mealType) => total + getMealSummary(mealType).calories, 0
))
const totalMacros = computed(() => mealTypes.reduce((total, mealType) => {
  const summary = getMealSummary(mealType)
  total.protein += summary.protein
  total.carbs += summary.carbs
  total.fat += summary.fat
  return total
}, { protein: 0, carbs: 0, fat: 0 }))
const calorieProgress = computed(() => Math.min(100, Math.round((totalMealCalories.value / CALORIE_TARGET) * 100)))
const ringStyle = computed(() => ({
  background: `conic-gradient(#37c77a ${calorieProgress.value * 3.6}deg, #edf2ef 0deg)`
}))
const macroWidth = (value, target) => `${Math.min(100, Math.round((value / target) * 100))}%`
const recommendationNutrition = item => {
  const food = foodDatabase.value.find(foodItem => foodItem.name === item.name)
  return food ? Math.round(food.calories * (item.weight / 100)) : 0
}

const clearAllMeals = () => {
  if (window.confirm('確定要清空今天的飲食清單嗎？')) {
    meals.value = { 早餐: [], 午餐: [], 晚餐: [] }
    localStorage.removeItem(STORAGE_KEY)
  }
}

const saveMeals = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals.value))
  const records = JSON.parse(localStorage.getItem('calorie-records') || '[]')
  records.unshift({ id: Date.now(), savedAt: new Date().toISOString(), meals: JSON.parse(JSON.stringify(meals.value)) })
  localStorage.setItem('calorie-records', JSON.stringify(records))
  window.alert('今日飲食紀錄已儲存！')
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    meals.value = {
      早餐: Array.isArray(parsed.早餐) ? parsed.早餐 : [],
      午餐: Array.isArray(parsed.午餐) ? parsed.午餐 : [],
      晚餐: Array.isArray(parsed.晚餐) ? parsed.晚餐 : []
    }
  } catch (error) {
    console.error('讀取儲存紀錄失敗', error)
  }
})
</script>

<template>
  <main class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-copy">
          <span class="ai-tag">AI 智慧熱量管家 ✨</span>
          <h1>吃得聰明，<em>卡路里</em>幫您精準計算</h1>
          <p>輸入您今天享用的食物，讓 AI 技術幫您快速掌握熱量與營養素組成。</p>

          <div class="calculator-card">
            <h2>⌕ 快速估算食物熱量</h2>
            <div class="calculator-row">
              <div class="food-search">
                <input v-model="searchQuery" type="text" placeholder="輸入食物名稱，例如：鮭魚"
                  @focus="dropdownOpen = true" @input="selectedFoodName = ''" @keyup.enter="addCurrentFood" />
                <div v-if="dropdownOpen" class="search-results">
                  <button v-for="food in filteredFoods" :key="food.name" type="button" @click="selectSearchResult(food)">
                    <span>{{ food.name }}</span><small>{{ food.calories }} kcal / 100g</small>
                  </button>
                  <p v-if="filteredFoods.length === 0">找不到符合的食物</p>
                </div>
              </div>
              <label class="weight-field">
                <input v-model.number="inputWeight" type="number" min="1" /><span>公克</span>
              </label>
              <select v-model="activeMeal" aria-label="選擇餐別">
                <option v-for="mealType in mealTypes" :key="mealType">{{ mealType }}</option>
              </select>
              <button class="calculate-button" type="button" :disabled="!currentSelectedFood || inputWeight <= 0" @click="addCurrentFood">
                計算並加入
              </button>
            </div>
            <div class="preview-row">
              <span>預估熱量：<strong>{{ calculatedPreview.calories }} kcal</strong></span>
              <span>碳水：<b>{{ calculatedPreview.carbs }}g</b></span>
              <span>蛋白質：<b>{{ calculatedPreview.protein }}g</b></span>
              <span>脂肪：<b>{{ calculatedPreview.fat }}g</b></span>
            </div>
          </div>
        </div>

        <aside class="nutrition-card">
          <h2>今日營養達成度</h2>
          <div class="progress-ring" :style="ringStyle">
            <div class="ring-center">
              <strong>{{ totalMealCalories.toLocaleString() }}</strong>
              <span>目標：{{ CALORIE_TARGET.toLocaleString() }} kcal</span>
            </div>
          </div>
          <div class="macro-stats">
            <div><span>蛋白質</span><strong>{{ Math.round(totalMacros.protein) }}g</strong><i><b :style="{ width: macroWidth(totalMacros.protein, 100) }"></b></i></div>
            <div><span>碳水化合物</span><strong>{{ Math.round(totalMacros.carbs) }}g</strong><i><b :style="{ width: macroWidth(totalMacros.carbs, 250) }"></b></i></div>
            <div><span>脂肪</span><strong>{{ Math.round(totalMacros.fat) }}g</strong><i><b :style="{ width: macroWidth(totalMacros.fat, 70) }"></b></i></div>
          </div>
        </aside>
      </div>
    </section>

    <section class="dashboard-section">
      <div class="recommendation-area">
        <div class="section-heading">
          <h2>🥗 本週推薦健康餐計畫</h2>
          <span>點擊購物車即可加入「{{ activeMeal }}」</span>
        </div>
        <div class="recommendation-grid">
          <article v-for="item in recommendations" :key="item.name" class="food-card">
            <div class="food-photo" :class="`photo-${item.position}`" :style="{ backgroundImage: `url(${mealPhoto})` }"></div>
            <div class="food-card-body">
              <div class="food-meta"><span>{{ recommendationNutrition(item) }} kcal</span><small>☆ 4.8</small></div>
              <h3>{{ item.title }}</h3><p>{{ item.description }}</p>
            </div>
            <div class="food-card-footer">
              <strong>{{ item.weight }}g</strong>
              <button type="button" :aria-label="`加入${item.title}`" @click="addRecommendation(item)">🛒</button>
            </div>
          </article>
        </div>
      </div>

      <aside class="selection-panel">
        <div class="selection-title"><h2>🛒 已選飲食清單</h2><span>{{ selectedItems.length }}</span></div>
        <div v-if="selectedItems.length === 0" class="empty-selection">
          <span>🥣</span><p>尚未加入食物<br />從上方搜尋或推薦餐點開始吧！</p>
        </div>
        <ul v-else class="selected-list">
          <li v-for="item in selectedItems" :key="`${item.mealType}-${item.index}-${item.name}`">
            <div class="meal-icon">{{ item.mealType === '早餐' ? '☀️' : item.mealType === '午餐' ? '🥗' : '🌙' }}</div>
            <div><strong>{{ item.name }}</strong><small>{{ item.mealType }} · {{ item.weight_g }}g</small></div>
            <span>{{ item.calories }} kcal</span>
            <button type="button" aria-label="刪除" @click="removeFoodFromMeal(item.mealType, item.index)">×</button>
          </li>
        </ul>
        <div class="meal-summary">
          <div v-for="mealType in mealTypes" :key="mealType">
            <span>{{ mealType }}（{{ meals[mealType].length }} 項）</span><b>{{ getMealSummary(mealType).calories }} kcal</b>
          </div>
          <div class="summary-total"><strong>今日總計</strong><strong>{{ totalMealCalories }} kcal</strong></div>
        </div>
        <button class="save-button" type="button" :disabled="selectedItems.length === 0" @click="saveMeals">儲存今日飲食紀錄</button>
        <button v-if="selectedItems.length" class="clear-button" type="button" @click="clearAllMeals">清空清單</button>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.home-page { min-height: 100vh; color: #202824; background: #f9fbfa; }
.hero-section {
  position: relative; overflow: hidden; padding: 60px 5% 56px;
  background: radial-gradient(circle at 20% 10%, rgba(255,255,255,.95) 0 10%, transparent 32%),
    radial-gradient(circle at 82% 76%, rgba(178,218,158,.48), transparent 28%),
    linear-gradient(120deg, #edf6e8 0%, #f8fcf6 48%, #e3f0dc 100%);
}
.hero-section::before, .hero-section::after { position: absolute; content: ''; border-radius: 50%; opacity: .72; }
.hero-section::before { width: 76px; height: 76px; right: 37%; top: 90px; background: #ff9e42; box-shadow: 170px 180px 0 -14px #ff7849, -480px 48px 0 -12px #ef5350; }
.hero-section::after { width: 62px; height: 62px; left: 23%; top: 190px; background: #8dcb58; box-shadow: 300px -80px 0 -8px #4d9a42; }
.hero-content { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1.65fr) minmax(310px,.85fr); gap: 46px; width: min(1280px,100%); margin: 0 auto; align-items: center; }
.ai-tag { display: inline-flex; padding: 8px 15px; color: #24ad68; background: rgba(255,255,255,.72); border-radius: 999px; font-size: 14px; font-weight: 700; }
.hero-copy h1 { max-width: 780px; margin: 24px 0 14px; font-size: clamp(34px,4vw,52px); line-height: 1.18; letter-spacing: -2px; }
.hero-copy h1 em { color: #37c77a; font-style: normal; }
.hero-copy > p { margin: 0 0 27px; color: #78827d; font-size: 17px; }
.calculator-card { padding: 23px 24px; background: rgba(255,255,255,.96); border-radius: 17px; box-shadow: 0 16px 40px rgba(61,92,71,.08); }
.calculator-card h2 { margin: 0 0 14px; font-size: 16px; }
.calculator-row { display: grid; grid-template-columns: minmax(220px,1fr) 112px 105px 126px; gap: 10px; }
.calculator-row input, .calculator-row select { width: 100%; height: 47px; padding: 0 13px; color: #2e3732; background: #fff; border: 1px solid #dce4df; border-radius: 9px; outline: none; }
.calculator-row input:focus, .calculator-row select:focus { border-color: #37c77a; box-shadow: 0 0 0 3px rgba(55,199,122,.12); }
.food-search { position: relative; }
.search-results { position: absolute; z-index: 20; top: 52px; right: 0; left: 0; overflow: hidden auto; max-height: 270px; background: #fff; border: 1px solid #dce4df; border-radius: 10px; box-shadow: 0 14px 35px rgba(38,64,49,.16); }
.search-results button { display: flex; justify-content: space-between; width: 100%; padding: 11px 13px; color: #2e3732; background: #fff; border: 0; border-bottom: 1px solid #eef2ef; cursor: pointer; }
.search-results button:hover { color: #1ca95f; background: #effaf4; }
.search-results small, .search-results p { color: #8b9790; }
.search-results p { padding: 12px; margin: 0; }
.weight-field { position: relative; }
.weight-field input { padding-right: 42px; }
.weight-field span { position: absolute; top: 14px; right: 11px; color: #8c9690; font-size: 13px; }
.calculate-button, .save-button { color: #fff; background: #37c77a; border: 0; border-radius: 9px; font-weight: 700; cursor: pointer; }
.calculate-button:hover:not(:disabled), .save-button:hover:not(:disabled) { background: #25b469; transform: translateY(-1px); }
.preview-row { display: flex; flex-wrap: wrap; gap: 25px; margin-top: 18px; color: #727d76; font-size: 14px; }
.preview-row strong { color: #2bc171; font-size: 20px; }
.preview-row b { color: #2c342f; }
.nutrition-card { padding: 30px 31px 27px; background: rgba(255,255,255,.96); border-radius: 24px; box-shadow: 0 18px 45px rgba(61,92,71,.09); }
.nutrition-card h2 { margin: 0 0 22px; text-align: center; font-size: 19px; }
.progress-ring { display: grid; width: 180px; height: 180px; margin: 0 auto 25px; place-items: center; border-radius: 50%; }
.ring-center { display: grid; width: 145px; height: 145px; background: #fff; border-radius: 50%; place-content: center; text-align: center; }
.ring-center strong { font-size: 32px; line-height: 1.1; }
.ring-center span { margin-top: 5px; color: #7e8983; font-size: 12px; }
.macro-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.macro-stats > div { display: grid; gap: 5px; text-align: center; }
.macro-stats span { color: #7b857f; font-size: 12px; }
.macro-stats strong { font-size: 15px; }
.macro-stats i { overflow: hidden; height: 4px; background: #edf1ef; border-radius: 10px; }
.macro-stats i b { display: block; height: 100%; background: #37c77a; border-radius: inherit; }
.macro-stats > div:first-child i b { background: #ff9d3d; }
.macro-stats > div:last-child i b { background: #4e9cf5; }
.dashboard-section { display: grid; grid-template-columns: minmax(0,1fr) 330px; gap: 38px; width: min(1280px,90%); margin: 0 auto; padding: 0 0 70px; align-items: start; }
.recommendation-area { min-width: 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 64px; }
.section-heading h2 { margin: 0; font-size: 23px; }
.section-heading span { color: #2fba70; font-size: 13px; }
.recommendation-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 22px; }
.food-card { overflow: hidden; background: #fff; border: 1px solid #e4eae6; border-radius: 17px; box-shadow: 0 8px 24px rgba(47,73,57,.04); }
.food-photo { height: 180px; background-repeat: no-repeat; background-size: 300% 100%; }
.photo-left { background-position: left center; } .photo-center { background-position: center; } .photo-right { background-position: right center; }
.food-card-body { min-height: 155px; padding: 18px 19px 13px; }
.food-meta { display: flex; justify-content: space-between; align-items: center; }
.food-meta span { padding: 5px 9px; color: #2abb6e; background: #eaf9f1; border-radius: 5px; font-size: 12px; font-weight: 700; }
.food-meta small { color: #2b332e; font-weight: 700; }
.food-card h3 { margin: 12px 0 6px; font-size: 16px; }
.food-card p { margin: 0; color: #768078; font-size: 13px; line-height: 1.45; }
.food-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 19px; border-top: 1px solid #edf1ee; }
.food-card-footer strong { font-size: 17px; }
.food-card-footer button { display: grid; width: 35px; height: 35px; color: #fff; background: #37c77a; border: 0; border-radius: 9px; cursor: pointer; place-items: center; }
.food-card-footer button:hover { transform: scale(1.06); }
.selection-panel { min-height: 430px; padding: 23px; background: #fff; border: 1px solid #e0e7e2; border-radius: 20px; }
.selection-title { display: flex; align-items: center; justify-content: space-between; }
.selection-title h2 { margin: 0; font-size: 18px; }
.selection-title > span { display: grid; width: 22px; height: 22px; color: #27b86e; background: #e6f8ef; border-radius: 50%; font-size: 12px; font-weight: 700; place-items: center; }
.empty-selection { display: grid; min-height: 185px; color: #8b958f; place-content: center; text-align: center; }
.empty-selection > span { font-size: 38px; }
.empty-selection p { margin: 8px 0 0; font-size: 13px; line-height: 1.7; }
.selected-list { max-height: 235px; padding: 8px 0 0; margin: 8px 0 15px; overflow-y: auto; list-style: none; }
.selected-list li { display: grid; grid-template-columns: 32px minmax(0,1fr) auto 22px; gap: 8px; padding: 11px 0; align-items: center; border-bottom: 1px solid #edf1ee; }
.meal-icon { display: grid; height: 32px; background: #f1f7f3; border-radius: 8px; place-items: center; }
.selected-list strong, .selected-list small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-list strong { font-size: 13px; }
.selected-list small { margin-top: 3px; color: #8b958f; font-size: 11px; }
.selected-list > li > span { color: #28b96d; font-size: 12px; font-weight: 700; }
.selected-list button { color: #a8b0ab; background: transparent; border: 0; font-size: 20px; cursor: pointer; }
.meal-summary { padding: 14px 0 12px; border-top: 1px solid #e7ece9; }
.meal-summary > div { display: flex; justify-content: space-between; padding: 4px 0; color: #758078; font-size: 13px; }
.meal-summary .summary-total { padding-top: 9px; margin-top: 6px; color: #253029; border-top: 1px dashed #dce4df; font-size: 17px; }
.summary-total strong:last-child { color: #2abb6e; }
.save-button { width: 100%; min-height: 46px; }
.clear-button { display: block; margin: 10px auto 0; color: #9a6b6b; background: transparent; border: 0; font-size: 12px; cursor: pointer; }
@media (max-width: 1050px) {
  .hero-content { grid-template-columns: 1fr; }
  .nutrition-card { display: grid; grid-template-columns: 1fr 180px 1.4fr; gap: 22px; align-items: center; }
  .nutrition-card h2, .progress-ring { margin: 0; }
  .dashboard-section { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .hero-section { padding: 35px 4% 38px; }
  .hero-copy h1 { font-size: 36px; }
  .calculator-row { grid-template-columns: 1fr 1fr; }
  .food-search, .calculate-button { grid-column: 1/-1; min-height: 47px; }
  .nutrition-card { display: block; }
  .nutrition-card h2 { margin-bottom: 20px; }
  .progress-ring { margin: 0 auto 24px; }
  .recommendation-grid { grid-template-columns: 1fr; }
  .food-photo { height: 230px; }
  .section-heading { align-items: flex-start; flex-direction: column; padding: 20px 0 15px; }
}
@media (max-width: 460px) {
  .calculator-row { grid-template-columns: 1fr; }
  .food-search, .calculate-button { grid-column: auto; }
  .preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dashboard-section { width: 92%; }
}
</style>
