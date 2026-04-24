import React, { useMemo, useState } from 'react'
import * as Lucide from 'lucide-react'

// Expanded catalog with intentional rarity distribution and pricing
const CATEGORIES = ['All', 'Themes', 'Profile', 'Effects', 'Cosmetics', 'Titles', 'Skins', 'Utility']

const CATALOG = [
  // COMMON (many inexpensive items)
  { id: 'minimal-skin', name: 'Minimal Slate', desc: 'Clean, subtle card skin.', price: 8, category: 'Skins', rarity: 'Common', icon: 'Square' },
  { id: 'quotes-pack', name: 'Motivational Quotes', desc: 'Daily motivational quotes.', price: 7, category: 'Cosmetics', rarity: 'Common', icon: 'MessageSquare' },
  { id: 'avatar-color-emerald', name: 'Emerald Avatar Color', desc: 'Set your avatar to emerald.', price: 6, category: 'Profile', rarity: 'Common', icon: 'Leaf' },
  { id: 'focus-timer', name: 'Pomodoro Timer', desc: 'Alternate timer UI for focus sessions.', price: 10, category: 'Utility', rarity: 'Common', icon: 'Clock' },
  { id: 'soft-glow', name: 'Soft Glow', desc: 'Gentle glow effect on card edges.', price: 9, category: 'Effects', rarity: 'Common', icon: 'Sun' },
  { id: 'button-round', name: 'Rounded Buttons', desc: 'Softer buttons across the UI.', price: 5, category: 'Cosmetics', rarity: 'Common', icon: 'ThumbsUp' },
  { id: 'progress-dot', name: 'Progress Dot', desc: 'Alternate small dot progress marker.', price: 6, category: 'Cosmetics', rarity: 'Common', icon: 'Zap' },
  { id: 'avatar-bg-sunset', name: 'Sunset Avatar Background', desc: 'Warm circle behind your avatar.', price: 8, category: 'Profile', rarity: 'Common', icon: 'Sunset' },
  { id: 'coin-sparkle', name: 'Coin Sparkle', desc: 'Tiny sparkle when earning coins.', price: 12, category: 'Effects', rarity: 'Common', icon: 'Sparkles' },
  { id: 'minimal-border', name: 'Thin Border', desc: 'Delicate border for cards.', price: 7, category: 'Cosmetics', rarity: 'Common', icon: 'Square' },
  { id: 'compact-mode', name: 'Compact Mode', desc: 'Tighter UI spacing for power users.', price: 9, category: 'Utility', rarity: 'Common', icon: 'Columns' },
  { id: 'daily-reminder', name: 'Daily Reminder', desc: 'Subtle reminder badge for your habits.', price: 11, category: 'Utility', rarity: 'Common', icon: 'Bell' },
  { id: 'motivation-icons', name: 'Motivation Icons', desc: 'Alternate small icons for habits.', price: 8, category: 'Cosmetics', rarity: 'Common', icon: 'Star' },

  // UNCOMMON (medium group)
  { id: 'emerald-theme', name: 'Forest Mode', desc: 'Calming green accent theme.', price: 22, category: 'Themes', rarity: 'Uncommon', icon: 'Leaf' },
  { id: 'ocean-calm', name: 'Ocean Calm', desc: 'Cool blue palette for focus.', price: 20, category: 'Themes', rarity: 'Uncommon', icon: 'Droplet' },
  { id: 'neon-edge', name: 'Neon Edge', desc: 'Sharp neon accent for cards.', price: 18, category: 'Skins', rarity: 'Uncommon', icon: 'Zap' },
  { id: 'glow-ring', name: 'Glow Avatar Ring', desc: 'Subtle animated ring.', price: 14, category: 'Profile', rarity: 'Uncommon', icon: 'Circle' },
  { id: 'victory-pulse', name: 'Victory Pulse', desc: 'Brief pulse on completion.', price: 20, category: 'Effects', rarity: 'Uncommon', icon: 'Zap' },
  { id: 'frosted-glass', name: 'Frosted Glass Skin', desc: 'Soft translucency for cards.', price: 19, category: 'Skins', rarity: 'Uncommon', icon: 'Layers' },
  { id: 'neon-pulse', name: 'Neon Pulse Theme', desc: 'Vibrant neon accent theme.', price: 25, category: 'Themes', rarity: 'Uncommon', icon: 'Zap' },
  { id: 'premium-border', name: 'Premium Border', desc: 'Decorative profile border.', price: 16, category: 'Profile', rarity: 'Uncommon', icon: 'Award' },
  { id: 'streak-spark', name: 'Streak Spark', desc: 'Tiny sparks for streak milestones.', price: 17, category: 'Effects', rarity: 'Uncommon', icon: 'Sparkles' },
  { id: 'completion-flair', name: 'Completion Flair', desc: 'Animated flair on complete.', price: 18, category: 'Cosmetics', rarity: 'Uncommon', icon: 'Check' },
  { id: 'motivation-pack', name: 'Motivation Pack', desc: 'Special quotes + backgrounds.', price: 20, category: 'Cosmetics', rarity: 'Uncommon', icon: 'Book' },
  { id: 'rounded-buttons', name: 'Rounded Buttons Plus', desc: 'Extra soft button shapes.', price: 15, category: 'Cosmetics', rarity: 'Uncommon', icon: 'CornerUpRight' },
  { id: 'sparkle-trail', name: 'Sparkle Trail', desc: 'Completions leave a short trail.', price: 26, category: 'Effects', rarity: 'Uncommon', icon: 'Sparkles' },

  // RARE (medium-small group)
  { id: 'sunrise-glow', name: 'Sunrise Glow', desc: 'Warm sunrise accent theme.', price: 35, category: 'Themes', rarity: 'Rare', icon: 'Sun' },
  { id: 'ember-cards', name: 'Ember Cards', desc: 'Warm ember card skin.', price: 34, category: 'Skins', rarity: 'Rare', icon: 'Fire' },
  { id: 'gold-avatar-ring', name: 'Gold Avatar Ring', desc: 'A decorative gold ring.', price: 36, category: 'Profile', rarity: 'Rare', icon: 'Award' },
  { id: 'confetti-pack', name: 'Confetti Burst', desc: 'Extra confetti styles and colors.', price: 33, category: 'Effects', rarity: 'Rare', icon: 'Gift' },
  { id: 'flame-badge', name: 'Flame Streak Badge', desc: 'Badge visible on long streaks.', price: 40, category: 'Profile', rarity: 'Rare', icon: 'Fire' },
  { id: 'aurora-cards', name: 'Aurora Cards', desc: 'Gradient aurora card skin.', price: 38, category: 'Skins', rarity: 'Rare', icon: 'Layers' },
  { id: 'coin-shine', name: 'Coin Shine', desc: 'Bolder coin animation on earn.', price: 32, category: 'Effects', rarity: 'Rare', icon: 'Coins' },
  { id: 'focus-rocket', name: 'Focus Rocket', desc: 'Launch animation for big wins.', price: 45, category: 'Effects', rarity: 'Rare', icon: 'Rocket' },
  { id: 'title-consistency', name: 'Consistency King', desc: 'Title shown on your profile.', price: 42, category: 'Titles', rarity: 'Rare', icon: 'Crown' },
  { id: 'streak-guardian', name: 'Streak Guardian', desc: 'Title for protecting your streak', price: 55, category: 'Titles', rarity: 'Rare', icon: 'Shield' },

  // EPIC (small group)
  { id: 'golden-hour', name: 'Golden Hour Theme', desc: 'Luxurious warm gold theme.', price: 68, category: 'Themes', rarity: 'Epic', icon: 'Sun' },
  { id: 'victory-sound', name: 'Victory Sound', desc: 'Special celebratory sound.', price: 60, category: 'Effects', rarity: 'Epic', icon: 'Music' },
  { id: 'habit-master-title', name: 'Habit Master', desc: 'Prestige title for profile.', price: 70, category: 'Titles', rarity: 'Epic', icon: 'Trophy' },
  { id: 'aura-ring', name: 'Aura Avatar Ring', desc: 'Animated aura around avatar.', price: 65, category: 'Profile', rarity: 'Epic', icon: 'Star' },
  { id: 'neon-skin', name: 'Neon Card Skin', desc: 'Bright neon card skin (animated).', price: 58, category: 'Skins', rarity: 'Epic', icon: 'Zap' },
  { id: 'focus-architect', name: 'Focus Architect', desc: 'Title that shows focus dedication', price: 60, category: 'Titles', rarity: 'Epic', icon: 'Target' },

  // LEGENDARY (very few)
  { id: 'consistency-legend', name: 'Legendary Builder', desc: 'Very rare prestige title.', price: 120, category: 'Titles', rarity: 'Legendary', icon: 'Award', featured: true },
  { id: 'gold-theme', name: 'Midnight Majesty', desc: 'Exclusive dark gold accent theme.', price: 110, category: 'Themes', rarity: 'Legendary', icon: 'Moon', featured: true },
  { id: 'ultimate-confetti', name: 'Ultimate Confetti', desc: 'Full screen premium confetti and effects.', price: 95, category: 'Effects', rarity: 'Legendary', icon: 'Gift', featured: true },
  { id: 'prestige-border', name: 'Prestige Border', desc: 'Animated prestige border for avatar.', price: 98, category: 'Profile', rarity: 'Legendary', icon: 'Shield', featured: true },
]

// Safe icon renderer
const Icon = ({ name, className = '', fallback = '•' }) => {
  const Comp = Lucide[name]
  return Comp ? <Comp className={className} /> : <span className={className}>{fallback}</span>
}

// Rarity visual map (stronger visual distinction)
const RARITY = {
  Common: { badge: 'bg-slate-700 text-slate-200', glow: '', label: 'Common' },
  Uncommon: { badge: 'bg-emerald-700 text-emerald-100', glow: 'ring-1 ring-emerald-600/40', label: 'Uncommon' },
  Rare: { badge: 'bg-sky-800 text-sky-100', glow: 'ring-2 ring-sky-500/30', label: 'Rare' },
  Epic: { badge: 'bg-violet-800 text-violet-100', glow: 'ring-2 ring-violet-500/40 shadow-[0_8px_30px_rgba(167,139,250,0.06)]', label: 'Epic' },
  Legendary: { badge: 'bg-amber-700 text-amber-900', glow: 'ring-2 ring-amber-500/50 shadow-[0_12px_40px_rgba(245,158,11,0.12)]', label: 'Legendary' },
}

export default function Shop({ profile = {}, saveProfile, notify, coinIcon: CoinIconProp }) {
  const inventory = profile.inventory || []
  const equipped = profile.equipped || {}
  const coins = profile.coins || 0

  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [rarityFilter, setRarityFilter] = useState('All')

  const items = useMemo(() => {
    return CATALOG.filter((it) => {
      if (category !== 'All' && it.category !== category) return false
      if (rarityFilter !== 'All' && it.rarity !== rarityFilter) return false
      if (query && !(`${it.name} ${it.desc} ${it.category}`.toLowerCase().includes(query.toLowerCase()))) return false
      return true
    })
  }, [category, query, rarityFilter])

  const featuredItems = items.filter((it) => it.featured)
  const regularItems = items.filter((it) => !it.featured)

  // Sort regular items for 'All' view so rarer items appear first (Legendary -> Epic -> Rare -> Uncommon -> Common)
  const RARITY_RANK = { Legendary: 5, Epic: 4, Rare: 3, Uncommon: 2, Common: 1 }
  let sortedRegular = regularItems.slice()
  if (category === 'All' && rarityFilter === 'All') {
    sortedRegular.sort((a, b) => {
      const ra = RARITY_RANK[a.rarity] || 0
      const rb = RARITY_RANK[b.rarity] || 0
      if (rb !== ra) return rb - ra // higher rarity first
      // tie-breaker: higher price first, then name
      if (b.price !== a.price) return b.price - a.price
      return a.name.localeCompare(b.name)
    })
  }
  // otherwise keep the existing filtered order

  function buy(item) {
    if (!saveProfile) return
    if (coins < item.price) { notify && notify('Not enough coins'); return }
    const newInv = Array.from(new Set([...(inventory || []), item.id]))
    const newProfile = { ...profile, inventory: newInv, coins: (profile.coins || 0) - item.price }
    saveProfile(newProfile)
    notify && notify('Purchased successfully')
  }

  function getSlotForItem(item) {
    if (item.category === 'Themes') return 'theme'
    if (item.category === 'Titles') return 'title'
    if (item.category === 'Effects') return 'effect'
    if (item.category === 'Profile') return 'avatarRing'
    return 'misc'
  }

  function equip(item) {
    if (!saveProfile) return
    const newEquipped = { ...(profile.equipped || {}) }
    const slot = getSlotForItem(item)
    newEquipped[slot] = item.id
    const newProfile = { ...profile, equipped: newEquipped }
    // immediate visual feedback for theme (best-effort)
    if (item.category === 'Themes') {
      if (item.id === 'emerald-theme' || item.id === 'forest-mode') document.documentElement.style.setProperty('--accent', '#10B981')
    }
    saveProfile(newProfile)
    notify && notify('Equipped')
  }

  function unequipSlot(slot) {
    if (!saveProfile) return
    const newEquipped = { ...(profile.equipped || {}) }
    if (newEquipped && newEquipped[slot]) {
      delete newEquipped[slot]
      const newProfile = { ...profile, equipped: newEquipped }
      saveProfile(newProfile)
      notify && notify('Unequipped')
    }
  }

  const Coin = CoinIconProp || (() => <span className="text-amber-300">🪙</span>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Shop</h2>
          <div className="text-sm text-slate-400">Spend coins on cosmetics and upgrades</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-linear-to-r from-slate-800 to-slate-700 flex items-center gap-2">
            <Coin className="w-4 h-4 text-amber-300" />
            <div className="text-sm font-medium">{coins}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-3 rounded flex flex-col md:flex-row gap-3">
        <div className="w-full md:w-64 flex flex-col gap-3">
          <input placeholder="Search items" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-slate-900 p-2 rounded focus:ring-2 focus:ring-sky-500" />

          <div>
            <div className="text-xs text-slate-400 mb-1">Category</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded ${category===c ? 'bg-slate-700' : 'bg-transparent hover:bg-slate-900'}`}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-1">Rarity</div>
            <div className="flex gap-2 flex-wrap">
              {['All','Common','Uncommon','Rare','Epic','Legendary'].map(r => (
                <button key={r} onClick={() => setRarityFilter(r)} className={`px-3 py-1 rounded ${rarityFilter===r ? 'bg-slate-700' : 'bg-transparent hover:bg-slate-900'}`}>{r}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {/* Featured */}
          {featuredItems.length > 0 && (
            <div>
              <div className="text-sm text-slate-400 mb-2">Featured</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredItems.map(it => {
                  const owned = (inventory || []).includes(it.id)
                  const canBuy = coins >= it.price
                  const rarity = RARITY[it.rarity] || RARITY.Common
                  const slot = getSlotForItem(it)
                  const isEquipped = (profile.equipped || {})[slot] === it.id
                  return (
                    <div key={it.id} className={`p-4 rounded-lg bg-linear-to-br from-slate-900 to-slate-800 border ${rarity.glow} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md bg-slate-900 flex items-center justify-center text-2xl">
                          <Icon name={it.icon} className="w-6 h-6 text-slate-200" />
                        </div>
                        <div>
                          <div className="font-semibold">{it.name} <span className="text-xs text-slate-400 ml-2">{rarity.label}</span></div>
                          <div className="text-xs text-slate-400 mt-1 max-w-md">{it.desc}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm font-semibold text-amber-300">{it.price} <Icon name="Coins" className="inline w-4 h-4 text-amber-300 ml-1" /></div>
                        {!owned ? (
                          <button onClick={() => buy(it)} className={`px-3 py-2 rounded ${canBuy ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{canBuy ? 'Buy' : 'Insufficient'}</button>
                        ) : (
                          isEquipped ? (
                            <button onClick={() => unequipSlot(slot)} className="px-3 py-2 rounded border border-slate-700 text-sm">Unequip</button>
                          ) : (
                            <button onClick={() => equip(it)} className="px-3 py-2 rounded bg-sky-600 text-white">Equip</button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* All items grid */}
          <div>
            <div className="text-sm text-slate-400 mb-2">All items</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedRegular.length === 0 && <div className="col-span-full text-slate-400 p-6 bg-slate-900 rounded">No items match your search.</div>}

              {sortedRegular.map((it) => {
                const owned = (inventory || []).includes(it.id)
                const canBuy = coins >= it.price
                const rarity = RARITY[it.rarity] || RARITY.Common
                const slot = getSlotForItem(it)
                const isEquipped = (profile.equipped || {})[slot] === it.id

                return (
                  <div key={it.id} className={`p-3 rounded bg-slate-900 border border-slate-700 flex flex-col justify-between ${rarity.glow}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-slate-800 flex items-center justify-center text-xl">
                        <Icon name={it.icon} className="w-5 h-5 text-slate-200" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{it.name} <span className="text-xs text-slate-400">{it.category}</span></div>
                        <div className="text-xs text-slate-400 mt-1">{it.desc}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${rarity.badge}`}>{rarity.label}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-amber-300">{it.price}</div>
                        {!owned ? (
                          <button onClick={() => buy(it)} className={`px-3 py-1 rounded text-sm ${canBuy ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{canBuy ? 'Buy' : 'Insufficient'}</button>
                        ) : (
                          isEquipped ? (
                            <button onClick={() => unequipSlot(slot)} className="px-3 py-1 rounded border border-slate-700 text-sm">Unequip</button>
                          ) : (
                            <button onClick={() => equip(it)} className="px-3 py-1 rounded bg-sky-600 text-white">Equip</button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
