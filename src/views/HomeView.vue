<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../auth.js'
import foods from '../data/foods.json'
import mealPhoto from '../assets/healthy-meals.png'

const STORAGE_KEY = 'calorie-meals'
const DEFAULT_CALORIE_TARGET = 2000
const RESTAURANT_URL = 'https://theproteinbox.com.tw/'
const router = useRouter()
const { isLoggedIn, dailyCalorieTarget } = useAuth()
const calorieTarget = computed(() => Number(dailyCalorieTarget.value) || DEFAULT_CALORIE_TARGET)
const mealTypes = ['早餐', '午餐', '晚餐']
const foodDatabase = ref(foods)
const searchQuery = ref('')
const selectedFoodName = ref('')
const activeCategory = ref('全部')
const inputWeight = ref(100)
const activeMeal = ref('午餐')
const dropdownOpen = ref(false)
const mealDropdownOpen = ref(false)
const calculatorCard = ref(null)
const showClearConfirm = ref(false)
const showSaveSuccess = ref(false)
const selectionDatePicker = ref(null)
const mealDateCalendarOpen = ref(false)
const meals = ref({ 早餐: [], 午餐: [], 晚餐: [] })

const recommendations = [
  { name: '雞胸肉(去皮)', title: '低卡舒肥雞胸肉餐盒', description: '高蛋白、低脂肪，搭配蔬菜與優質澱粉。', weight: 180, position: 'left' },
  { name: '鮭魚', title: '煙燻鮭魚藜麥溫沙拉', description: '鮭魚好油脂搭配藜麥，營養均衡有飽足感。', weight: 180, position: 'center' },
  { name: '牛排(沙朗)', title: '厚切嫩煎牛肉高纖燕麥碗', description: '豐富蛋白質搭配蔬菜，適合運動後補充。', weight: 180, position: 'right' }
]

const today = new Date()
const todayDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const mealDate = ref(todayDateKey)
const mealDateCalendarMonth = ref(todayDateKey.slice(0, 7))
const mealDateLabel = computed(() => mealDate.value.replaceAll('-', '/'))
const mealDateCalendarTitle = computed(() => {
  const [year, month] = mealDateCalendarMonth.value.split('-').map(Number)
  return `${year} 年 ${month} 月`
})
const mealDateCalendarDays = computed(() => {
  const [year, month] = mealDateCalendarMonth.value.split('-').map(Number)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const dayCount = new Date(year, month, 0).getDate()
  const days = Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}`, empty: true }))
  for (let day = 1; day <= dayCount; day += 1) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({ key, day, disabled: key > todayDateKey })
  }
  return days
})

const toggleMealDateCalendar = () => {
  mealDateCalendarMonth.value = mealDate.value.slice(0, 7)
  mealDateCalendarOpen.value = !mealDateCalendarOpen.value
}

const changeMealDateCalendarMonth = offset => {
  const [year, month] = mealDateCalendarMonth.value.split('-').map(Number)
  const nextMonth = new Date(year, month - 1 + offset, 1)
  const nextMonthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
  if (nextMonthKey > todayDateKey.slice(0, 7)) return
  mealDateCalendarMonth.value = nextMonthKey
}

const selectMealDate = day => {
  if (day.disabled) return
  mealDate.value = day.key
  mealDateCalendarOpen.value = false
}

const foodCategories = computed(() => ['全部', ...new Set(foodDatabase.value.map(food => food.category))])
const categoryIcons = {
  全部: 'bi-grid-fill',
  全穀雜糧類: 'bi-circle-fill',
  肉類與蛋類: 'bi-egg-fried',
  海鮮類: 'bi-water',
  蔬菜類: 'bi-flower1',
  水果類: 'bi-apple'
}

const filteredFoods = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  return foodDatabase.value.filter(food => {
    const matchesCategory = activeCategory.value === '全部' || food.category === activeCategory.value
    const matchesKeyword = !keyword || food.name.toLowerCase().includes(keyword)
    return matchesCategory && matchesKeyword
  })
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

const selectCategory = category => {
  activeCategory.value = category
  searchQuery.value = ''
  selectedFoodName.value = ''
  mealDropdownOpen.value = false
  dropdownOpen.value = true
}

const toggleSearchDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) mealDropdownOpen.value = false
}

const handleSearchInput = () => {
  selectedFoodName.value = ''
  dropdownOpen.value = true
  mealDropdownOpen.value = false
}

const closeDropdowns = () => {
  dropdownOpen.value = false
  mealDropdownOpen.value = false
}

const handleOutsideClick = event => {
  if (!calculatorCard.value?.contains(event.target)) closeDropdowns()
  if (!selectionDatePicker.value?.contains(event.target)) mealDateCalendarOpen.value = false
}

const toggleMealDropdown = () => {
  mealDropdownOpen.value = !mealDropdownOpen.value
  if (mealDropdownOpen.value) dropdownOpen.value = false
}

const selectMealType = mealType => {
  activeMeal.value = mealType
  mealDropdownOpen.value = false
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
const calorieProgress = computed(() => Math.min(100, Math.round((totalMealCalories.value / calorieTarget.value) * 100)))
const calorieStatus = computed(() => {
  const difference = totalMealCalories.value - calorieTarget.value
  if (difference > 0) {
    return { type: 'over', text: `⚠️ 今日已超出熱量 ${difference.toLocaleString()} kcal` }
  }
  if (difference === 0) {
    return { type: 'reached', text: '🎉 恭喜！今日熱量目標已達成' }
  }
  return { type: 'deficit', text: `目前熱量赤字 ${Math.abs(difference).toLocaleString()} kcal` }
})
const ringStyle = computed(() => ({
  background: `conic-gradient(${totalMealCalories.value > calorieTarget.value ? '#ef4444' : '#37c77a'} ${calorieProgress.value * 3.6}deg, #edf2ef 0deg)`
}))
const macroWidth = (value, target) => `${Math.min(100, Math.round((value / target) * 100))}%`
const recommendationNutrition = item => {
  const food = foodDatabase.value.find(foodItem => foodItem.name === item.name)
  return food ? Math.round(food.calories * (item.weight / 100)) : 0
}

const clearAllMeals = () => {
  showClearConfirm.value = true
}

const confirmClearAllMeals = () => {
  meals.value = { 早餐: [], 午餐: [], 晚餐: [] }
  localStorage.removeItem(STORAGE_KEY)
  showClearConfirm.value = false
}

const saveMeals = () => {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/' } })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals.value))
  const records = JSON.parse(localStorage.getItem('calorie-records') || '[]')
  const [year, month, day] = mealDate.value.split('-').map(Number)
  const now = new Date()
  const selectedDateTime = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds())
  records.unshift({ id: Date.now(), savedAt: selectedDateTime.toISOString(), meals: JSON.parse(JSON.stringify(meals.value)) })
  localStorage.setItem('calorie-records', JSON.stringify(records))
  showSaveSuccess.value = true
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
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

onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <main class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-copy">
          <span class="ai-tag"><i class="bi bi-stars" aria-hidden="true"></i>AI 智慧熱量管家</span>
          <h1>吃得聰明，<em>卡路里</em>幫您精準計算</h1>
          <p>輸入您今天享用的食物，讓 AI 技術幫您快速掌握熱量與營養素組成。</p>

          <div ref="calculatorCard" class="calculator-card" @keydown.esc="closeDropdowns">
            <h2><i class="bi bi-search" aria-hidden="true"></i>快速估算食物熱量</h2>
            <div class="calculator-row">
              <div class="food-search">
                <input v-model="searchQuery" type="text" placeholder="輸入食物名稱，例如：鮭魚"
                  @click="toggleSearchDropdown" @input="handleSearchInput" @keyup.enter="addCurrentFood" />
                <Transition name="search-dropdown">
                  <div v-if="dropdownOpen" class="search-results">
                    <button v-for="food in filteredFoods" :key="food.name" type="button" @click="selectSearchResult(food)">
                      <span>{{ food.name }}</span><small>{{ food.calories }} kcal / 100g</small>
                    </button>
                    <p v-if="filteredFoods.length === 0">找不到符合的食物</p>
                  </div>
                </Transition>
              </div>
              <label class="weight-field">
                <input v-model.number="inputWeight" type="number" min="1" /><span>公克</span>
              </label>
              <div class="meal-select">
                <button class="meal-select-trigger" type="button" :aria-expanded="mealDropdownOpen" aria-label="選擇餐別"
                  @click="toggleMealDropdown">
                  <span>{{ activeMeal }}</span><i class="bi bi-chevron-down" aria-hidden="true"></i>
                </button>
                <Transition name="search-dropdown">
                  <div v-if="mealDropdownOpen" class="search-results meal-options">
                    <button v-for="mealType in mealTypes" :key="mealType" type="button" @click="selectMealType(mealType)">
                      <span>{{ mealType }}</span><i v-if="activeMeal === mealType" class="bi bi-check2" aria-hidden="true"></i>
                    </button>
                  </div>
                </Transition>
              </div>
              <button class="calculate-button" type="button" :disabled="!currentSelectedFood || inputWeight <= 0" @click="addCurrentFood">
                計算並加入
              </button>
            </div>
            <div class="category-filter" aria-label="食物分類">
              <span>快速分類</span>
              <button v-for="category in foodCategories" :key="category" type="button"
                :class="{ active: activeCategory === category }" :aria-pressed="activeCategory === category"
                @click="selectCategory(category)">
                <i class="bi" :class="categoryIcons[category]" aria-hidden="true"></i>{{ category }}
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
              <span>目標：{{ calorieTarget.toLocaleString() }} kcal</span>
            </div>
          </div>
          <p class="calorie-status" :class="calorieStatus.type">{{ calorieStatus.text }}</p>
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
          <h2><i class="bi bi-leaf-fill" aria-hidden="true"></i>本週推薦健康餐計畫</h2>
          <span>點擊「前往選購」查看健康餐廳餐點</span>
        </div>
        <div class="recommendation-grid">
          <article v-for="item in recommendations" :key="item.name" class="food-card">
            <div class="food-photo" :class="`photo-${item.position}`" :style="{ backgroundImage: `url(${mealPhoto})` }"></div>
            <div class="food-card-body">
              <div class="food-meta"><span>{{ recommendationNutrition(item) }} kcal</span><small><i class="bi bi-star-fill" aria-hidden="true"></i>4.8</small></div>
              <h3>{{ item.title }}</h3><p>{{ item.description }}</p>
            </div>
            <div class="food-card-footer">
              <strong>{{ item.weight }}g</strong>
              <a :href="RESTAURANT_URL" target="_blank" rel="noopener noreferrer" :aria-label="`前往餐廳選購${item.title}`">
                <span>前往選購</span><i class="bi bi-arrow-up-right" aria-hidden="true"></i>
              </a>
            </div>
          </article>
        </div>
      </div>

      <aside class="selection-panel">
        <div class="selection-title"><h2><i class="bi bi-cart3" aria-hidden="true"></i>已選飲食清單</h2><span>{{ selectedItems.length }}</span></div>
        <div ref="selectionDatePicker" class="selection-date">
          <span><i class="bi bi-calendar3" aria-hidden="true"></i>紀錄日期</span>
          <button type="button" class="meal-date-trigger" :aria-expanded="mealDateCalendarOpen" @click="toggleMealDateCalendar">
            <span>{{ mealDateLabel }}</span><i class="bi bi-chevron-down" aria-hidden="true"></i>
          </button>
          <div v-if="mealDateCalendarOpen" class="meal-date-calendar">
            <div class="meal-calendar-head">
              <button type="button" aria-label="上個月" @click="changeMealDateCalendarMonth(-1)"><i class="bi bi-chevron-left"></i></button>
              <strong>{{ mealDateCalendarTitle }}</strong>
              <button type="button" aria-label="下個月" :disabled="mealDateCalendarMonth >= todayDateKey.slice(0, 7)" @click="changeMealDateCalendarMonth(1)"><i class="bi bi-chevron-right"></i></button>
            </div>
            <div class="meal-calendar-weekdays"><span v-for="weekday in ['日','一','二','三','四','五','六']" :key="weekday">{{ weekday }}</span></div>
            <div class="meal-calendar-grid">
              <template v-for="day in mealDateCalendarDays" :key="day.key">
                <span v-if="day.empty" class="meal-calendar-empty"></span>
                <button v-else type="button" :disabled="day.disabled" :class="{ selected: day.key === mealDate }" @click="selectMealDate(day)">{{ day.day }}</button>
              </template>
            </div>
          </div>
        </div>
        <div v-if="selectedItems.length === 0" class="empty-selection">
          <i class="bi bi-basket2 empty-icon" aria-hidden="true"></i><p>尚未加入食物<br />從上方搜尋或推薦餐點開始吧！</p>
        </div>
        <div v-else class="meal-group-list">
          <article v-for="mealType in mealTypes" :key="mealType" class="meal-group-card">
            <header>
              <div class="meal-icon"><i :class="mealType === '早餐' ? 'bi bi-sun-fill' : mealType === '午餐' ? 'bi bi-leaf-fill' : 'bi bi-moon-stars-fill'" aria-hidden="true"></i></div>
              <div>
                <h3>{{ mealType }}</h3>
                <span>{{ meals[mealType].length }} 項 · {{ getMealSummary(mealType).calories }} kcal</span>
              </div>
            </header>
            <p v-if="meals[mealType].length === 0" class="meal-group-empty">此餐別尚未加入食物</p>
            <ul v-else class="meal-group-items">
              <li v-for="(item, index) in meals[mealType]" :key="`${mealType}-${index}-${item.name}`">
                <div><strong>{{ item.name }}</strong><small>{{ item.weight_g }}g</small></div>
                <span>{{ item.calories }} kcal</span>
                <button type="button" :aria-label="`從${mealType}刪除${item.name}`" @click="removeFoodFromMeal(mealType, index)"><i class="bi bi-trash3" aria-hidden="true"></i></button>
              </li>
            </ul>
          </article>
        </div>
        <div class="meal-summary">
          <div v-for="mealType in mealTypes" :key="mealType">
            <span>{{ mealType }}（{{ meals[mealType].length }} 項）</span><b>{{ getMealSummary(mealType).calories }} kcal</b>
          </div>
          <div class="summary-total"><strong>今日總計</strong><strong>{{ totalMealCalories }} kcal</strong></div>
        </div>
        <button class="save-button" type="button" :disabled="selectedItems.length === 0 || !mealDate" @click="saveMeals">儲存今日飲食紀錄</button>
        <button v-if="selectedItems.length" class="clear-button" type="button" @click="clearAllMeals">清空清單</button>
      </aside>
    </section>

    <Teleport to="body">
      <div v-if="showClearConfirm" class="clear-confirm-overlay" @click.self="showClearConfirm = false" @keydown.esc="showClearConfirm = false">
        <section class="clear-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="meal-clear-title" aria-describedby="meal-clear-description" tabindex="-1">
          <div class="clear-confirm-icon"><i class="bi bi-trash3" aria-hidden="true"></i></div>
          <h3 id="meal-clear-title">清空今日飲食清單？</h3>
          <p id="meal-clear-description">清空後將無法復原<br />確定要移除今天加入的所有餐點嗎？</p>
          <div class="clear-confirm-actions">
            <button type="button" class="clear-cancel" @click="showClearConfirm = false">取消</button>
            <button type="button" class="clear-confirm" @click="confirmClearAllMeals">確認清空</button>
          </div>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showSaveSuccess" class="clear-confirm-overlay" @click.self="showSaveSuccess = false" @keydown.esc="showSaveSuccess = false">
        <section class="clear-confirm-dialog" role="status" aria-modal="true" aria-labelledby="save-success-title" tabindex="-1">
          <div class="clear-confirm-icon save-success-icon"><i class="bi bi-check2" aria-hidden="true"></i></div>
          <h3 id="save-success-title">儲存成功</h3>
          <p>可前往會員中心查看。</p>
          <div class="save-success-action">
            <button type="button" class="clear-confirm" @click="showSaveSuccess = false">知道了</button>
          </div>
        </section>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.home-page { min-height: 100vh; color: #202824; background: #f9fbfa; }
.hero-section {
  position: relative; overflow: visible; padding: 60px 5% 56px;
  background-image: url('../assets/hero-section.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.hero-section::before, .hero-section::after { display: none; }
.hero-content { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0,1.65fr) minmax(310px,.85fr); gap: 46px; width: min(1280px,100%); margin: 0 auto; align-items: center; }
.ai-tag { display: inline-flex; gap: 7px; padding: 8px 15px; color: #24ad68; background: rgba(255,255,255,.72); border-radius: 999px; font-size: 14px; font-weight: 700; align-items: center; }
.hero-copy h1 { max-width: 780px; margin: 24px 0 14px; color: #163a2b; font-size: clamp(34px,4vw,52px); line-height: 1.18; letter-spacing: -2px; text-shadow: 0 1px 8px rgba(255,255,255,.9); }
.hero-copy h1 em { color: #1ca862; font-style: normal; }
.hero-copy > p { margin: 0 0 27px; color: #3f564b; font-size: 17px; font-weight: 500; line-height: 1.7; text-shadow: 0 1px 6px rgba(255,255,255,.95); }
.calculator-card { position: relative; z-index: 2; padding: 23px 24px; background: rgba(255,255,255,.96); border-radius: 17px; box-shadow: 0 16px 40px rgba(61,92,71,.08); }
.calculator-card h2 { display: flex; gap: 8px; margin: 0 0 14px; font-size: 16px; align-items: center; }
.calculator-row { display: grid; grid-template-columns: minmax(220px,1fr) 112px 105px 126px; gap: 10px; align-items: start; }
.calculator-row input, .meal-select-trigger { width: 100%; height: 47px; padding: 0 13px; color: #2e3732; background: #fff; border: 1px solid #dce4df; border-radius: 9px; outline: none; }
.calculator-row input:focus, .meal-select-trigger:focus, .meal-select-trigger[aria-expanded="true"] { border-color: #FAAC9A; box-shadow: none; }
.food-search { position: relative; }
.search-results { position: absolute; z-index: 30; top: 100%; right: 0; left: 0; overflow: hidden auto; max-height: 270px; margin-top: 6px; background: #fff; border: 1px solid #dce4df; border-radius: 10px; box-shadow: 0 14px 35px rgba(38,64,49,.16); }
.search-results button { display: flex; justify-content: space-between; width: 100%; padding: 11px 13px; color: #2e3732; background: #fff; border: 0; border-bottom: 1px solid #eef2ef; cursor: pointer; }
.search-results button:hover { color: #8b5144; background: #fff0ec; }
.search-results small, .search-results p { color: #8b9790; }
.search-results p { padding: 12px; margin: 0; }
.meal-select { position: relative; min-width: 0; }
.meal-select-trigger { display: flex; justify-content: space-between; cursor: pointer; align-items: center; }
.meal-select-trigger i { color: #89958e; font-size: 12px; transition: transform .2s ease; }
.meal-select-trigger[aria-expanded="true"] i { transform: rotate(180deg); }
.meal-options button { align-items: center; }
.meal-options button i { color: #29ad69; font-size: 16px; }
.search-dropdown-enter-active, .search-dropdown-leave-active { transition: none; }
.weight-field { position: relative; }
.weight-field input { padding-right: 42px; }
.weight-field span { position: absolute; top: 14px; right: 11px; color: #8c9690; font-size: 13px; }
.calculate-button, .save-button { color: #fff; background: #AAC0AF; border: 0; border-radius: 9px; font-weight: 700; cursor: pointer; }
.calculate-button { height: 47px; }
.calculate-button:hover:not(:disabled), .save-button:hover:not(:disabled) { background: #FAAC9A; transform: translateY(-1px); }
.category-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; align-items: center; }
.category-filter > span { margin-right: 2px; color: #66756d; font-size: 13px; font-weight: 700; }
.category-filter button { display: inline-flex; gap: 6px; min-height: 32px; padding: 0 11px; color: #607068; background: #f5f8f6; border: 1px solid #dce5df; border-radius: 999px; font-size: 12px; cursor: pointer; align-items: center; }
.category-filter button:hover { color: #238c59; background: #edf8f2; border-color: #a9d8bf; }
.category-filter button.active { color: #fff; background: #35b873; border-color: #35b873; box-shadow: 0 4px 12px rgba(53,184,115,.2); }
.preview-row { display: flex; flex-wrap: wrap; gap: 25px; margin-top: 18px; color: #727d76; font-size: 14px; }
.preview-row strong { color: #2bc171; font-size: 20px; }
.preview-row b { color: #2c342f; }
.nutrition-card { padding: 30px 31px 27px; background: rgba(255,255,255,.96); border-radius: 24px; box-shadow: 0 18px 45px rgba(61,92,71,.09); }
.nutrition-card h2 { margin: 0 0 22px; text-align: center; font-size: 19px; }
.progress-ring { display: grid; width: 180px; height: 180px; margin: 0 auto 25px; place-items: center; border-radius: 50%; }
.ring-center { display: grid; width: 145px; height: 145px; background: #fff; border-radius: 50%; place-content: center; text-align: center; }
.ring-center strong { font-size: 32px; line-height: 1.1; }
.ring-center span { margin-top: 5px; color: #7e8983; font-size: 12px; }
.calorie-status { margin: -8px 0 22px; padding: 9px 12px; border-radius: 9px; text-align: center; font-size: 13px; font-weight: 700; }
.calorie-status.deficit { color: #657a6b; background: #eef3ef; }
.calorie-status.reached { color: #79553f; background: #fff0ec; }
.calorie-status.over { color: #c43d3d; background: #fff0f0; }
.macro-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.macro-stats > div { display: grid; gap: 5px; text-align: center; }
.macro-stats span { color: #7b857f; font-size: 12px; }
.macro-stats strong { font-size: 15px; }
.macro-stats i { overflow: hidden; height: 4px; background: #edf1ef; border-radius: 10px; }
.macro-stats i b { display: block; height: 100%; background: #37c77a; border-radius: inherit; }
.macro-stats > div:first-child i b { background: #ff9d3d; }
.macro-stats > div:last-child i b { background: #4e9cf5; }
.dashboard-section { display: grid; grid-template-columns: minmax(0,1fr); gap: 32px; width: min(1280px,90%); margin: 0 auto; padding: 32px 0 70px; align-items: start; }
.recommendation-area { min-width: 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 64px; }
.section-heading h2 { display: flex; gap: 9px; margin: 0; font-size: 23px; align-items: center; }
.section-heading h2 i { color: #2abb6e; }
.section-heading span { color: #2fba70; font-size: 13px; }
.recommendation-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 22px; }
.food-card { overflow: hidden; background: #fff; border: 1px solid #e4eae6; border-radius: 17px; box-shadow: 0 8px 24px rgba(47,73,57,.04); }
.food-photo { height: 180px; background-color: #eef3ef; background-repeat: no-repeat; background-size: 300% auto; }
.photo-left { background-position: left center; } .photo-center { background-position: center; } .photo-right { background-position: right center; }
.food-card-body { min-height: 155px; padding: 18px 19px 13px; }
.food-meta { display: flex; justify-content: space-between; align-items: center; }
.food-meta span { padding: 5px 9px; color: #2abb6e; background: #eaf9f1; border-radius: 5px; font-size: 12px; font-weight: 700; }
.food-meta small { display: inline-flex; gap: 4px; color: #2b332e; font-weight: 700; align-items: center; }
.food-meta small i { color: #f0ad32; }
.food-card h3 { margin: 12px 0 6px; font-size: 16px; }
.food-card p { margin: 0; color: #768078; font-size: 13px; line-height: 1.45; }
.food-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 14px 19px; border-top: 1px solid #edf1ee; }
.food-card-footer strong { font-size: 17px; }
.food-card-footer a { display: inline-flex; gap: 7px; min-height: 35px; padding: 0 14px; align-items: center; justify-content: center; color: #fff; background: #AAC0AF; border-radius: 9px; font-size: 13px; font-weight: 700; text-decoration: none; }
.food-card-footer a:hover { background: #FAAC9A; transform: translateY(-1px); }
.selection-panel { order: -1; padding: 23px; background: #fff; border: 1px solid #e0e7e2; border-radius: 20px; }
.selection-title { display: flex; align-items: center; justify-content: space-between; }
.selection-title h2 { display: flex; gap: 8px; margin: 0; font-size: 18px; align-items: center; }
.selection-title h2 i { color: #27b86e; }
.selection-title > span { display: grid; width: 22px; height: 22px; color: #27b86e; background: #e6f8ef; border-radius: 50%; font-size: 12px; font-weight: 700; place-items: center; }
.selection-date { position: relative; display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; color: #748078; font-size: 13px; font-weight: 700; align-items: center; }
.selection-date > span { display: flex; gap: 7px; align-items: center; }
.selection-date i { color: #AAC0AF; }
.meal-date-trigger { box-sizing: border-box; display: flex; justify-content: space-between; gap: 12px; min-width: 148px; height: 38px; padding: 0 11px; color: #33443b; background: #f7faf8; border: 1px solid #dce6df; border-radius: 9px; outline: none; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; align-items: center; }
.meal-date-trigger:hover { border-color: #AAC0AF; }
.meal-date-trigger:focus, .meal-date-trigger[aria-expanded="true"] { background: #fff; border-color: #FAAC9A; box-shadow: 0 0 0 3px rgba(250,172,154,.18); }
.meal-date-trigger > i { color: #829087; font-size: 11px; transition: transform .2s; }
.meal-date-trigger[aria-expanded="true"] > i { transform: rotate(180deg); }
.meal-date-calendar { position: absolute; z-index: 60; top: calc(100% + 8px); right: 0; width: 294px; padding: 16px; color: #33443b; background: #fff; border: 1px solid #dce6df; border-radius: 16px; box-shadow: 0 18px 45px rgba(38,64,49,.18); }
.meal-calendar-head { display: grid; grid-template-columns: 34px 1fr 34px; gap: 8px; align-items: center; }
.meal-calendar-head strong { text-align: center; font-size: 15px; }
.meal-calendar-head button { display: grid; width: 34px; height: 34px; padding: 0; color: #657a6b; background: #eef3ef; border: 0; border-radius: 9px; cursor: pointer; place-items: center; }
.meal-calendar-head button:hover:not(:disabled) { color: #fff; background: #AAC0AF; }
.meal-calendar-head button:disabled { opacity: .35; cursor: not-allowed; }
.meal-calendar-weekdays, .meal-calendar-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
.meal-calendar-weekdays { width: 100%; margin: 14px 0 6px; color: #939d97; font-size: 11px; text-align: center; }
.meal-calendar-grid { width: 100%; }
.meal-calendar-grid button, .meal-calendar-empty { aspect-ratio: 1; }
.meal-calendar-grid button { padding: 0; color: #45534b; background: transparent; border: 0; border-radius: 9px; font-size: 12px; cursor: pointer; }
.meal-calendar-grid button:hover:not(:disabled) { color: #8b5144; background: #fff0ec; }
.meal-calendar-grid button.selected { color: #fff; background: #AAC0AF; font-weight: 800; }
.meal-calendar-grid button:disabled { color: #cbd1cd; cursor: not-allowed; }
.empty-selection { display: grid; min-height: 120px; color: #8b958f; place-content: center; text-align: center; }
.empty-selection .empty-icon { color: #a7b1ab; font-size: 38px; }
.empty-selection p { margin: 8px 0 0; font-size: 13px; line-height: 1.7; }
.meal-icon { display: grid; height: 32px; color: #35b873; background: #f1f7f3; border-radius: 8px; font-size: 16px; place-items: center; }
.meal-group-list { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; margin: 18px 0; }
.meal-group-card { overflow: hidden; min-width: 0; background: #f8faf9; border: 1px solid #e2e9e4; border-radius: 14px; }
.meal-group-card > header { display: grid; grid-template-columns: 32px minmax(0,1fr); gap: 10px; padding: 13px 14px; background: rgba(170, 192, 175, 0.3); align-items: center; }
.meal-group-card h3 { margin: 0; font-size: 15px; }
.meal-group-card header span { display: block; margin-top: 2px; color: #c43d3d; font-size: 11px; font-weight: 700; }
.meal-group-empty { display: grid; min-height: 82px; margin: 0; color: #9aa49e; font-size: 12px; place-items: center; }
.meal-group-items { max-height: 220px; padding: 4px 13px; margin: 0; overflow-y: auto; list-style: none; }
.meal-group-items li { display: grid; grid-template-columns: minmax(0,1fr) auto 22px; gap: 8px; padding: 11px 0; align-items: center; border-bottom: 1px solid #e4eae6; }
.meal-group-items li:last-child { border-bottom: 0; }
.meal-group-items strong, .meal-group-items small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meal-group-items strong { font-size: 13px; }
.meal-group-items small { margin-top: 3px; color: #8b958f; font-size: 11px; }
.meal-group-items li > span { color: #28b96d; font-size: 12px; font-weight: 700; white-space: nowrap; }
.meal-group-items button { color: #a8b0ab; background: transparent; border: 0; font-size: 20px; cursor: pointer; }
.meal-group-items button:hover { color: #d16b6b; }
.meal-summary { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; padding: 14px 0 12px; border-top: 1px solid #e7ece9; }
.meal-summary > div { display: grid; gap: 4px; padding: 11px 12px; color: #758078; background: #f8faf9; border-radius: 10px; font-size: 13px; }
.meal-summary .summary-total { color: #253029; background: #edf8f2; font-size: 16px; }
.summary-total strong:last-child { color: #2abb6e; }
.save-button { width: 100%; min-height: 46px; }
.clear-button { display: block; margin: 10px auto 0; color: #9a6b6b; background: transparent; border: 0; font-size: 12px; cursor: pointer; }
.clear-confirm-overlay { position: fixed; z-index: 1000; inset: 0; display: grid; padding: 20px; background: rgba(31,41,55,.3); backdrop-filter: blur(3px); place-items: center; }
.clear-confirm-dialog { width: min(390px,100%); padding: 30px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 20px; box-shadow: 0 24px 70px rgba(31,41,55,.2); text-align: center; }
.clear-confirm-icon { display: grid; width: 54px; height: 54px; margin: 0 auto 16px; color: #c43d3d; background: #fff0f0; border-radius: 50%; font-size: 23px; place-items: center; }
.save-success-icon { color: #657a6b; background: #e5e7eb; }
.clear-confirm-dialog h3 { margin: 0 0 9px; color: #163a2b; font-size: 20px; }
.clear-confirm-dialog p { margin: 0; color: #718078; font-size: 14px; line-height: 1.65; }
.clear-confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
.save-success-action { margin-top: 24px; }
.clear-confirm-actions button, .save-success-action button { min-height: 43px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.save-success-action button { width: 100%; }
.clear-cancel { color: #657a6b; background: #eef3ef; border: 1px solid #dce6df; }
.clear-confirm { color: #fff; background: #AAC0AF; border: 1px solid #AAC0AF; }
.clear-cancel:hover { background: #e4ebe6; }
.clear-confirm:hover { background: #FAAC9A; border-color: #FAAC9A; }
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
  .meal-group-list { grid-template-columns: 1fr; }
  .meal-summary { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 460px) {
  .calculator-row { grid-template-columns: 1fr; }
  .food-search, .calculate-button { grid-column: auto; }
  .preview-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .dashboard-section { width: 92%; padding-top: 24px; }
}
</style>
