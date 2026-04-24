// filepath: /Users/zeareau/Desktop/BilderV2/bilder/src/shop/mapping.js
// Mapping of shop item ids to appearance/effect tokens
const ITEM_MAP = {
  // Themes
  'emerald-theme': { type: 'theme', vars: { '--accent': '#10B981', '--accent-contrast': '#000000', '--accent-weak': '#34D399' } },
  'ocean-calm': { type: 'theme', vars: { '--accent': '#3B82F6', '--accent-contrast': '#ffffff', '--accent-weak': '#60A5FA' } },
  'neon-pulse': { type: 'theme', vars: { '--accent': '#FF6EC7', '--accent-contrast': '#0b1020', '--accent-weak': '#F9A8D4' } },
  'sunrise-glow': { type: 'theme', vars: { '--accent': '#FB923C', '--accent-contrast': '#071723', '--accent-weak': '#FDBA74' } },
  'golden-hour': { type: 'theme', vars: { '--accent': '#F59E0B', '--accent-contrast': '#041017', '--accent-weak': '#FCD34D' } },
  'gold-theme': { type: 'theme', vars: { '--accent': '#D4AF37', '--accent-contrast': '#071017', '--accent-weak': '#FBBF24' } },

  // Skins (card appearance)
  'minimal-skin': { type: 'skin', vars: { '--card-bg': '#0b1220', '--card-border': 'rgba(255,255,255,0.03)', '--card-radius': '0.5rem', '--card-gradient': 'none' } },
  'frosted-glass': { type: 'skin', vars: { '--card-bg': 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', '--card-border': 'rgba(255,255,255,0.04)', '--card-radius': '0.75rem', '--card-gradient': 'rgba(255,255,255,0.02)' } },
  'ember-cards': { type: 'skin', vars: { '--card-bg': 'linear-gradient(180deg,#0b1220,#2b0b07)', '--card-border': 'rgba(255,120,50,0.08)', '--card-radius': '0.6rem', '--card-gradient': 'linear-gradient(90deg,#ffecd2,#ff9a9e)' } },
  'aurora-cards': { type: 'skin', vars: { '--card-bg': 'linear-gradient(180deg,#071122,#10203a)', '--card-border': 'rgba(120,90,255,0.06)', '--card-radius': '0.6rem', '--card-gradient': 'linear-gradient(90deg,#60a5fa,#a78bfa)' } },
  'neon-skin': { type: 'skin', vars: { '--card-bg': '#071026', '--card-border': 'rgba(255,0,128,0.12)', '--card-radius': '0.4rem', '--card-gradient': 'linear-gradient(90deg,#ff00c2,#00fff0)' } },

  // Profile / avatar rings
  'premium-border': { type: 'avatar', vars: { '--avatar-ring': 'linear-gradient(90deg,#f59e0b,#f97316)' } },
  'gold-avatar-ring': { type: 'avatar', vars: { '--avatar-ring': 'linear-gradient(90deg,#ffd700,#ffb84d)' } },
  'aura-ring': { type: 'avatar', vars: { '--avatar-ring': '#a78bfa', '--avatar-aura': '1' } },
  'prestige-border': { type: 'avatar', vars: { '--avatar-ring': 'linear-gradient(90deg,#ffd166,#ff8a00)', '--avatar-aura': '1' } },

  // Effects
  'confetti-pack': { type: 'effect', effect: { confettiPieces: 140, confettiDuration: 2800 } },
  'ultimate-confetti': { type: 'effect', effect: { confettiPieces: 260, confettiDuration: 4200 } },
  'victory-pulse': { type: 'effect', effect: { pulseOnComplete: true } },
  'coin-shine': { type: 'effect', effect: { coinShine: true } },
  'sparkle-trail': { type: 'effect', effect: { trailOnComplete: true } },
  'focus-rocket': { type: 'effect', effect: { bigWinLaunch: true } },

  // Titles
  'title-consistency': { type: 'title', titleText: 'Consistency King' },
  'habit-master-title': { type: 'title', titleText: 'Habit Master' },
  'consistency-legend': { type: 'title', titleText: 'Legendary Builder' },
  'daily-grinder': { type: 'title', titleText: 'Daily Grinder' },
  'focus-architect': { type: 'title', titleText: 'Focus Architect' },
  'streak-guardian': { type: 'title', titleText: 'Streak Guardian' },
}

export default ITEM_MAP
