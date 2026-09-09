import baseFoods from './data/foods.json'
import additionalFoods from '../backend/database/foods-additional.json'
import expandedFoods from '../backend/database/foods-expanded.json'

const SESSION_KEY = 'calorie-demo-session-v1'
const STATE_KEY = 'calorie-demo-state-v1'
const mealTypes = ['早餐', '午餐', '晚餐']
const clone = value => JSON.parse(JSON.stringify(value))
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const dateOffset = days => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return localDate(date)
}

const catalog = [...baseFoods, ...additionalFoods, ...expandedFoods].map((food, index) => ({
  ...food,
  id: index + 1,
  weight_g: Number(food.weight_g) || 100,
  calories: Number(food.calories),
  protein_g: Number(food.protein_g),
  fat_g: Number(food.fat_g),
  carbs_g: Number(food.carbs_g)
}))
const catalogByName = new Map(catalog.map(food => [food.name, food]))

const demoError = (message, status = 422) => Object.assign(new Error(message), { status })
const storage = () => typeof window === 'undefined' ? null : window.localStorage

export const isDemoSessionActive = () => {
  try { return storage()?.getItem(SESSION_KEY) === 'active' } catch { return false }
}

const mealItem = (name, weight) => {
  const food = catalogByName.get(name)
  if (!food) throw demoError(`Demo 食物資料缺少：${name}`)
  const ratio = weight / 100
  return {
    name,
    weight_g: weight,
    calories: Math.round(food.calories * ratio),
    protein_g: Number((food.protein_g * ratio).toFixed(1)),
    fat_g: Number((food.fat_g * ratio).toFixed(1)),
    carbs_g: Number((food.carbs_g * ratio).toFixed(1))
  }
}

const meals = (breakfast, lunch, dinner) => ({ 早餐: breakfast, 午餐: lunch, 晚餐: dinner })
const record = (id, daysAgo, entries) => {
  const mealDate = dateOffset(-daysAgo)
  return { id, mealDate, savedAt: `${mealDate}T12:00:00`, meals: entries }
}

const initialState = () => ({
  user: {
    username: 'demo2026',
    fullName: 'Demo 體驗者',
    email: 'demo@example.com',
    phone: '0912345678',
    height: 165,
    weight: 51.8,
    bmi: 19,
    sex: 'female',
    birthDate: '1998-06-18',
    activity: 1.6,
    bmr: 1158,
    dailyCalories: 1853
  },
  records: [
    record(7, 0, meals(
      [mealItem('燕麥片', 40), mealItem('香蕉', 100)],
      [mealItem('雞胸肉(去皮)', 150), mealItem('白米飯', 150), mealItem('綠花椰菜', 100)],
      [mealItem('鮭魚', 120), mealItem('地瓜', 150)]
    )),
    record(6, 1, meals(
      [mealItem('雞蛋', 100), mealItem('土司(含全穀粉)', 60)],
      [mealItem('牛排(沙朗)', 120), mealItem('糙米飯', 150)],
      [mealItem('嫩豆腐', 150), mealItem('高麗菜', 150)]
    )),
    record(5, 2, meals(
      [mealItem('豆漿(無糖)', 300), mealItem('地瓜', 120)],
      [mealItem('雞胸肉(去皮)', 130), mealItem('白米飯', 120)],
      [mealItem('鮭魚', 100), mealItem('綠花椰菜', 180)]
    )),
    record(4, 3, meals(
      [mealItem('燕麥片', 45), mealItem('蘋果', 150)],
      [mealItem('牛排(沙朗)', 100), mealItem('白米飯', 150)],
      [mealItem('雞蛋', 100), mealItem('嫩豆腐', 180)]
    )),
    record(3, 4, meals(
      [mealItem('香蕉', 120), mealItem('豆漿(無糖)', 250)],
      [mealItem('雞胸肉(去皮)', 160), mealItem('糙米飯', 150)],
      [mealItem('鮭魚', 100), mealItem('高麗菜', 200)]
    )),
    record(2, 5, meals(
      [mealItem('土司(含全穀粉)', 70), mealItem('雞蛋', 100)],
      [mealItem('牛排(沙朗)', 130), mealItem('地瓜', 180)],
      [mealItem('嫩豆腐', 200), mealItem('綠花椰菜', 150)]
    )),
    record(1, 6, meals(
      [mealItem('燕麥片', 40), mealItem('蘋果', 120)],
      [mealItem('雞胸肉(去皮)', 150), mealItem('白米飯', 140)],
      [mealItem('鮭魚', 110), mealItem('高麗菜', 180)]
    ))
  ],
  weights: [
    { id: 1, date: dateOffset(-28), weight: 53 },
    { id: 2, date: dateOffset(-21), weight: 52.7 },
    { id: 3, date: dateOffset(-14), weight: 52.4 },
    { id: 4, date: dateOffset(-7), weight: 52.1 },
    { id: 5, date: dateOffset(0), weight: 51.8 }
  ],
  weightTarget: 48
})

const saveState = state => storage()?.setItem(STATE_KEY, JSON.stringify(state))
const loadState = () => {
  try {
    const saved = JSON.parse(storage()?.getItem(STATE_KEY) || 'null')
    if (saved?.user && Array.isArray(saved.records) && Array.isArray(saved.weights)) return saved
  } catch {}
  const state = initialState()
  saveState(state)
  return state
}

export const startDemoSession = (reset = false) => {
  if (reset) storage()?.removeItem(STATE_KEY)
  storage()?.setItem(SESSION_KEY, 'active')
  return clone(loadState().user)
}

export const endDemoSession = () => storage()?.removeItem(SESSION_KEY)

const foodResponse = query => {
  const q = (query.get('q') || '').trim().toLocaleLowerCase('zh-Hant')
  const category = (query.get('category') || '').trim()
  const after = Math.max(0, Number(query.get('after')) || 0)
  const matches = catalog.filter(food => {
    const aliases = food.name.includes('優格') ? ' 發酵乳 優酪乳' : ''
    return food.id > after
      && (!q || `${food.name}${aliases}`.toLocaleLowerCase('zh-Hant').includes(q))
      && (!category || food.category === category)
  })
  const foods = matches.slice(0, 20)
  const response = {
    ok: true,
    foods: clone(foods),
    hasMore: matches.length > 20,
    nextCursor: matches.length > 20 ? foods.at(-1).id : null
  }
  if (query.get('meta') === '1') {
    response.categories = [...new Set(catalog.map(food => food.category))].sort((a, b) => a.localeCompare(b, 'zh-Hant'))
    response.recommendations = clone(['雞胸肉(去皮)', '鮭魚', '牛排(沙朗)'].map(name => catalogByName.get(name)))
  }
  return response
}

const normalizeMeals = source => Object.fromEntries(mealTypes.map(type => [type, (source[type] || []).map(entry => {
  const weight = Number(entry.weight_g)
  if (!Number.isFinite(weight) || weight < 0.01 || weight > 10000) throw demoError('重量須介於 0.01–10000 克')
  return mealItem(entry.name, weight)
})]))

const recordsResponse = (method, body = {}) => {
  const state = loadState()
  if (method === 'GET') return { ok: true, records: clone([...state.records].sort((a, b) => b.mealDate.localeCompare(a.mealDate))) }
  if (method === 'DELETE') {
    if (body.all === true) state.records = []
    else state.records = state.records.filter(item => item.id !== Number(body.id))
    saveState(state)
    return { ok: true }
  }
  const normalized = normalizeMeals(body.meals || {})
  if (!mealTypes.some(type => normalized[type].length)) throw demoError('請至少加入一項食物')
  const existing = state.records.find(item => item.mealDate === body.mealDate)
  const id = existing?.id || Math.max(0, ...state.records.map(item => item.id)) + 1
  const next = { id, mealDate: body.mealDate, savedAt: `${body.mealDate}T12:00:00`, meals: normalized }
  state.records = [...state.records.filter(item => item.mealDate !== body.mealDate), next]
  saveState(state)
  return { ok: true, id }
}

const weightsResponse = (method, body = {}) => {
  const state = loadState()
  if (method === 'GET') return { ok: true, records: clone([...state.weights].sort((a, b) => a.date.localeCompare(b.date))), target: state.weightTarget }
  if (method === 'PATCH') {
    state.weightTarget = Number(body.target)
    saveState(state)
    return { ok: true }
  }
  if (method === 'DELETE') {
    state.weights = state.weights.filter(item => item.id !== Number(body.id))
    saveState(state)
    return { ok: true }
  }
  const existing = state.weights.find(item => item.date === body.date)
  const id = existing?.id || Math.max(0, ...state.weights.map(item => item.id)) + 1
  const next = { id, date: body.date, weight: Number(body.weight) }
  state.weights = [...state.weights.filter(item => item.date !== body.date), next]
  saveState(state)
  return { ok: true, id }
}

export const canHandleDemoRequest = (path, staticPreview = false) => {
  const endpoint = new URL(path, 'https://demo.local/').pathname.split('/').pop()
  return isDemoSessionActive() || (staticPreview && endpoint === 'foods.php')
}

export async function demoApiRequest(path, options = {}) {
  const url = new URL(path, 'https://demo.local/')
  const endpoint = url.pathname.split('/').pop()
  const method = (options.method || 'GET').toUpperCase()
  if (endpoint === 'foods.php') return foodResponse(url.searchParams)
  if (!isDemoSessionActive()) throw demoError('請先進入 Demo 展示帳號', 401)
  if (endpoint === 'me.php') return { ok: true, authenticated: true, demo: true, user: clone(loadState().user) }
  if (endpoint === 'logout.php') { endDemoSession(); return { ok: true, demo: true } }
  if (endpoint === 'profile.php') {
    const state = loadState()
    state.user = { ...state.user, ...(options.body || {}) }
    saveState(state)
    return { ok: true, demo: true, user: clone(state.user) }
  }
  if (endpoint === 'records.php') return recordsResponse(method, options.body)
  if (endpoint === 'weights.php') return weightsResponse(method, options.body)
  throw demoError('Demo 模式不支援此操作', 404)
}
