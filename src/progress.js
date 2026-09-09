export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const round = value => Math.round((value + Number.EPSILON) * 100) / 100
export const remaining = (target, consumed) => ({ remaining: round(Math.max(0, target - consumed)), over: round(Math.max(0, consumed - target)) })
export const macroTargets = calories => ({ protein: calories * 0.2 / 4, carbs: calories * 0.5 / 4, fat: calories * 0.3 / 9 })
export const mealCalories = record => Object.values(record.meals).flat().reduce((sum, food) => sum + Number(food.calories), 0)
export function dailySeries(records, days, today = new Date()) {
  const values = new Map(records.map(record => [record.mealDate || record.savedAt.slice(0, 10), mealCalories(record)]))
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days + index + 1)
    const key = localDate(date)
    return { date: key, value: values.has(key) ? values.get(key) : null }
  })
}
export function recordedAverage(series) {
  const recorded = series.filter(point => point.value !== null)
  return { count: recorded.length, average: recorded.length ? Math.round(recorded.reduce((sum, point) => sum + point.value, 0) / recorded.length) : null }
}
export function weightSummary(records, today = new Date()) {
  const ordered = [...records].sort((a, b) => a.date.localeCompare(b.date))
  const start = ordered[0] || null
  const current = ordered.at(-1) || null
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() + 6) % 7)
  const weekStart = localDate(monday)
  const baseline = ordered.filter(record => record.date < weekStart).at(-1)
  return { start, current, totalChange: start && current ? round(current.weight - start.weight) : null,
    weekChange: baseline && current?.date >= weekStart ? round(current.weight - baseline.weight) : null }
}
