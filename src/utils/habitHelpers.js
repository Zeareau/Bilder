// filepath: /Users/zeareau/Desktop/BilderV2/bilder/src/utils/habitHelpers.js
export const DEFAULT_HABIT = {
  id: null,
  name: 'Untitled',
  intervalType: 'daily',
  intervalValue: 1,
  createdAt: null,
  startDate: null,
  completions: [],
  completedCount: 0,
  coins: 0,
  difficulty: 'Medium',
  why: '',
  goalType: 'count',
  goalTarget: 0,
}

export function normalizeHabit(h) {
  if (!h || typeof h !== 'object') h = {}
  const now = new Date().toISOString()
  const createdAtRaw = h.createdAt || h.startDate || now
  const createdAtDate = new Date(createdAtRaw)
  const createdAt = !isNaN(createdAtDate.getTime()) ? createdAtDate.toISOString() : now
  const startDateRaw = h.startDate || h.createdAt || now
  const startDateDate = new Date(startDateRaw)
  const startDate = !isNaN(startDateDate.getTime()) ? startDateDate.toISOString() : createdAt

  const intervalValueRaw = Number(h.intervalValue)
  const intervalValue = Number.isFinite(intervalValueRaw) && intervalValueRaw > 0 ? Math.floor(intervalValueRaw) : DEFAULT_HABIT.intervalValue

  const goalTargetRaw = Number(h.goalTarget)
  const goalTarget = Number.isFinite(goalTargetRaw) && goalTargetRaw > 0 ? Math.floor(goalTargetRaw) : 0

  const completedCountRaw = Number(h.completedCount)
  const completionsArray = Array.isArray(h.completions) ? h.completions : []
  const completedCount = Number.isFinite(completedCountRaw) ? Math.max(0, completedCountRaw) : completionsArray.length

  return {
    ...DEFAULT_HABIT,
    ...h,
    id: h.id || DEFAULT_HABIT.id || Math.random().toString(36).slice(2,9),
    name: h.name || DEFAULT_HABIT.name,
    intervalType: h.intervalType || DEFAULT_HABIT.intervalType,
    intervalValue,
    createdAt,
    startDate,
    completions: completionsArray,
    completedCount,
    coins: Number.isFinite(Number(h.coins)) ? Number(h.coins) : 0,
    difficulty: h.difficulty || DEFAULT_HABIT.difficulty,
    why: h.why || DEFAULT_HABIT.why,
    goalType: h.goalType || DEFAULT_HABIT.goalType,
    goalTarget,
  }
}

export function rewardForCompletion(habit) {
  const diff = (habit && habit.difficulty) || 'Medium'
  const map = { Easy: 1, Medium: 2, Hard: 3 }
  return map[diff] || 1
}

export function getGoalProgress(habit) {
  if (!habit) return { count: 0, target: 0, percent: 0 }
  const target = Number(habit.goalTarget || 0)
  const count = Array.isArray(habit.completions) ? habit.completions.length : (habit.completedCount || 0)
  const percent = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 0
  return { count, target, percent }
}

export function truncate(str, n = 80) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function formatDateShort(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString()
  } catch (e) { return iso }
}
