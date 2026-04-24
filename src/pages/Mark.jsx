import React, { useState, useMemo } from 'react'
import * as Lucide from 'lucide-react'
import Confetti from '../components/Confetti'
import { formatInterval } from '../utils/format'
import { getGoalProgress, normalizeHabit, formatDateShort } from '../utils/habitHelpers'

export default function Mark({ habits = [], toggleComplete = () => {}, startOfPeriodKey = (d) => (new Date(d || Date.now()).toISOString().slice(0,10)), onCelebrate = () => {}, activeEffects = {} }) {
  const [confettiShow, setConfettiShow] = useState(false)
  const [pulseId, setPulseId] = useState(null)
  const [expanded, setExpanded] = useState({})

  function handleToggle(id) {
    try {
      const h = (Array.isArray(habits) ? habits : []).find(x => x && x.id === id)
      if (!h) return
      const nh = normalizeHabit(h)
      const comps = Array.isArray(nh.completions) ? nh.completions : []
      const currentKey = typeof startOfPeriodKey === 'function' ? startOfPeriodKey(new Date(), nh.intervalType, nh.intervalValue, nh.createdAt) : new Date().toISOString().slice(0,10)
      const alreadyDone = comps.some((ts) => { try { return startOfPeriodKey(new Date(ts), nh.intervalType, nh.intervalValue, nh.createdAt) === currentKey } catch (e) { return false } })

      toggleComplete && toggleComplete(id)

      // only celebrate if we transitioned from not-done to done
      if (!alreadyDone) {
        try { onCelebrate && onCelebrate() } catch (e) { console.error('onCelebrate failed', e) }
        setConfettiShow(true)
        if (activeEffects.pulseOnComplete) { const token = Math.random().toString(36).slice(2); setPulseId(token); setTimeout(() => setPulseId(null), 1000) }
        if (activeEffects.coinShine) { document.body.setAttribute('data-coin-shine', '1'); setTimeout(() => document.body.removeAttribute('data-coin-shine'), 900) }
        if (activeEffects.trailOnComplete) { document.body.setAttribute('data-trail', '1'); setTimeout(() => document.body.removeAttribute('data-trail'), 900) }
      }
    } catch (e) { console.error(e) }
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  const sections = useMemo(() => {
    const s = { daily: [], weekly: [], monthly: [] }
    Array.isArray(habits) ? habits.forEach((raw) => {
      const h = normalizeHabit(raw)
      if (!h || typeof h !== 'object') return
      if (h.intervalType === 'weekly') s.weekly.push(h)
      else if (h.intervalType === 'monthly') s.monthly.push(h)
      else s.daily.push(h)
    }) : null
    return s
  }, [habits])

  function renderSection(title, items) {
    const list = Array.isArray(items) ? items : []
    return (
      <section className="bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700">
        <h3 className="text-md font-semibold mb-3">{title}</h3>
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="slate-400 text-sm">No {title.toLowerCase()} habits yet</div>
          ) : (
            list.map((h) => {
              try {
                if (!h || typeof h !== 'object') return null
                const nh = normalizeHabit(h)
                const currentKey = typeof startOfPeriodKey === 'function' ? startOfPeriodKey(new Date(), nh.intervalType, nh.intervalValue, nh.createdAt) : new Date().toISOString().slice(0,10)
                const comps = Array.isArray(nh.completions) ? nh.completions : []
                const completed = comps.some((ts) => { try { return startOfPeriodKey(new Date(ts), nh.intervalType, nh.intervalValue, nh.createdAt) === currentKey } catch (e) { return false } })
                const gp = getGoalProgress(nh)
                const isExpanded = !!expanded[nh.id]

                return (
                  <div key={nh.id || Math.random().toString(36).slice(2)} className="bg-slate-900 p-2 rounded border border-slate-700 overflow-visible flex flex-col relative">
                    {/* main compact row: shorter height for slim look, items centered */}
                    <div className="flex items-center w-full h-12">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <div className="text-md md:text-lg font-bold truncate ml-0.5">{nh.name || 'Untitled habit'}</div>

                        {(
                          true && (
                            <div className="flex items-center gap-1 ml-3">
                              <div className="text-sm text-slate-300">Goal:</div>
                              <div className="text-sm text-slate-300">{ (gp && gp.count) || 0 }/{ (gp && gp.target) || nh.goalTarget || 0 }</div>
                              <span className="ml-2 inline-block align-middle w-32 h-3 bg-slate-800 rounded-md overflow-hidden">
                                <div style={{ width: `${Math.max(0, Math.min(100, (gp && gp.percent) || (nh.goalTarget ? Math.round(((gp && gp.count)||0) / nh.goalTarget * 100) : 0))) }%`, background: 'var(--accent)', height: '100%', transition: 'width 0.2s ease' }} />
                              </span>
                            </div>
                          )
                        )}

                        {/* caret toggle should always render so newly added habits show it even without goals */}
                        <div className="ml-2">
                          <button onClick={() => toggleExpand(nh.id)} aria-label={isExpanded ? 'Collapse' : 'Expand'} className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {isExpanded ? <Lucide.ChevronUp className="w-4 h-4" /> : <Lucide.ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-2">
                          <Lucide.Flame className="w-4 h-4 text-amber-300" />
                          <span className="text-sm">{nh.streak ?? 0}</span>
                        </div>

                        <button onClick={() => handleToggle(nh.id)} className="px-4 py-2 rounded font-large shadow-sm text-sm" style={completed ? { background: 'var(--accent)', color: 'var(--accent-contrast)' } : { background: 'white', color: '#0f172a', border: '1px solid rgba(255,255,255,0.04)' }}>{completed ? 'Done' : 'Mark'}</button>

                        <span className={`ml-2 ${ (nh.difficulty||'Medium').toLowerCase() === 'easy' ? 'bg-emerald-500' : (nh.difficulty||'Medium').toLowerCase() === 'hard' ? 'bg-rose-500' : 'bg-amber-400'} w-3 h-3 rounded-full inline-block`} title={nh.difficulty || 'Medium'} />
                      </div>
                    </div>

                    {/* expanded details inside card flow, card grows when opened */}
                    <div className={`mt-2 transition-all duration-200 ${isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}> 
                      <div className="text-xs text-slate-400 space-y-1 bg-slate-800 p-2 rounded border border-slate-700 w-full md:w-80 mr-auto">
                        <div><strong className="text-slate-200">Difficulty:</strong> {nh.difficulty || 'Medium'}</div>
                        <div><strong className="text-slate-200">Start Date:</strong> {formatDateShort(nh.startDate)}</div>
                        <div><strong className="text-slate-200">Last Completed:</strong> {comps.length ? (function(){ try{ const d = new Date(comps[comps.length - 1]); if (isNaN(d.getTime())) return '—'; return d.toLocaleString() }catch(e){return '—'} })() : '—'}</div>
                        <div><strong className="text-slate-200">Why?</strong> {nh.why ? nh.why : '—'}</div>
                      </div>
                    </div>
                  </div>
                )
              } catch (e) { console.error('Render habit failed', e); return null }
            })
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="relative">
      <Confetti show={confettiShow} duration={1800} onComplete={() => setConfettiShow(false)} />

      <div className="flex flex-col gap-4">
        {renderSection('Daily', sections.daily)}
        {renderSection('Weekly', sections.weekly)}
        {renderSection('Monthly', sections.monthly)}
      </div>
    </div>
  )
}
