import assert from 'node:assert/strict'
import { spawn, execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:net'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const php = process.env.PHP_BINARY || 'C:\\xampp\\php\\php.exe'
const probe = createServer()
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
const port = probe.address().port
await new Promise(resolve => probe.close(resolve))
const sessionDirectory = mkdtempSync(join(tmpdir(), 'calorie-vue-session-'))
const server = spawn(php, ['-d', `session.save_path=${sessionDirectory}`, '-S', `127.0.0.1:${port}`, '-t', 'backend'], { stdio: 'ignore', windowsHide: true })
let startupError
server.on('error', error => { startupError = error })
const names = ['a', 'b'].map(suffix => `rt_${randomBytes(6).toString('hex')}_${suffix}`)
const passwords = names.map(() => randomBytes(12).toString('hex'))
const session = () => ({ cookie: '', token: '' })
const a = session(), b = session()
async function request(client, path, method = 'GET', body, csrf = true, query = '') {
  const headers = { 'Content-Type': 'application/json', Cookie: client.cookie }
  if (csrf) headers['X-CSRF-Token'] = client.token
  const response = await fetch(`http://127.0.0.1:${port}/api/${path}.php${query}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body)
  })
  const cookie = response.headers.getSetCookie().find(value => value.startsWith('PHPSESSID='))
  if (cookie) client.cookie = cookie.split(';')[0]
  const data = await response.json()
  if (data.csrfToken) client.token = data.csrfToken
  return { status: response.status, ...data }
}
const meals = weight => ({ 早餐: [{ name: '白米飯', weight_g: weight, calories: 99999 }], 午餐: [], 晚餐: [] })
try {
  let ready = false
  for (let i = 0; i < 30; i++) {
    if (startupError) throw startupError
    try { await request(session(), 'me'); ready = true; break } catch { await delay(100) }
  }
  assert.ok(ready, 'API server starts')
  const additions = [
    ...JSON.parse(readFileSync('backend/database/foods-additional.json', 'utf8')),
    ...JSON.parse(readFileSync('backend/database/foods-expanded.json', 'utf8'))
  ]
  assert.equal(additions.length, 160)
  const first = await request(session(), 'foods', 'GET', undefined, true, '?meta=1')
  assert.equal(first.foods.length, 20)
  assert.ok(first.hasMore)
  assert.ok(first.categories.includes('水果類'))
  assert.ok(first.categories.includes('優格類'))
  assert.ok(first.categories.includes('早餐類'))
  assert.ok(first.categories.includes('零食類'))
  assert.equal(first.recommendations.length, 3)
  const catalog = { ...first, foods: [...first.foods] }
  let page = first
  while (page.hasMore) {
    page = await request(session(), 'foods', 'GET', undefined, true, '?after=' + page.nextCursor)
    assert.equal(page.status, 200)
    assert.ok(page.foods.length <= 20)
    catalog.foods.push(...page.foods)
  }
  for (const [query, expected] of [
    ['?q=' + encodeURIComponent('豆腐'), food => food.name.includes('豆腐')],
    ['?category=' + encodeURIComponent('水果類'), food => food.category === '水果類'],
    ['?q=' + encodeURIComponent('奶') + '&category=' + encodeURIComponent('飲料類'), food => food.name.includes('奶') && food.category === '飲料類']
  ]) {
    const result = await request(session(), 'foods', 'GET', undefined, true, query)
    assert.equal(result.status, 200)
    assert.ok(result.foods.length > 0)
    assert.ok(result.foods.every(expected))
  }
  const yogurtSearch = await request(session(), 'foods', 'GET', undefined, true, '?q=' + encodeURIComponent('優格'))
  assert.equal(yogurtSearch.status, 200)
  assert.ok(yogurtSearch.foods.length > 0)
  assert.ok(yogurtSearch.foods.some(food => food.category === '優格類'))
  assert.ok(yogurtSearch.foods.every(food => food.name.includes('優格')))
  const fermentedMilkSearch = await request(session(), 'foods', 'GET', undefined, true, '?q=' + encodeURIComponent('發酵乳'))
  assert.deepEqual(fermentedMilkSearch.foods.map(food => food.name), yogurtSearch.foods.map(food => food.name))
  assert.equal((await request(session(), 'foods', 'GET', undefined, true, '?q=zzzz_no_food')).foods.length, 0)
  assert.equal((await request(session(), 'foods', 'GET', undefined, true, '?q=%25%25')).foods.length, 0, 'LIKE wildcard is literal')
  assert.equal((await request(session(), 'foods', 'GET', undefined, true, '?after=-1')).status, 422)
  assert.equal((await request(session(), 'foods', 'GET', undefined, true, '?q[]=bad')).status, 422)
  assert.equal(catalog.status, 200)
  assert.equal(new Set(catalog.foods.map(food => food.name)).size, catalog.foods.length)
  for (const expected of additions) {
    const actual = catalog.foods.find(food => food.name === expected.name)
    assert.ok(actual, expected.name)
    for (const key of ['calories', 'protein_g', 'fat_g', 'carbs_g', 'source_id']) assert.equal(actual[key], expected[key])
  }
  assert.equal((await request(session(), 'records')).status, 401)
  for (const [index, client] of [a, b].entries()) {
    assert.equal((await request(client, 'register', 'POST', {
      username: names[index], email: `${names[index]}@example.com`, password: passwords[index],
      fullName: '測試會員', phone: '0912345678', acceptedTerms: true
    })).status, 201)
  }
  assert.equal((await request(session(), 'weights')).status, 401)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2026-09-01', weight: 53 }, false)).status, 419)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2026-02-30', weight: 53 })).status, 422)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2099-01-01', weight: 53 })).status, 422)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2026-09-01', weight: -1 })).status, 422)
  const w = await request(a, 'weights', 'PUT', { date: '2026-09-01', weight: 53, user_id: 999999 })
  assert.equal(w.status, 200)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2026-09-01', weight: 52.8 })).id, w.id)
  assert.equal((await request(a, 'weights', 'PUT', { date: '2026-09-02', weight: 51.8 })).status, 200)
  assert.equal((await request(a, 'weights', 'PATCH', { target: 48 })).status, 200)
  assert.equal((await request(a, 'weights', 'PATCH', { target: 0 })).status, 422)
  const weights = await request(a, 'weights')
  assert.equal(weights.records.length, 2)
  assert.equal(weights.records[0].weight, 52.8)
  assert.equal(weights.records[1].weight, 51.8)
  assert.equal(weights.target, 48)
  assert.equal((await request(b, 'weights')).records.length, 0)
  assert.equal((await request(b, 'weights')).target, null)
  assert.equal((await request(b, 'weights', 'DELETE', { id: w.id })).status, 404)
  const weightBrowser = session()
  assert.equal((await request(weightBrowser, 'login', 'POST', { username: names[0], password: passwords[0] })).status, 200)
  assert.equal((await request(weightBrowser, 'weights')).target, 48)
  assert.equal((await request(a, 'weights', 'DELETE', { id: w.id })).status, 200)
  assert.equal((await request(a, 'weights')).records.length, 1)
  const body = { mealDate: '2026-09-01', meals: meals(150) }
  const newFood = additions[0]
  const newRecord = await request(a, 'records', 'PUT', { ...body, meals: { 早餐: [{ name: newFood.name, weight_g: 150, calories: 99999 }] } })
  assert.equal(newRecord.status, 200)
  assert.equal((await request(a, 'records')).records[0].meals.早餐[0].calories, Math.round(newFood.calories * 1.5))
  assert.equal((await request(a, 'records', 'DELETE', { id: newRecord.id })).status, 200)
  assert.equal((await request(a, 'records', 'PUT', body, false)).status, 419)
  assert.equal((await request(a, 'records', 'PUT', { ...body, mealDate: '2026-02-30' })).status, 422)
  assert.equal((await request(a, 'records', 'PUT', { ...body, meals: meals(-1) })).status, 422)
  const saved = await request(a, 'records', 'PUT', body)
  assert.equal(saved.status, 200)
  let result = await request(a, 'records')
  assert.equal(result.records.length, 1)
  assert.equal(result.records[0].meals.早餐[0].calories, 195, 'server calculates nutrition')
  const anotherBrowser = session()
  assert.equal((await request(anotherBrowser, 'login', 'POST', { username: names[0], password: passwords[0] })).status, 200)
  assert.equal((await request(anotherBrowser, 'records')).records[0].id, saved.id, 'new session reads saved record')
  assert.equal((await request(a, 'records', 'PUT', { ...body, meals: meals(-10) })).status, 422)
  assert.equal((await request(a, 'records')).records[0].meals.早餐[0].calories, 195, 'invalid update preserves data')
  assert.equal((await request(b, 'records')).records.length, 0, 'account isolation')
  assert.equal((await request(b, 'records', 'DELETE', { id: saved.id })).status, 404)
  assert.equal((await request(a, 'records', 'PUT', { ...body, meals: meals(200) })).id, saved.id)
  result = await request(a, 'records')
  assert.equal(result.records.length, 1, 'same date updates instead of duplicates')
  assert.equal(result.records[0].meals.早餐.length, 1)
  assert.equal(result.records[0].meals.早餐[0].calories, 260)
  assert.equal((await request(a, 'records', 'PUT', { ...body, mealDate: '2026-09-02' })).status, 200)
  assert.equal((await request(b, 'records', 'PUT', body)).status, 200)
  assert.equal((await request(a, 'records', 'DELETE', { id: saved.id })).status, 200)
  assert.equal((await request(a, 'records')).records.length, 1)
  assert.equal((await request(a, 'records', 'DELETE', { all: true })).status, 200)
  assert.equal((await request(a, 'records')).records.length, 0)
  assert.equal((await request(b, 'records')).records.length, 1, 'clear affects only own account')
  assert.equal((await request(b, 'logout', 'POST')).status, 200)
  assert.equal((await request(b, 'records')).status, 401)
  console.log('PASS: authentication, CSRF, validation, nutrition, persistence, daily updates, account isolation and deletion')
} finally {
  server.kill()
  execFileSync(php, ['backend/database/cleanup-test-users.php'], {
    env: { ...process.env, RECORDS_TEST_USERS: JSON.stringify(names) }, stdio: 'inherit'
  })
  rmSync(sessionDirectory, { recursive: true, force: true })
}
