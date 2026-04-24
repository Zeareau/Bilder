import React, { useEffect, useState, useMemo } from 'react'
import * as Lucide from 'lucide-react'

// Simple avatar renderer: shows a colored circle with optional ring/accessory
function AvatarPreview({ avatar = {}, size = 40 }) {
  const bg = (avatar && avatar.color) || 'var(--avatar-color, #60A5FA)'
  const ringStyle = { boxShadow: avatar && avatar.ring ? `0 0 0 4px ${avatar.ring}` : 'none' }
  // prefer CSS variable --avatar-ring if present
  const cssRing = getComputedStyle(document.documentElement).getPropertyValue('--avatar-ring')
  const avatarAura = getComputedStyle(document.documentElement).getPropertyValue('--avatar-aura')
  const aura = avatarAura && avatarAura.trim() !== '' ? true : false
  const ring = cssRing && cssRing.trim() !== '' ? cssRing : null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <div style={{ width: size, height: size, borderRadius: '999px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#042', border: ring ? `2px solid transparent` : undefined, WebkitMaskComposite: 'destination-out', overflow: 'visible' }}>
          <div className="text-sm font-bold text-white">{(avatar && avatar.letters) || 'Y'}</div>
        </div>
        {ring && (
          <div style={{ position: 'absolute', inset: '-6px', borderRadius: '999px', background: 'transparent', pointerEvents: 'none', boxShadow: `0 0 0 3px ${ring}` }} />
        )}
        {aura && (
          <div style={{ position: 'absolute', inset: '-12px', borderRadius: '999px', background: `radial-gradient(circle at center, rgba(167,139,250,0.08), transparent 40%)`, filter: 'blur(6px)', pointerEvents: 'none' }} />
        )}
      </div>
    </div>
  )
}

export default function Profile({ profile = {}, saveProfile = () => {}, stats = {}, onExport, onResetProfile, onClearData }) {
  // Provide safe merged defaults for profile shape
  const defaultProfile = { name: 'You', color: '#60A5FA', bio: '', goal: '', joinedAt: new Date().toISOString(), avatar: { color: '#60A5FA', letters: 'Y' }, inventory: [], equipped: {} }
  const merged = { ...defaultProfile, ...(profile || {}) }
  // ensure avatar object exists
  if (!merged.avatar) merged.avatar = { ...(defaultProfile.avatar || {}) }

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(merged)

  // Only reset the draft when the modal is opened to avoid clobbering user input
  useEffect(() => {
    if (open) setDraft({ ...merged })
  }, [merged, open])

  // Safe icon wrapper (uses lucide-react icons when available)
  const Icon = ({ name, className = '', fallback = '•' }) => {
    const Comp = Lucide[name]
    return Comp ? <Comp className={className} /> : <span className={className}>{fallback}</span>
  }

  // UI toggles (defensive defaults)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [celebrationEnabled, setCelebrationEnabled] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  // Safe handler wrappers for optional props passed from App
  const handleExport = () => {
    try {
      if (typeof onExport === 'function') onExport()
    } catch (e) {
      console.error('export failed', e)
    }
  }

  const onReset = () => {
    try {
      if (typeof onResetProfile === 'function') onResetProfile()
      else setDraft({ ...defaultProfile })
    } catch (e) {
      console.error('reset failed', e)
    }
  }

  const handleClearData = () => {
    try {
      if (typeof onClearData === 'function') onClearData()
      else {
        setDraft({ ...defaultProfile })
        setOpen(false)
      }
    } catch (e) {
      console.error('clear data failed', e)
    }
  }

  // Avatar selection handling (simple v1)
  function equipAvatarPart(part, value) {
    const newAvatar = { ...(draft.avatar || {}), [part]: value }
    setDraft((d) => ({ ...d, avatar: newAvatar }))
  }

  function onSave() {
    try {
      // save profile draft as-is (avatar object is preserved)
      const updated = { ...profile, ...draft }
      if (typeof saveProfile === 'function') saveProfile(updated)
    } catch (e) {
      console.error('saveProfile failed', e)
    }
    setOpen(false)
  }

  function onOpen() {
    try { setOpen(true) } catch (e) { console.error('Failed to open profile modal', e) }
  }

  // Pull stats (safe defaults)
  const totalCoins = (stats && stats.totalCoins) || 0
  const totalHabits = (stats && stats.totalHabits) || 0
  const bestStreak = (stats && stats.bestStreak) || 0
  const totalCompletions = (stats && stats.totalCompletions) || 0

  // derive equipped title if any
  const equippedTitleId = profile.equipped && profile.equipped.title
  const equippedTitle = equippedTitleId ? (ITEM_MAP && ITEM_MAP[equippedTitleId] && ITEM_MAP[equippedTitleId].titleText) : null

  const joinedDisplay = useMemo(() => {
    try {
      return new Date(merged.joinedAt || merged.createdAt || Date.now()).toLocaleDateString()
    } catch (e) {
      return '—'
    }
  }, [merged])

  // Avatar upload handling
  function handleAvatarFile(file) {
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 2_500_000) {
      alert('Image too large (max 2.5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setDraft((d) => ({ ...d, avatar: e.target.result }))
    }
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    setDraft((d) => ({ ...d, avatar: null }))
  }

  const initials = (draft && draft.name ? draft.name : 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Achievements (simple logic)
  const achievements = [
    { id: 'first', label: 'First Habit', unlocked: totalHabits > 0, icon: 'Star', color: 'bg-amber-400' },
    { id: '7day', label: '7-Day Streak', unlocked: bestStreak >= 7, icon: 'Zap', color: 'bg-emerald-400' },
    { id: '50coins', label: '50 Coins', unlocked: totalCoins >= 50, icon: 'Coin', color: 'bg-yellow-400' },
    { id: 'builder', label: 'Habit Builder', unlocked: true, icon: 'Hammer', color: 'bg-sky-400' },
  ]

  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className="flex items-center gap-3 rounded px-4 py-2 hover:bg-slate-800 transition"
        aria-label="Open profile"
        style={{ height: 44 }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden" style={{ background: (draft.avatar && draft.avatar.color) || 'var(--avatar-color, #60A5FA)' }}>
          {draft.avatar ? (
            typeof draft.avatar === 'string' ? <img src={draft.avatar} alt="avatar" className="w-full h-full object-cover" /> : <AvatarPreview avatar={draft.avatar} size={38} />
          ) : (
            <span className="text-sm font-semibold">{initials}</span>
          )}
        </div>
        <div className="text-base text-slate-200 hidden md:block">{draft.name || 'You'}</div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center profile-modal">
          <div className="absolute inset-0 bg-black/60 overlay" onClick={() => setOpen(false)} />

          <div
            className={`relative z-50 w-full max-w-2xl mx-4 rounded-lg bg-slate-800 ring-1 ring-slate-700 shadow-xl`}
            role="dialog"
            aria-modal="true"
            style={{
              // keep modal visually centered but constrained to viewport height
              maxHeight: 'calc(100vh - 64px)',
              display: 'flex',
              flexDirection: 'column',
              // allow native popovers (color picker) to escape modal bounds
              overflow: 'visible'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-4 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div style={{ background: draft.color }} className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-semibold ring-1 ring-slate-700 overflow-hidden">
                    {draft.avatar ? (typeof draft.avatar === 'string' ? <img src={draft.avatar} alt="avatar" className="w-full h-full object-cover" /> : initials) : initials}
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold">{draft.name || 'You'}</div>
                  <div className="text-sm text-slate-400">Personalize your habit journey</div>
                  <div className="text-xs text-slate-500 mt-2">Joined: {joinedDisplay}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-slate-700 transition" aria-label="Close profile">
                  <Icon name="X" className="w-4 h-4" fallback="✖" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`grid p-4 gap-4`} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {/* Left: form */}
              <div className={`col-span-2 bg-slate-900 p-4 rounded-lg ring-1 ring-slate-700`}>
                <label className="text-xs text-slate-400">Display name</label>
                <input value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="w-full bg-slate-800 p-2 rounded mt-1 mb-3" />

                <label className="text-xs text-slate-400">Bio</label>
                <textarea value={draft.bio || ''} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} rows={3} className="w-full bg-slate-800 p-2 rounded mt-1 mb-3 text-sm" />

                <label className="text-xs text-slate-400">Current focus</label>
                <input value={draft.goal || ''} onChange={(e) => setDraft((d) => ({ ...d, goal: e.target.value }))} className="w-full bg-slate-800 p-2 rounded mt-1 mb-3" placeholder="e.g. Meditation" />

                {/* avatar color changer removed as requested */}

                <div className="mt-3 text-xs text-slate-400">Upload avatar image (optional) — max 2.5MB</div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button onClick={() => { setDraft({ ...merged }); setOpen(false) }} className="px-3 py-1 rounded border">Cancel</button>
                  <button onClick={onSave} className="px-3 py-1 rounded bg-emerald-500 text-black">Save</button>
                </div>
              </div>

              {/* Right: stats + achievements + settings */}
              <div className="col-span-1 space-y-4">
                <div className="bg-slate-900 p-3 rounded-lg ring-1 ring-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">Overview</div>
                    <div className="text-xs text-slate-400">&nbsp;</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-slate-800 ring-1 ring-slate-700 text-center">
                      <div className="text-sm font-semibold">{totalCoins}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Icon name="Coins" className="w-3 h-3" fallback="🪙"/> Coins</div>
                    </div>

                    <div className="p-2 rounded bg-slate-800 ring-1 ring-slate-700 text-center">
                      <div className="text-sm font-semibold">{totalHabits}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Icon name="User" className="w-3 h-3" fallback="👤"/> Habits</div>
                    </div>

                    <div className="p-2 rounded bg-slate-800 ring-1 ring-slate-700 text-center">
                      <div className="text-sm font-semibold">{bestStreak}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Icon name="Zap" className="w-3 h-3" fallback="⚡"/> Best</div>
                    </div>

                    <div className="p-2 rounded bg-slate-800 ring-1 ring-slate-700 text-center">
                      <div className="text-sm font-semibold">{totalCompletions}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Icon name="Check" className="w-3 h-3" fallback="✔️"/> Done</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg ring-1 ring-slate-700">
                  <div className="text-xs text-slate-400 mb-2">Achievements</div>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      // compute dynamic achievements from passed stats
                      const totalCoins = (stats && stats.totalCoins) || 0
                      const totalHabits = (stats && stats.totalHabits) || 0
                      const bestStreak = (stats && stats.bestStreak) || 0
                      const totalCompletions = (stats && stats.totalCompletions) || 0

                      const ACH = [
                        { id: 'first', label: 'First Habit', icon: 'Star', color: 'bg-amber-400', unlocked: totalHabits >= 1 },
                        { id: 'consistency-starter', label: 'Consistency Starter (3d)', icon: 'Zap', color: 'bg-emerald-400', unlocked: bestStreak >= 3 },
                        { id: '7day', label: '7-Day Streak', icon: 'Zap', color: 'bg-emerald-400', unlocked: bestStreak >= 7 },
                        { id: '30day', label: '30-Day Streak', icon: 'Trophy', color: 'bg-sky-400', unlocked: bestStreak >= 30 },
                        { id: 'comp-10', label: '10 Completions', icon: 'Check', color: 'bg-sky-400', unlocked: totalCompletions >= 10 },
                        { id: 'comp-50', label: '50 Completions', icon: 'Check', color: 'bg-amber-400', unlocked: totalCompletions >= 50 },
                        { id: 'coins-100', label: '100 Coins Earned', icon: 'Coins', color: 'bg-amber-400', unlocked: totalCoins >= 100 },
                        { id: 'coins-250', label: '250 Coins Earned', icon: 'Coins', color: 'bg-amber-400', unlocked: totalCoins >= 250 },
                        { id: 'goal-crusher', label: 'Goal Crusher', icon: 'Star', color: 'bg-violet-400', unlocked: totalCompletions >= 20 && totalHabits > 0 },
                        { id: 'momentum', label: 'Momentum Builder', icon: 'Repeat', color: 'bg-violet-400', unlocked: totalCompletions >= 100 },
                        { id: 'habit-master', label: 'Habit Master (90d)', icon: 'Award', color: 'bg-amber-400', unlocked: bestStreak >= 90 },
                      ]

                      return ACH.map((a) => {
                        const IconComp = Lucide[a.icon]
                        return (
                          <div key={a.id} className={`px-3 py-1 rounded flex items-center gap-2 text-xs ${a.unlocked ? 'bg-slate-700 ring-1 ring-emerald-500' : 'bg-slate-800 ring-1 ring-slate-700 opacity-60'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${a.color}`}>
                              {a.icon === 'Coins' ? <Lucide.Coins className="w-3 h-3" /> : (IconComp ? <IconComp className="w-3 h-3" /> : <span className="w-3 h-3" />)}
                            </div>
                            <div className={`${a.unlocked ? 'text-emerald-200' : 'text-slate-400'}`}>{a.label}</div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg ring-1 ring-slate-700">
                  <div className="text-xs text-slate-400 mb-2">Settings</div>
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><Icon name="Music" className="w-4 h-4" fallback="🎵"/><div className="text-xs text-slate-300">Sound effects</div></div>
                      <input type="checkbox" checked={soundEnabled} onChange={() => setSoundEnabled((v) => !v)} />
                    </label>

                    <label className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><Icon name="Zap" className="w-4 h-4" fallback="⚡"/><div className="text-xs text-slate-300">Celebrations</div></div>
                      <input type="checkbox" checked={celebrationEnabled} onChange={() => setCelebrationEnabled((v) => !v)} />
                    </label>

                    <label className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><Icon name="Settings" className="w-4 h-4" fallback="⚙️"/><div className="text-xs text-slate-300">Compact mode</div></div>
                      <input type="checkbox" checked={compactMode} onChange={() => setCompactMode((v) => !v)} />
                    </label>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg ring-1 ring-slate-700">
                  <div className="text-xs text-slate-400 mb-2">Utilities</div>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleExport} className="w-full text-sm px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 transition flex items-center gap-2 justify-center"><Lucide.Download className="w-4 h-4"/> Export data</button>
                    <button onClick={onReset} className="w-full text-sm px-3 py-2 rounded border border-rose-700 text-rose-400 hover:bg-slate-800 transition">Reset profile</button>
                    <button onClick={handleClearData} className="w-full text-sm px-3 py-2 rounded border border-rose-700 text-rose-400 hover:bg-slate-800 transition">Clear app data</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
