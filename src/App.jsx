import React, { useEffect, useMemo, useState } from 'react'
import './App.css'
import * as Lucide from 'lucide-react'
import Builder from './pages/Builder'
import Mark from './pages/Mark'
import Stats from './pages/Stats'
import Shop from './pages/Shop'
import Info from './pages/Info'
import Profile from './components/Profile'
import WelcomeScreen from './components/WelcomeScreen'
import THEMES from './theme'
import { formatInterval } from './utils/format'
import Confetti from './components/Confetti'
import ITEM_MAP from './shop/mapping'
import { rewardForCompletion, normalizeHabit } from './utils/habitHelpers'
import ErrorBoundary from './components/ErrorBoundary'

const Hammer = (props) => (Lucide.Hammer ? <Lucide.Hammer {...props} /> : <span {...props}>🔨</span>)
const Check = (props) => (Lucide.Check ? <Lucide.Check {...props} /> : <span {...props}>✔️</span>)
const CoinsIcon = (props) => (Lucide.Coins ? <Lucide.Coins {...props} /> : <span {...props}>🪙</span>)
const ShopIcon = (props) => (Lucide.ShoppingCart ? <Lucide.ShoppingCart {...props} /> : <span {...props}>🛒</span>)
const InfoIcon = (props) => (Lucide.Info ? <Lucide.Info {...props} /> : (Lucide.Circle ? <Lucide.Circle {...props} /> : <span {...props}>ℹ️</span>))

// helpers...
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7) }
function startOfPeriodKey(date = new Date(), intervalType, intervalValue = 1, createdAt = null) {
  const d = new Date(date)
  if (intervalType === 'daily') return d.toISOString().slice(0, 10)
  if (intervalType === 'weekly') {
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    const dayNum = tmp.getUTCDay() || 7
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7)
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }
  if (intervalType === 'monthly') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  if (intervalType === 'custom') {
    const start = createdAt ? new Date(createdAt) : new Date(0)
    const diffDays = Math.floor((d - start) / 86400000)
    const group = Math.floor(diffDays / Math.max(1, intervalValue))
    return `C-${group}`
  }
  return d.toISOString().slice(0, 10)
}
function calcStreak(habit) {
  const { completions = [], intervalType, intervalValue = 1, createdAt } = habit
  if (!completions.length) return 0
  const keys = new Set(completions.map((ts) => startOfPeriodKey(new Date(ts), intervalType, intervalValue, createdAt)))
  let streak = 0
  let cursorDate = new Date()
  while (true) {
    const key = startOfPeriodKey(cursorDate, intervalType, intervalValue, createdAt)
    if (keys.has(key)) {
      streak++
      if (intervalType === 'daily') cursorDate.setDate(cursorDate.getDate() - 1)
      else if (intervalType === 'weekly') cursorDate.setDate(cursorDate.getDate() - 7)
      else if (intervalType === 'monthly') cursorDate.setMonth(cursorDate.getMonth() - 1)
      else cursorDate.setDate(cursorDate.getDate() - Math.max(1, intervalValue))
    } else break
  }
  return streak
}
function nowKey(habit) { return startOfPeriodKey(new Date(), habit.intervalType, habit.intervalValue, habit.createdAt) }
// confetti now originates from top for a raining effect
function fireConfetti() { confetti({ particleCount: 120, spread: 75, startVelocity: 45, origin: { y: 0 } }) }

export default function App() {
  const [habits, setHabits] = useState(() => { try { const raw = localStorage.getItem('habits_v1'); return raw ? JSON.parse(raw).map(normalizeHabit) : [] } catch (e) { return [] } })
  const [profile, setProfile] = useState(() => { try { const raw = localStorage.getItem('profile_v1'); return raw ? JSON.parse(raw) : { name: 'You', color: '#60A5FA', coins: 0 } } catch (e) { return { name: 'You', color: '#60A5FA', coins: 0 } } })

  useEffect(() => { try { localStorage.setItem('habits_v1', JSON.stringify(habits.map(normalizeHabit))) } catch(e) { console.error('persist habits failed', e) } }, [habits])
  useEffect(() => { localStorage.setItem('profile_v1', JSON.stringify(profile)) }, [profile])

  const [confettiGlobal, setConfettiGlobal] = useState(false)
  function triggerConfetti() {
    setConfettiGlobal(true)
    setTimeout(() => setConfettiGlobal(false), 2300)
  }

  // apply theme CSS variables whenever equipped theme changes
  useEffect(() => {
    const themeId = profile.equipped?.theme
    if (themeId && THEMES && THEMES[themeId]) {
      const t = THEMES[themeId]
      document.documentElement.style.setProperty('--accent', t.accent)
      document.documentElement.style.setProperty('--accent-contrast', t.contrast)
    } else {
      document.documentElement.style.setProperty('--accent', '#10B981')
      document.documentElement.style.setProperty('--accent-contrast', '#000000')
    }

    // apply avatar ring color if equipped
    const avatarRing = profile.equipped?.avatarRing
    if (avatarRing) document.documentElement.style.setProperty('--avatar-ring', avatarRing)
    else document.documentElement.style.removeProperty('--avatar-ring')

    // apply avatar color mapping when equipped
    const avatarColorId = profile.equipped?.avatarColor
    const colorMap = {
      'avatar-color-emerald': '#10B981',
      'avatar-color-emerald-2': '#059669',
      'avatar-color-default': '#60A5FA'
    }
    if (avatarColorId && colorMap[avatarColorId]) document.documentElement.style.setProperty('--avatar-color', colorMap[avatarColorId])
    else if (profile.avatar && profile.avatar.color) document.documentElement.style.setProperty('--avatar-color', profile.avatar.color)
    else document.documentElement.style.setProperty('--avatar-color', '#60A5FA')

    // --- NEW: apply shop ITEM_MAP equipped tokens ---
    try {
      const equipped = profile.equipped || {}
      // reset some variables first
      document.documentElement.style.removeProperty('--card-bg')
      document.documentElement.style.removeProperty('--card-border')
      document.documentElement.style.removeProperty('--card-radius')
      document.documentElement.style.removeProperty('--card-gradient')
      document.documentElement.style.removeProperty('--avatar-aura')

      Object.values(equipped).forEach((itemId) => {
        if (!itemId) return
        const map = ITEM_MAP[itemId]
        if (!map) return
        if (map.vars) {
          Object.entries(map.vars).forEach(([k, v]) => {
            document.documentElement.style.setProperty(k, v)
          })
        }
      })
    } catch (e) { console.error('Failed to apply equipped item vars', e) }

  }, [profile.equipped, profile.avatar])

  // compute active effects for use in confetti/effects
  const activeEffects = useMemo(() => {
    const eq = profile.equipped || {}
    const effects = {}
    Object.values(eq).forEach(id => {
      const m = ITEM_MAP[id]
      if (m && m.type === 'effect') Object.assign(effects, m.effect || {})
    })
    return effects
  }, [profile.equipped])

  const [form, setForm] = useState({ name: '', intervalType: 'daily', intervalValue: 1, difficulty: 'Medium', why: '', startDate: null, goalTarget: 0 })
  const [editingId, setEditingId] = useState(null)

  const [toast, setToast] = useState(null)
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 1800); return () => clearTimeout(t) }, [toast])
  const notify = (msg) => setToast(msg)

  // welcome flow
  const [seenWelcome, setSeenWelcome] = useState(() => !!localStorage.getItem('seen_welcome'))
  const [showWelcome, setShowWelcome] = useState(!seenWelcome)

  function handleContinueFromWelcome(continueExisting) {
    localStorage.setItem('seen_welcome', '1')
    setSeenWelcome(true)
    setShowWelcome(false)
    if (continueExisting) notify('Welcome back!')
    else notify('Let\'s build your first habit')
  }

  // helper to apply updates and normalize habit shapes
  function updateHabits(updater) {
    setHabits((prev) => {
      try {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (!Array.isArray(next)) return prev
        return next.map((h) => normalizeHabit(h))
      } catch (e) {
        console.error('updateHabits failed', e)
        return prev
      }
    })
  }

  const addOrUpdate = () => {
    const name = form.name.trim()
    if (!name) return
    if (editingId) {
      updateHabits((s) => s.map((h) => (h.id === editingId ? normalizeHabit({ ...h, name, intervalType: form.intervalType, intervalValue: Number(form.intervalValue), difficulty: form.difficulty, why: form.why, startDate: form.startDate, goalTarget: form.goalTarget }) : h)))
      setEditingId(null)
      notify('Updated habit')
    } else {
      const newHabit = normalizeHabit({ id: uid(), name, intervalType: form.intervalType, intervalValue: Number(form.intervalValue), createdAt: new Date().toISOString(), startDate: form.startDate || null, completions: [], completedCount: 0, coins: 0, difficulty: form.difficulty || 'Medium', why: form.why || '', goalType: form.goalType || 'count', goalTarget: form.goalTarget || 0 })
      updateHabits((s) => [newHabit, ...s])
      notify('Habit added')
    }
    setForm({ name: '', intervalType: 'daily', intervalValue: 1, difficulty: 'Medium', why: '', startDate: null, goalTarget: 0 })
  }

  const remove = (id) => { if (!confirm('Delete this habit?')) return; setTimeout(()=>{},0); /* keep prompt */ updateHabits((s) => s.filter((h) => h.id !== id)); notify('Habit deleted') }

  const toggleComplete = (id) => {
    updateHabits((s) => s.map((h) => {
      if (h.id !== id) return h
      const key = startOfPeriodKey(new Date(), h.intervalType, h.intervalValue, h.createdAt)
      const has = Array.isArray(h.completions) ? h.completions.some((ts) => startOfPeriodKey(new Date(ts), h.intervalType, h.intervalValue, h.createdAt) === key) : false
      if (has) {
        const newComps = Array.isArray(h.completions) ? h.completions.filter((ts) => startOfPeriodKey(new Date(ts), h.intervalType, h.intervalValue, h.createdAt) !== key) : []
        notify('Marked as not done')
        return normalizeHabit({ ...h, completions: newComps, completedCount: Math.max(0, (h.completedCount||0) - 1) })
      } else {
        const newComps = Array.isArray(h.completions) ? [...h.completions, new Date().toISOString()] : [new Date().toISOString()]
        const temp = normalizeHabit({ ...h, completions: newComps })
        const streak = calcStreak(temp)
        // difficulty-based reward
        const base = rewardForCompletion(temp)
        let coins = (h.coins || 0) + base
        if (streak > 0 && streak % 7 === 0) coins += 5
        notify(['Great!', 'Awesome!', 'Amazing!', 'Nice!', 'Congrats!'][Math.floor(Math.random() * 5)])

        // trigger global confetti overlay
        try { triggerConfetti() } catch (e) { console.error(e) }

        // also increment profile coins for centralization
        setProfile((p) => ({ ...p, coins: (p.coins || 0) + (coins - (h.coins || 0)) }))
        return normalizeHabit({ ...temp, coins, completedCount: (h.completedCount || 0) + 1 })
      }
    }))
  }

  const edit = (id) => { const h = habits.find((x) => x.id === id); if (!h) return; setForm({ name: h.name, intervalType: h.intervalType, intervalValue: h.intervalValue, difficulty: h.difficulty || 'Medium', why: h.why || '', startDate: h.startDate || null, goalTarget: h.goalTarget || 0 }); setEditingId(id); notify('Editing'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const clearAll = () => { if (!confirm('Clear all habits and progress?')) return; updateHabits(() => []); notify('Cleared all') }

  const computed = useMemo(() => habits.map((h) => ({ ...h, streak: calcStreak(h), currentKey: nowKey(h) })), [habits])

  const [page, setPage] = useState('builder')

  // totalCoins from profile centralized
  const totalCoins = profile.coins || habits.reduce((s, h) => s + (h.coins || 0), 0)

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-slate-900 text-slate-100 p-6 transition-all">
      {/* global confetti overlay */}
      <Confetti show={confettiGlobal} />

      {showWelcome && <WelcomeScreen onContinue={handleContinueFromWelcome} />}

      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Hammer className="w-7 h-7 text-amber-400" />
            <div>
              <h1 className="text-3xl font-semibold">Habit Builder</h1>
              <div className="text-s text-slate-400">Build momentum, one habit at a time</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Info utility button now placed left of the coins display */}
            <button onClick={() => { setPage('info'); notify('Info') }} aria-label="Info" className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center" style={{ height: 44 }}>
              <InfoIcon className="w-5 h-5 text-slate-200" />
            </button>

            <div className="flex items-center gap-3 px-4 py-2 rounded bg-slate-800" style={{ minHeight: 44 }}>
              <CoinsIcon className="w-6 h-6 text-amber-300" />
              <div className="text-base font-semibold">{totalCoins}</div>
            </div>

            {/* Shop button placed next to coins on top-right */}
            <button onClick={() => setPage('shop')} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-3" style={{ height: 44 }}>
              <ShopIcon className="w-6 h-6 text-slate-200" />
              <span className="text-base">Shop</span>
            </button>

            <Profile profile={profile} saveProfile={(p) => { setProfile(p); notify('Profile updated') }} stats={{ totalCoins, totalHabits: habits.length, bestStreak: Math.max(0, ...habits.map(h => calcStreak(h))), totalCompletions: habits.reduce((s,h)=> s + (h.coins || 0), 0) }} onExport={() => { const data = { habits, profile }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='habit-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); notify('Export started') }} />
          </div>
        </header>

        <nav className="mb-4">
          <div className="inline-flex rounded bg-slate-800 p-1">
            <button onClick={() => { setPage('builder'); notify('Build') }} style={page === 'builder' ? { background: 'var(--accent)', color: 'var(--accent-contrast)', padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' } : { padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' }} className={`px-3 py-1.5 rounded ${page === 'builder' ? 'shadow-sm' : 'bg-transparent hover:bg-slate-800'} transition`}>Build</button>
            <button onClick={() => { setPage('mark'); notify('Mark') }} style={page === 'mark' ? { background: 'var(--accent)', color: 'var(--accent-contrast)', padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' } : { padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' }} className={`px-3 py-1.5 rounded ${page === 'mark' ? 'shadow-sm' : 'bg-transparent hover:bg-slate-800'} transition`}>Mark</button>
            <button onClick={() => { setPage('stats'); notify('Stats') }} style={page === 'stats' ? { background: 'var(--accent)', color: 'var(--accent-contrast)', padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' } : { padding: 'calc(0.375rem + 1px) calc(0.75rem + 1px)' }} className={`px-3 py-1.5 rounded ${page === 'stats' ? 'shadow-sm' : 'bg-transparent hover:bg-slate-800'} transition`}>Stats</button>
          </div>
        </nav>

        {toast && (
          <div className="fixed right-6 top-6 z-50 bg-slate-800 px-4 py-2 rounded shadow-lg animate-pop">
            {toast}
          </div>
        )}

        {page === 'builder' && (
          <div className="animate-fade">
            <Builder form={form} setForm={setForm} addOrUpdate={addOrUpdate} editingId={editingId} cancelEdit={() => { setEditingId(null); setForm({ name: '', intervalType: 'daily', intervalValue: 1, difficulty: 'Medium', why: '', startDate: null, goalTarget: 0 }) }} hasHabits={habits.length > 0} />

            <main className="space-y-4">
              {computed.length === 0 && (
                <div className="bg-slate-800 p-6 rounded text-center text-slate-400">No habits yet — add one above to get started.</div>
              )}

              <section className="space-y-4">
                {computed.map((h) => {
                  return (
                    <div key={h.id} className="p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row items-start justify-between gap-4 hover:scale-[1.01] transition-transform" style={{ background: 'var(--card-bg, #0b1220)', borderColor: 'var(--card-border, rgba(255,255,255,0.04))' }}>
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-1 rounded-full bg-linear-to-b from-(--accent) to-transparent mt-1" style={{ width: 6 }} />

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-lg font-semibold">{h.name}</div>
                              <div className="text-xs text-slate-400 mt-1">{formatInterval(h.intervalType, h.intervalValue)}</div>
                            </div>

                            <div className="hidden md:flex items-center gap-3">
                              <div className="text-xs text-slate-400">Streak</div>
                              <div className="px-2 py-1 text-xs font-semibold rounded" style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--accent)' }}>{h.streak}</div>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-slate-400">Coins: <span className="font-semibold text-amber-300">{h.coins || 0}</span></div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <button onClick={() => edit(h.id)} className="px-3 py-2 rounded bg-transparent border border-slate-700 hover:bg-slate-800 transition text-sm flex items-center gap-2">
                          <Check className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => remove(h.id)} className="px-3 py-2 rounded bg-rose-700/10 text-rose-400 border border-rose-700 hover:bg-rose-700/5 transition text-sm">Delete</button>
                      </div>
                    </div>
                  )
                })}
              </section>
            </main>
          </div>
        )}

        {page === 'mark' && <div className="animate-fade"><ErrorBoundary><Mark habits={habits.map(normalizeHabit)} toggleComplete={toggleComplete} startOfPeriodKey={startOfPeriodKey} onCelebrate={() => { try { triggerConfetti() } catch(e){} }} activeEffects={activeEffects} /></ErrorBoundary></div>}
        {page === 'stats' && <div className="animate-fade"><Stats habits={habits} calcStreak={calcStreak} startOfPeriodKey={startOfPeriodKey} totalCoins={totalCoins} /></div>}
        {page === 'shop' && <div className="animate-fade"><Shop profile={{ ...profile, coins: totalCoins }} saveProfile={(p) => { setProfile(p); notify('Profile updated') }} notify={notify} coinIcon={CoinsIcon} /></div>}
        {page === 'info' && <div className="animate-fade"><Info /></div>}
      </div>
    </div>
  )
}