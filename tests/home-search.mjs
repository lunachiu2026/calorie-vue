import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { computed, ref, watch } from 'vue'

const source = readFileSync('src/views/HomeView.vue', 'utf8').split('<script setup>')[1].split('</script>')[0].replace(/^import .*$/gm, '')
const pending = []
const timers = new Map()
let timerId = 0
let dispose
const create = new Function('computed', 'ref', 'watch', 'onMounted', 'onBeforeUnmount', 'useRouter', 'useAuth', 'apiRequest', 'setTimeout', 'clearTimeout', 'document', source + `\nreturn { handleFoodScroll, loadFoods, searchQuery, activeCategory, foodDatabase, currentSelectedFood, selectSearchResult, calculatedPreview, foodsLoading, recommendationNutrition };`)
const home = create(computed, ref, watch, () => {}, fn => { dispose = fn }, () => ({}), () => ({ isLoggedIn: ref(false), currentUser: ref(''), dailyCalorieTarget: ref(2000) }), path => new Promise((resolve, reject) => pending.push({ path, resolve, reject })), fn => { timers.set(++timerId, fn); return timerId }, id => timers.delete(id), { removeEventListener() {} })
const food = { name: '嫩豆腐', calories: 60, protein_g: 6, fat_g: 2, carbs_g: 3 }
const response = foods => ({ foods, hasMore: false, nextCursor: null })
const flush = async () => { await Promise.resolve(); await Promise.resolve() }
const runTimer = () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(fn => fn()) }
const initial = home.loadFoods()
pending[0].resolve({ ...response([food]), categories: ['豆類及豆製品'], recommendations: [{ name: '鮭魚', calories: 208 }] })
await initial
assert.equal(home.recommendationNutrition({ name: '鮭魚', weight: 180 }), 374)
home.selectSearchResult(food)
assert.equal(home.calculatedPreview.value.calories, 60)
assert.equal(home.currentSelectedFood.value.name, '嫩豆腐')
home.searchQuery.value = '豆'
home.searchQuery.value = '豆腐'
assert.equal(timers.size, 1, 'rapid input produces only one scheduled request')
runTimer()
assert.equal(pending.length, 2)
assert.ok(pending[1].path.includes(encodeURIComponent('豆腐')))
home.searchQuery.value = '奶'
runTimer()
pending[2].resolve(response([{ ...food, name: '低脂鮮乳' }]))
await flush()
pending[1].resolve(response([food]))
await flush()
assert.equal(home.foodDatabase.value[0].name, '低脂鮮乳', 'stale response does not replace newer results')
assert.equal(home.calculatedPreview.value.calories, 60, 'selected nutrition survives search page replacement')
assert.equal(home.recommendationNutrition({ name: '鮭魚', weight: 180 }), 374)
home.activeCategory.value = '水果類'
runTimer()
assert.ok(pending[3].path.includes('category=' + encodeURIComponent('水果類')))
pending[3].reject(new Error('offline'))
await flush()
assert.equal(home.foodsLoading.value, false)
const retry = home.loadFoods()
pending.at(-1).resolve({ ...response([food]), hasMore: true, nextCursor: 20 })
await retry
const beforeScroll = pending.length
home.handleFoodScroll({ currentTarget: { scrollHeight: 1000, scrollTop: 0, clientHeight: 270 } })
assert.equal(pending.length, beforeScroll, 'does not load before reaching bottom')
const bottom = { currentTarget: { scrollHeight: 1000, scrollTop: 710, clientHeight: 270 } }
home.handleFoodScroll(bottom)
home.handleFoodScroll(bottom)
assert.equal(pending.length, beforeScroll + 1, 'repeated scroll events produce only one request')
assert.ok(pending.at(-1).path.includes('after=20'))
pending.at(-1).reject(new Error('offline'))
await flush()
home.handleFoodScroll(bottom)
assert.equal(pending.length, beforeScroll + 1, 'failed load does not retry endlessly')
const retryPage = home.loadFoods(true)
pending.at(-1).resolve(response([{ ...food, name: '第二頁食物' }]))
await retryPage
assert.equal(home.foodDatabase.value.length, 2, 'appends without replacing existing foods')
home.handleFoodScroll(bottom)
assert.equal(pending.length, beforeScroll + 2, 'stops after final page')
home.searchQuery.value = '蘋果'
dispose()
assert.equal(timers.size, 0, 'unmount cancels pending search')
console.log('PASS: debounce, stale responses, selected food, recommendation stability, categories and cleanup')
