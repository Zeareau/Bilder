import React from 'react'

export default function Info() {
  return (
    <div className="animate-fade">
      <div className="bg-slate-800 p-4 rounded-lg ring-1 ring-slate-700 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2">How the app works</h2>
        <p className="text-sm text-slate-400 mb-4">Quick guide to coins, streaks, and rewards in Habit Builder.</p>

        <section className="space-y-3">
          <div className="bg-slate-900 p-3 rounded">
            <h3 className="font-semibold">How coins work</h3>
            <p className="text-sm text-slate-400 mt-1">You earn 1 coin each time you mark a habit complete for the current period. Coins are your in-app currency to customize your profile and unlock cosmetic items.</p>
          </div>

          <div className="bg-slate-900 p-3 rounded">
            <h3 className="font-semibold">How habits are scored</h3>
            <p className="text-sm text-slate-400 mt-1">Each completion adds to the habit's total coins and contributes to your overall progress. Completions are tracked per period (daily/weekly/monthly/custom).</p>
          </div>

          <div className="bg-slate-900 p-3 rounded">
            <h3 className="font-semibold">What streaks do</h3>
            <p className="text-sm text-slate-400 mt-1">Streaks count how many consecutive periods you've completed a habit. Every 7-period streak grants a small bonus (+5 coins) to encourage consistency.</p>
          </div>

          <div className="bg-slate-900 p-3 rounded">
            <h3 className="font-semibold">What you can use coins for</h3>
            <p className="text-sm text-slate-400 mt-1">Spend coins in the Shop to buy avatar styles, themes, and other cosmetic upgrades to personalize your profile. Coins are cosmetic only and do not affect habit tracking logic.</p>
          </div>
        </section>

        <div className="mt-6 text-sm text-slate-400 text-right">Need more help? Visit the Shop or open your Profile for customization options.</div>
      </div>
    </div>
  )
}
