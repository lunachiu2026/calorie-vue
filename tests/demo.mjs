import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const files = [
  'src/data/foods.json',
  'backend/database/foods-additional.json',
  'backend/database/foods-expanded.json'
]
const catalog = files.flatMap(file => JSON.parse(readFileSync(file, 'utf8')))
const names = new Set(catalog.map(food => food.name))
const demoSource = readFileSync('src/demo.js', 'utf8')
const usedNames = [...demoSource.matchAll(/mealItem\('([^']+)'/g)].map(match => match[1])

assert.equal(catalog.length, 241)
assert.equal(names.size, catalog.length, 'Demo catalog requires unique food names')
assert.ok(usedNames.length >= 15)
for (const name of usedNames) assert.ok(names.has(name), `Missing Demo food: ${name}`)
assert.match(demoSource, /calorie-demo-state-v1/)
assert.match(demoSource, /localStorage/)
console.log('PASS: Demo catalog, sample meals and browser-only storage')
