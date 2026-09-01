<script setup>
import { computed, onBeforeUnmount, ref, onMounted } from 'vue'
import { useAuth } from '../auth.js'

const { getProfile, updateProfile } = useAuth()

const RECORDS_KEY = 'calorie-records'
const DEFAULT_CALORIE_TARGET = 2000
const records = ref([])
const showClearConfirm = ref(false)
const editingProfile = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const profile = ref({ username: '', fullName: '', email: '', phone: '', height: '', weight: '', bmi: '', sex: '', birthDate: '', activity: '', bmr: '', dailyCalories: '' })
const profileDraft = ref({ fullName: '', email: '', phone: '' })
const showBmiCalculator = ref(false)
const bmiForm = ref({ height: '', weight: '', sex: '', birthDate: '', activity: '1.6' })
const bmiError = ref('')
const selectedDate = ref('')
const recordFilter = ref('date')
const calendarOpen = ref(false)
const calendarMonth = ref('')
const datePickerRef = ref(null)
const calorieTarget = computed(() => Number(profile.value.dailyCalories) || DEFAULT_CALORIE_TARGET)

const mealTypes = [
  { key: '早餐', label: '早餐' },
  { key: '午餐', label: '午餐' },
  { key: '晚餐', label: '晚餐' }
]

const loadRecords = () => {
  try {
    records.value = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]')
    if (records.value.length && !selectedDate.value) {
      selectedDate.value = dateKey(records.value[0].savedAt)
      calendarMonth.value = selectedDate.value.slice(0, 7)
    }
  } catch (e) {
    records.value = []
  }
}

const dateKey = savedAt => {
  const date = new Date(savedAt)
  const pad = number => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const filteredRecords = computed(() => {
  const sortedRecords = [...records.value].sort((first, second) => new Date(second.savedAt) - new Date(first.savedAt))
  if (recordFilter.value === 'date') {
    const matchingRecords = selectedDate.value
      ? sortedRecords.filter(record => dateKey(record.savedAt) === selectedDate.value)
      : sortedRecords
    return matchingRecords.slice(0, 1)
  }

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  startDate.setDate(startDate.getDate() - (recordFilter.value === 'week' ? 6 : 29))
  const seenDates = new Set()
  return sortedRecords.filter(record => {
    const recordDate = new Date(record.savedAt)
    const key = dateKey(record.savedAt)
    if (recordDate < startDate || seenDates.has(key)) return false
    seenDates.add(key)
    return true
  })
})

const emptyRecordTitle = computed(() => recordFilter.value === 'date'
  ? '此日期尚無熱量紀錄'
  : recordFilter.value === 'week' ? '近一週尚無熱量紀錄' : '近一個月尚無熱量紀錄'
)

const recordDates = computed(() => records.value.map(record => dateKey(record.savedAt)).sort())
const selectedDateLabel = computed(() => selectedDate.value ? selectedDate.value.replaceAll('-', '/') : '請選擇日期')
const calendarTitle = computed(() => {
  if (!calendarMonth.value) return ''
  const [year, month] = calendarMonth.value.split('-').map(Number)
  return `${year} 年 ${month} 月`
})
const calendarDays = computed(() => {
  if (!calendarMonth.value) return []
  const [year, month] = calendarMonth.value.split('-').map(Number)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const dayCount = new Date(year, month, 0).getDate()
  const days = Array.from({ length: firstWeekday }, (_, index) => ({ key: `empty-${index}`, empty: true }))
  for (let day = 1; day <= dayCount; day += 1) {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({ key, day, hasRecord: recordDates.value.includes(key) })
  }
  return days
})

const toggleCalendar = () => {
  if (!calendarMonth.value) calendarMonth.value = (selectedDate.value || dateKey(new Date())).slice(0, 7)
  calendarOpen.value = !calendarOpen.value
}

const changeCalendarMonth = offset => {
  const [year, month] = calendarMonth.value.split('-').map(Number)
  const nextMonth = new Date(year, month - 1 + offset, 1)
  calendarMonth.value = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
}

const selectCalendarDate = key => {
  selectedDate.value = key
  recordFilter.value = 'date'
  calendarOpen.value = false
}

const closeCalendarOutside = event => {
  if (!datePickerRef.value?.contains(event.target)) calendarOpen.value = false
}

const formatPhoneDisplay = value => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
}

const loadProfile = () => {
  const savedProfile = getProfile()
  if (!savedProfile) return
  profile.value = { ...savedProfile, phone: formatPhoneDisplay(savedProfile.phone) }
}

const startEditingProfile = () => {
  profileDraft.value = { fullName: profile.value.fullName, email: profile.value.email, phone: profile.value.phone }
  profileError.value = ''
  profileSuccess.value = ''
  editingProfile.value = true
}

const formatProfilePhone = event => {
  profileDraft.value.phone = formatPhoneDisplay(event.target.value)
}

const saveProfile = () => {
  profileError.value = ''
  profileSuccess.value = ''
  const phoneDigits = profileDraft.value.phone.replace(/\D/g, '')
  if (profileDraft.value.fullName.trim().length < 2) {
    profileError.value = '請輸入完整姓名'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileDraft.value.email.trim())) {
    profileError.value = '請輸入有效的電子郵件地址'
    return
  }
  if (!/^09\d{8}$/.test(phoneDigits)) {
    profileError.value = '請輸入有效的台灣手機號碼'
    return
  }
  const result = updateProfile(profileDraft.value)
  if (!result.ok) {
    profileError.value = result.message
    return
  }
  loadProfile()
  editingProfile.value = false
  profileSuccess.value = '會員資料已更新'
}

const bmiCategory = bmi => {
  const value = Number(bmi)
  if (value < 18.5) return '體重過輕'
  if (value < 24) return '正常範圍'
  if (value < 27) return '體重過重'
  if (value < 30) return '輕度肥胖'
  if (value < 35) return '中度肥胖'
  return '重度肥胖'
}

const toggleBmiCalculator = () => {
  bmiForm.value = {
    height: profile.value.height || '',
    weight: profile.value.weight || '',
    sex: profile.value.sex || '',
    birthDate: profile.value.birthDate ? profile.value.birthDate.replaceAll('-', '/') : '',
    activity: String(profile.value.activity || '1.6')
  }
  bmiError.value = ''
  showBmiCalculator.value = !showBmiCalculator.value
}

const formatBirthDate = event => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4) {
    bmiForm.value.birthDate = digits
  } else if (digits.length <= 6) {
    bmiForm.value.birthDate = `${digits.slice(0, 4)}/${digits.slice(4)}`
  } else {
    bmiForm.value.birthDate = `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`
  }
}

const calculateAndSaveBmi = () => {
  bmiError.value = ''
  const height = Number(bmiForm.value.height)
  const weight = Number(bmiForm.value.weight)
  const activity = Number(bmiForm.value.activity)
  if (!Number.isFinite(height) || height < 100 || height > 250) {
    bmiError.value = '請輸入 100–250 公分之間的有效身高'
    return
  }
  if (!Number.isFinite(weight) || weight < 20 || weight > 300) {
    bmiError.value = '請輸入 20–300 公斤之間的有效體重'
    return
  }
  if (!['male', 'female'].includes(bmiForm.value.sex)) {
    bmiError.value = '請選擇生理性別，以便估算靜息能量'
    return
  }
  if (!bmiForm.value.birthDate) {
    bmiError.value = '請輸入出生日期'
    return
  }
  const normalizedBirthDate = bmiForm.value.birthDate.replaceAll('/', '-')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) {
    bmiError.value = '出生日期格式應為 YYYY/MM/DD'
    return
  }
  const [birthYear, birthMonth, birthDay] = normalizedBirthDate.split('-').map(Number)
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
  if (birthDate.getFullYear() !== birthYear || birthDate.getMonth() !== birthMonth - 1 || birthDate.getDate() !== birthDay) {
    bmiError.value = '請輸入有效的出生日期'
    return
  }
  const currentDate = new Date()
  let age = currentDate.getFullYear() - birthDate.getFullYear()
  const birthdayPassed = currentDate.getMonth() > birthDate.getMonth() || (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() >= birthDate.getDate())
  if (!birthdayPassed) age -= 1
  if (age < 18 || age > 100) {
    bmiError.value = '此估算功能僅適用於 18 歲以上成人'
    return
  }
  if (!Number.isFinite(activity)) {
    bmiError.value = '請選擇日常活動程度'
    return
  }
  const bmi = Number((weight / ((height / 100) ** 2)).toFixed(1))
  const sexAdjustment = bmiForm.value.sex === 'male' ? 5 : -161
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + sexAdjustment)
  const dailyCalories = Math.round(bmr * activity)
  const result = updateProfile({
    ...profile.value,
    height,
    weight,
    bmi,
    sex: bmiForm.value.sex,
    birthDate: normalizedBirthDate,
    activity,
    bmr,
    dailyCalories
  })
  if (!result.ok) {
    bmiError.value = result.message
    return
  }
  loadProfile()
  showBmiCalculator.value = false
  profileSuccess.value = 'BMI 資料已計算並儲存'
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

const calorieBalance = rec => {
  const difference = totalSummary(rec).calories - calorieTarget.value
  if (difference > 0) return { type: 'over', text: `熱量超標 ${difference} kcal` }
  if (difference < 0) return { type: 'deficit', text: `熱量赤字 ${Math.abs(difference)} kcal` }
  return { type: 'reached', text: '熱量達標' }
}

const formatDate = savedAt => {
  const d = new Date(savedAt)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

const deleteRecord = id => {
  if (!confirm('確定要刪除這筆紀錄嗎？')) return
  records.value = records.value.filter(r => r.id !== id)
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records.value))
}

const clearAll = () => {
  showClearConfirm.value = true
}

const confirmClearAll = () => {
  records.value = []
  localStorage.removeItem(RECORDS_KEY)
  showClearConfirm.value = false
}

onMounted(() => {
  loadProfile()
  loadRecords()
  document.addEventListener('click', closeCalendarOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', closeCalendarOutside))
</script>

<template>
  <main class="records-page">
    <section class="profile-card">
      <div class="profile-card-head">
        <div>
          <h3>會員資料</h3>
        </div>
        <button v-if="!editingProfile" type="button" class="btn-edit-profile" @click="startEditingProfile"><i class="bi bi-pencil" aria-hidden="true"></i>編輯資料</button>
      </div>

      <div v-if="!editingProfile" class="profile-grid">
        <div><span>姓名</span><strong>{{ profile.fullName || '尚未填寫' }}</strong></div>
        <div><span>會員帳號</span><strong>{{ profile.username }}</strong></div>
        <div><span>電子郵件</span><strong>{{ profile.email || '尚未填寫' }}</strong></div>
        <div><span>聯絡電話</span><strong>{{ profile.phone || '尚未填寫' }}</strong></div>
      </div>

      <form v-else class="profile-form" @submit.prevent="saveProfile">
        <label>姓名<input v-model="profileDraft.fullName" type="text" autocomplete="name" /></label>
        <label>會員帳號<input :value="profile.username" type="text" disabled /></label>
        <label>電子郵件<input v-model="profileDraft.email" type="email" autocomplete="email" /></label>
        <label>聯絡電話<input :value="profileDraft.phone" type="tel" inputmode="numeric" maxlength="12" autocomplete="tel" @input="formatProfilePhone" /></label>
        <p v-if="profileError" class="profile-message error">{{ profileError }}</p>
        <div class="profile-actions">
          <button type="button" class="btn-profile-cancel" @click="editingProfile = false">取消</button>
          <button type="submit" class="btn-profile-save">儲存變更</button>
        </div>
      </form>

      <div v-if="!editingProfile" class="bmi-section">
        <div v-if="profile.bmi" class="bmi-summary">
          <div><span>目前 BMI</span><strong>{{ profile.bmi }}</strong></div>
          <b>{{ bmiCategory(profile.bmi) }}</b>
          <small>身高 {{ profile.height }} cm · 體重 {{ profile.weight }} kg</small>
        </div>
        <div v-if="profile.dailyCalories" class="daily-calorie-result">
          <span>每日估算維持熱量</span><strong>{{ Number(profile.dailyCalories).toLocaleString() }} kcal</strong>
          <small>首頁每日目標已同步更新</small>
        </div>
        <button type="button" class="btn-bmi" @click="toggleBmiCalculator"><i class="bi bi-calculator" aria-hidden="true"></i>{{ profile.bmi ? '重新評估 BMI 與熱量' : 'BMI 與熱量評估' }}</button>

        <form v-if="showBmiCalculator" class="bmi-form" @submit.prevent="calculateAndSaveBmi">
          <label>身高（cm）<input v-model.number="bmiForm.height" type="number" min="100" max="250" step="0.1" placeholder="例如 165" /></label>
          <label>體重（kg）<input v-model.number="bmiForm.weight" type="number" min="20" max="300" step="0.1" placeholder="例如 55" /></label>
          <label>生理性別<select v-model="bmiForm.sex"><option value="" disabled>請選擇</option><option value="male">男性</option><option value="female">女性</option></select></label>
          <label>出生日期<input :value="bmiForm.birthDate" type="text" inputmode="numeric" maxlength="10" placeholder="例如 1995/08/20" autocomplete="bday" @input="formatBirthDate" /></label>
          <label class="activity-field">日常活動程度
            <select v-model="bmiForm.activity">
              <option value="1.4">久坐／很少運動</option>
              <option value="1.6">輕度活動</option>
              <option value="1.8">中度活動</option>
              <option value="2.0">高度活動</option>
              <option value="2.2">非常高度活動</option>
            </select>
          </label>
          <p class="bmi-disclaimer">本結果為 18 歲以上成人的估算值，不適用於孕期、哺乳期或特殊疾病的醫療判斷。</p>
          <p v-if="bmiError" class="bmi-error">{{ bmiError }}</p>
          <div class="bmi-actions">
            <button type="button" class="btn-profile-cancel" @click="showBmiCalculator = false">取消</button>
            <button type="submit" class="btn-profile-save">計算並儲存</button>
          </div>
        </form>
      </div>
      <p v-if="profileSuccess" class="profile-message success"><i class="bi bi-check-circle" aria-hidden="true"></i>{{ profileSuccess }}</p>
    </section>

    <div class="page-head">
      <div class="records-heading">
        <h2>我的儲存紀錄</h2>
        <div v-if="records.length" class="record-filters">
          <div ref="datePickerRef" class="date-filter custom-date-picker" :class="{ active: recordFilter === 'date' }">
            <span><i class="bi bi-calendar3" aria-hidden="true"></i>選擇日期</span>
            <button type="button" class="date-trigger" :aria-expanded="calendarOpen" @click="toggleCalendar">
              <span>{{ selectedDateLabel }}</span><i class="bi bi-chevron-down" aria-hidden="true"></i>
            </button>
            <div v-if="calendarOpen" class="calendar-popover">
              <div class="calendar-head">
                <button type="button" aria-label="上個月" @click="changeCalendarMonth(-1)"><i class="bi bi-chevron-left"></i></button>
                <strong>{{ calendarTitle }}</strong>
                <button type="button" aria-label="下個月" @click="changeCalendarMonth(1)"><i class="bi bi-chevron-right"></i></button>
              </div>
              <div class="calendar-weekdays"><span v-for="weekday in ['日','一','二','三','四','五','六']" :key="weekday">{{ weekday }}</span></div>
              <div class="calendar-grid">
                <template v-for="day in calendarDays" :key="day.key">
                  <span v-if="day.empty" class="calendar-empty"></span>
                  <button v-else type="button" :class="{ selected: day.key === selectedDate, recorded: day.hasRecord }" @click="selectCalendarDate(day.key)">{{ day.day }}</button>
                </template>
              </div>
              <p class="calendar-hint"><i></i>有儲存紀錄</p>
            </div>
          </div>
          <div class="quick-range-buttons" aria-label="快速選擇紀錄範圍">
            <button type="button" :class="{ active: recordFilter === 'week' }" @click="recordFilter = 'week'">近一週</button>
            <button type="button" :class="{ active: recordFilter === 'month' }" @click="recordFilter = 'month'">近一個月</button>
          </div>
        </div>
      </div>
      <button v-if="records.length" class="btn-clear-all" @click="clearAll">清除全部</button>
    </div>

    <div v-if="!records.length" class="empty-state">
      <p>尚無儲存紀錄</p>
      <span>回到首頁「儲存今日紀錄」即可產生第一筆資料。</span>
    </div>

    <div v-else-if="!filteredRecords.length" class="empty-state">
      <p>{{ emptyRecordTitle }}</p>
      <span>請選擇其他日期查看已儲存的飲食內容。</span>
    </div>

    <div v-for="rec in filteredRecords" :key="rec.id" class="record-card">
      <div class="record-head">
        <div class="record-title">
          <span class="record-date">{{ formatDate(rec.savedAt) }}</span>
          <span class="calorie-balance" :class="calorieBalance(rec).type">{{ calorieBalance(rec).text }}</span>
        </div>
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

    <Teleport to="body">
      <div v-if="showClearConfirm" class="confirm-overlay" role="presentation" @click.self="showClearConfirm = false" @keydown.esc="showClearConfirm = false">
        <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="clear-dialog-title" aria-describedby="clear-dialog-description" tabindex="-1">
          <h3 id="clear-dialog-title">清除全部紀錄？</h3>
          <p id="clear-dialog-description">清除後將無法復原<br />確定要刪除所有飲食紀錄嗎？</p>
          <div class="confirm-actions">
            <button type="button" class="btn-cancel" @click="showClearConfirm = false">取消</button>
            <button type="button" class="btn-confirm" @click="confirmClearAll">確認清除</button>
          </div>
        </section>
      </div>
    </Teleport>
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
  gap: 18px;
  margin-bottom: 20px;
}

.page-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.records-heading { display: grid; gap: 13px; }
.record-filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
.date-filter { position: relative; display: grid; gap: 7px; color: #657a6b; font-size: 14px; font-weight: 700; }
.date-filter > span { display: flex; gap: 7px; align-items: center; }
.date-filter > span i { color: #AAC0AF; font-size: 15px; }
.date-trigger { box-sizing: border-box; display: flex; justify-content: space-between; width: 210px; height: 46px; padding: 0 14px; color: #33443b; background: #f7faf8; border: 1px solid #dce6df; border-radius: 10px; outline: none; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; transition: border-color .2s, background .2s, box-shadow .2s; align-items: center; }
.date-trigger > i { color: #829087; font-size: 12px; transition: transform .2s; }
.date-trigger[aria-expanded="true"] > i { transform: rotate(180deg); }
.date-filter.active .date-trigger { background: #eef3ef; border-color: #AAC0AF; }
.date-trigger:hover { border-color: #AAC0AF; }
.date-trigger:focus { background: #fff; border-color: #FAAC9A; box-shadow: 0 0 0 3px rgba(250,172,154,.2); }
.calendar-popover { position: absolute; z-index: 60; top: calc(100% + 8px); left: 0; width: 294px; padding: 16px; color: #33443b; background: #fff; border: 1px solid #dce6df; border-radius: 16px; box-shadow: 0 18px 45px rgba(38,64,49,.18); }
.calendar-head { display: grid; grid-template-columns: 34px 1fr 34px; gap: 8px; align-items: center; }
.calendar-head strong { text-align: center; font-size: 15px; }
.calendar-head button { display: grid; width: 34px; height: 34px; padding: 0; color: #657a6b; background: #eef3ef; border: 0; border-radius: 9px; cursor: pointer; place-items: center; }
.calendar-head button:hover { color: #fff; background: #AAC0AF; }
.calendar-weekdays, .calendar-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }
.calendar-weekdays { margin: 14px 0 6px; color: #939d97; font-size: 11px; text-align: center; }
.calendar-grid button, .calendar-empty { aspect-ratio: 1; }
.calendar-grid button { position: relative; padding: 0; color: #45534b; background: transparent; border: 0; border-radius: 9px; font-size: 12px; cursor: pointer; }
.calendar-grid button:hover { color: #8b5144; background: #fff0ec; }
.calendar-grid button.recorded::after { position: absolute; bottom: 4px; left: 50%; width: 4px; height: 4px; background: #AAC0AF; border-radius: 50%; content: ''; transform: translateX(-50%); }
.calendar-grid button.selected { color: #fff; background: #AAC0AF; font-weight: 800; }
.calendar-grid button.selected::after { background: #fff; }
.calendar-hint { display: flex; gap: 6px; margin: 12px 0 0; color: #8a958f; font-size: 10px; align-items: center; }
.calendar-hint i { width: 6px; height: 6px; background: #AAC0AF; border-radius: 50%; }
.quick-range-buttons { display: flex; gap: 8px; }
.quick-range-buttons button { height: 46px; padding: 0 16px; color: #657a6b; background: #eef3ef; border: 1px solid #dce6df; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
.quick-range-buttons button:hover, .quick-range-buttons button.active { color: #fff; background: #AAC0AF; border-color: #AAC0AF; }

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

.profile-card { margin-bottom: 22px; padding: 22px 24px; background: #fff; border: 1px solid #e3e8e5; border-radius: 18px; box-shadow: 0 8px 30px rgba(15,23,42,.06); }
.profile-card-head { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 19px; align-items: center; }
.profile-card h3 { margin: 0; color: #163a2b; font-size: 18px; }
.btn-edit-profile { display: inline-flex; gap: 6px; padding: 8px 13px; color: #657a6b; background: #eef3ef; border: 1px solid #dce6df; border-radius: 9px; font-size: 13px; font-weight: 700; cursor: pointer; align-items: center; }
.btn-edit-profile:hover { color: #fff; background: #AAC0AF; }
.profile-grid, .profile-form { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px 22px; }
.profile-grid > div { min-width: 0; padding: 12px 14px; background: #f7f8f7; border-radius: 10px; }
.profile-grid span { display: block; margin-bottom: 5px; color: #8a958f; font-size: 11px; }
.profile-grid strong { display: block; overflow: hidden; color: #33443b; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.profile-form label { color: #44534b; font-size: 12px; font-weight: 700; }
.profile-form input { box-sizing: border-box; width: 100%; height: 43px; margin-top: 6px; padding: 0 11px; color: #29322d; background: #fff; border: 1px solid #d8dedb; border-radius: 9px; outline: none; font-size: 14px; }
.profile-form input:focus { border-color: #AAC0AF; box-shadow: 0 0 0 3px rgba(170,192,175,.18); }
.profile-form input:disabled { color: #89938d; background: #f1f3f2; cursor: not-allowed; }
.profile-message { grid-column: 1/-1; margin: 0; padding: 9px 11px; border-radius: 8px; font-size: 12px; font-weight: 700; }
.profile-message.error { color: #c43d3d; background: #fff0f0; }
.profile-message.success { display: flex; gap: 6px; margin-top: 13px; color: #657a6b; background: #eef3ef; align-items: center; }
.profile-actions { display: flex; justify-content: flex-end; grid-column: 1/-1; gap: 9px; }
.profile-actions button { min-height: 40px; padding: 0 17px; border-radius: 9px; font-weight: 700; cursor: pointer; }
.btn-profile-cancel { color: #657a6b; background: #eef3ef; border: 1px solid #dce6df; }
.btn-profile-save { color: #fff; background: #AAC0AF; border: 1px solid #AAC0AF; }
.btn-profile-save:hover { background: #FAAC9A; border-color: #FAAC9A; }
.bmi-section { display: grid; gap: 12px; margin-top: 18px; padding-top: 18px; border-top: 1px solid #e9eeeb; }
.btn-bmi { display: inline-flex; justify-self: start; gap: 7px; min-height: 41px; padding: 0 16px; color: #657a6b; background: #eef3ef; border: 1px solid #dce6df; border-radius: 9px; font-size: 13px; font-weight: 800; cursor: pointer; align-items: center; }
.btn-bmi:hover { color: #fff; background: #AAC0AF; }
.bmi-summary { display: grid; grid-template-columns: auto auto 1fr; gap: 10px 14px; padding: 14px 16px; background: #f7f8f7; border-radius: 11px; align-items: center; }
.bmi-summary > div { display: flex; gap: 7px; align-items: baseline; }
.bmi-summary span, .bmi-summary small { color: #7b8780; font-size: 12px; }
.bmi-summary strong { color: #163a2b; font-size: 22px; }
.bmi-summary b { padding: 5px 9px; color: #657a6b; background: #e7eee9; border-radius: 999px; font-size: 11px; }
.bmi-summary small { justify-self: end; }
.daily-calorie-result { display: grid; grid-template-columns: 1fr auto; gap: 4px 14px; padding: 14px 16px; background: #fff0ec; border-radius: 11px; align-items: center; }
.daily-calorie-result span { color: #79553f; font-size: 12px; font-weight: 700; }
.daily-calorie-result strong { color: #c86f5c; font-size: 20px; }
.daily-calorie-result small { grid-column: 1/-1; color: #9a7567; font-size: 10px; }
.bmi-form { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; padding: 16px; background: #f7f8f7; border-radius: 12px; }
.bmi-form label { color: #44534b; font-size: 12px; font-weight: 700; }
.bmi-form input, .bmi-form select { box-sizing: border-box; width: 100%; height: 43px; margin-top: 6px; padding: 0 11px; color: #29322d; background: #fff; border: 1px solid #d8dedb; border-radius: 9px; outline: none; font-family: inherit; font-size: 14px; }
.bmi-form input:focus, .bmi-form select:focus { border-color: #AAC0AF; box-shadow: 0 0 0 3px rgba(170,192,175,.18); }
.activity-field, .bmi-disclaimer { grid-column: 1/-1; }
.bmi-disclaimer { margin: 0; padding: 10px 11px; color: #7b8780; background: #eef3ef; border-radius: 8px; font-size: 10px; line-height: 1.55; }
.bmi-error { grid-column: 1/-1; margin: 0; padding: 9px 11px; color: #c43d3d; background: #fff0f0; border-radius: 8px; font-size: 12px; font-weight: 700; }
.bmi-actions { display: flex; justify-content: flex-end; grid-column: 1/-1; gap: 9px; }
.bmi-actions button { min-height: 40px; padding: 0 17px; border-radius: 9px; font-weight: 700; cursor: pointer; }

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

.record-title { display: flex; flex-wrap: wrap; gap: 9px; align-items: center; }
.calorie-balance { padding: 5px 9px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.calorie-balance.deficit { color: #657a6b; background: #eef3ef; }
.calorie-balance.over { color: #c43d3d; background: #fff0f0; }
.calorie-balance.reached { color: #79553f; background: #fff0ec; }

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

.confirm-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  padding: 20px;
  background: rgba(31, 41, 55, 0.3);
  backdrop-filter: blur(3px);
  place-items: center;
}

.confirm-dialog {
  width: min(390px, 100%);
  padding: 30px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  box-shadow: 0 24px 70px rgba(31, 41, 55, 0.2);
  text-align: center;
}

.confirm-dialog h3 {
  margin: 0 0 9px;
  color: #163a2b;
  font-size: 20px;
}

.confirm-dialog p {
  margin: 0;
  color: #718078;
  font-size: 14px;
  line-height: 1.65;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 24px;
}

.confirm-actions button {
  min-height: 43px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel {
  color: #657a6b;
  background: #eef3ef;
  border: 1px solid #dce6df;
}

.btn-confirm {
  color: #fff;
  background: #AAC0AF;
  border: 1px solid #AAC0AF;
}

.btn-cancel:hover { background: #e4ebe6; }
.btn-confirm:hover { background: #FAAC9A; border-color: #FAAC9A; }

@media (max-width: 600px) {
  .page-head { align-items: flex-start; flex-direction: column; }
  .record-filters { align-items: stretch; flex-direction: column; }
  .date-trigger { width: 100%; }
  .calendar-popover { box-sizing: border-box; width: min(294px,calc(100vw - 60px)); }
  .quick-range-buttons button { flex: 1; }
  .profile-grid, .profile-form { grid-template-columns: 1fr; }
  .profile-message, .profile-actions { grid-column: auto; }
  .bmi-summary { grid-template-columns: 1fr auto; }
  .bmi-summary small { grid-column: 1/-1; justify-self: start; }
  .bmi-form { grid-template-columns: 1fr; }
  .activity-field, .bmi-disclaimer, .bmi-error, .bmi-actions { grid-column: auto; }
  .meals-grid {
    grid-template-columns: 1fr;
  }
}
</style>
