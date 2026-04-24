import React, { useMemo } from 'react'
import * as Lucide from 'lucide-react'

// Simple inline sparkline using SVG
function Sparkline({ points = [], stroke = 'var(--accent)', width = 240, height = 64 }) {
  if (!points || points.length === 0) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = width / Math.max(1, points.length - 1)
  const coords = points.map((p, i) => `${i * step},${height - ((p - min) / range) * height}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <polyline points={coords} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = i * step
        const y = height - ((p - min) / range) * height
        return <circle key={i} cx={x} cy={y} r={2.2} fill={i === points.length - 1 ? stroke : 'rgba(255,255,255,0.12)'} />
      })}
    </svg>
  )
}

function ProgressRing({ percent = 0, size = 120, strokeWidth = 12 }) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.max(0, Math.min(100, percent)) / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="accentGrad" x1="0%" x2="100%">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.9)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle r={r} fill="none" stroke="url(#accentGrad)" strokeWidth={strokeWidth} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90)" />
        <text x="0" y="4" textAnchor="middle" fontSize="20" fill="#fff" style={{ fontWeight: 700 }}>{Math.round(percent)}%</text>
      </g>
    </svg>
  )
}

export default function Stats({ habits = [], calcStreak = () => 0, startOfPeriodKey = () => new Date().toISOString().slice(0,10), totalCoins = 0 }) {
  // defensive copies
  const safeHabits = Array.isArray(habits) ? habits : []

  const totals = useMemo(() => {
    const totalHabits = safeHabits.length
    let totalCompletions = 0
    let bestStreak = 0
    let todayDone = 0
    const last14 = []

    const todayKey = startOfPeriodKey(new Date())

    safeHabits.forEach((h) => {
      const comps = Array.isArray(h.completions) ? h.completions : []
      totalCompletions += comps.length
      const streak = calcStreak(h) || 0
      bestStreak = Math.max(bestStreak, streak)
      // check if habit done today
      const currentKey = startOfPeriodKey(new Date(), h.intervalType, h.intervalValue, h.createdAt)
      const doneToday = comps.some((ts) => {
        try { return startOfPeriodKey(new Date(ts), h.intervalType, h.intervalValue, h.createdAt) === currentKey } catch (e) { return false }
      })
      if (doneToday) todayDone++
    })

    // build a synthetic last 14 days completion numbers across all habits
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = startOfPeriodKey(d)
      let count = 0
      safeHabits.forEach((h) => {
        const comps = Array.isArray(h.completions) ? h.completions : []
        if (comps.some((ts) => {
          try { return startOfPeriodKey(new Date(ts), h.intervalType, h.intervalValue, h.createdAt) === key } catch (e) { return false }
        })) count++
      })
      last14.push(count)
    }

    const completionRate = totalHabits > 0 ? Math.round((totalCompletions / (totalHabits * 14 || 1)) * 100) : 0

    return { totalHabits, totalCompletions, bestStreak, todayDone, last14, completionRate }
  }, [safeHabits, calcStreak, startOfPeriodKey])

  const { totalHabits, totalCompletions, bestStreak, todayDone, last14, completionRate } = totals

  return (
    <div className="space-y-6">

      {/* summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-800 p-3 rounded-lg ring-1 ring-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--accent)' }}><Lucide.Trophy className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-slate-400">Best Streak</div>
            <div className="text-sm font-semibold">{bestStreak} Days</div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg ring-1 ring-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.2), var(--accent))', color: 'var(--accent-contrast)' }}><Lucide.Sparkles className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-slate-400">Today</div>
            <div className="text-sm font-semibold">{todayDone}/{totalHabits} Done</div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg ring-1 ring-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--accent)' }}><Lucide.Coins className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-slate-400">Total Coins</div>
            <div className="text-sm font-semibold">{totalCoins}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg ring-1 ring-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--accent)' }}><Lucide.RefreshCw className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-slate-400">Completions</div>
            <div className="text-sm font-semibold">{totalCompletions}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-3 rounded-lg ring-1 ring-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--accent)' }}><Lucide.Coins className="w-4 h-4" /></div>
          <div>
            <div className="text-xs text-slate-400">Completion Rate</div>
            <div className="text-sm font-semibold">{completionRate}%</div>
          </div>
        </div>
      </div>

      {/* analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today progress */}
        <div className="col-span-1 lg:col-span-1 bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700 flex flex-col items-center gap-3" style={{ background: 'var(--card-bg, #0b1220)', borderColor: 'var(--card-border, rgba(255,255,255,0.04))', borderWidth: 1 }}>
          <div className="w-full flex items-center justify-between">
            <h3 className="text-md font-semibold">Today</h3>
            <div className="text-xs text-slate-400">Progress</div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div>
              <ProgressRing percent={totalHabits ? (todayDone / totalHabits) * 100 : 0} size={120} />
            </div>
            <div className="text-sm text-slate-300 max-w-xs">
              <div className="font-semibold text-lg">{todayDone}/{totalHabits} completed</div>
              <div className="text-xs text-slate-400 mt-2">{todayDone === totalHabits && totalHabits > 0 ? 'All daily habits completed — great job!' : 'Keep going — small wins add up.'}</div>
            </div>
          </div>
        </div>

        {/* Best streaks / distribution */}
        <div className="col-span-1 lg:col-span-1 bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700" style={{ background: 'var(--card-bg, #0b1220)', borderColor: 'var(--card-border, rgba(255,255,255,0.04))' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold">Top Streaks</h3>
            <div className="text-xs text-slate-400">Ranked</div>
          </div>
          <div className="space-y-2" style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 6 }}>
            {safeHabits.length === 0 && <div className="text-slate-400 text-sm">No Habits Yet</div>}
            {safeHabits.slice().sort((a,b) => (calcStreak(b) - calcStreak(a))).slice(0,50).map((h) => (
              <div key={h.id || h.name} className="flex items-center justify-between bg-slate-900 p-2 rounded">
                <div>
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-slate-400">{h.intervalType}{h.intervalType === 'custom' ? `:${h.intervalValue}d` : ''}</div>
                </div>
                <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{calcStreak(h)}d</div>
              </div>
            ))}
          </div>
        </div>

        {/* Last 14 days */}
        <div className="col-span-1 lg:col-span-1 bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700" style={{ background: 'var(--card-bg, #0b1220)', borderColor: 'var(--card-border, rgba(255,255,255,0.04))' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold">Last 14 Days</h3>
            <div className="text-xs text-slate-400">Completions Per Day</div>
          </div>
          <div className="pt-2">
            <Sparkline points={last14} stroke={'var(--accent)'} width={300} height={80} />
            <div className="mt-2 text-xs text-slate-400">Recent Trend: {last14.reduce((a,b)=>a+b,0)} total completions</div>
          </div>
        </div>
      </div>

      {/* Details / habit breakdown */}
      <div className="bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700" style={{ background: 'var(--card-bg, #0b1220)', borderColor: 'var(--card-border, rgba(255,255,255,0.04))' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold">Details</h3>
          <div className="text-xs text-slate-400">Per-Habit Breakdown</div>
        </div>

        {safeHabits.length === 0 && <div className="text-slate-400 p-4">No habits yet, add some to see details here.</div>}

        <div className="space-y-2">
          {safeHabits.map((h) => {
            const comps = Array.isArray(h.completions) ? h.completions : []
            const streak = calcStreak(h)
            const rate = Math.round((comps.length / Math.max(1, 14)) * 100)
            return (
              <div key={h.id || h.name} className="bg-slate-900 p-3 rounded flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-xs text-slate-400">{h.intervalType}{h.intervalType === 'custom' ? `:${h.intervalValue}d` : ''} • {comps.length} completions</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{streak}d</div>
                  <div className="w-40 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${Math.min(100, rate)}%`, background: 'var(--accent)', height: '100%' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
