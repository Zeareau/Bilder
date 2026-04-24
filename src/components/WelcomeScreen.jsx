import React, { useEffect, useState } from 'react'
import * as Lucide from 'lucide-react'

const Icon = ({ name, className = '', fallback = '•' }) => {
  const Comp = Lucide[name]
  return Comp ? <Comp className={className} /> : <span className={className}>{fallback}</span>
}

export default function WelcomeScreen({ onContinue }) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-b from-slate-900/80 to-transparent backdrop-blur-sm">
      <div className="max-w-2xl mx-4 p-8 rounded-xl bg-slate-800 ring-1 ring-slate-700 shadow-xl animate-pop">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-xl font-bold text-slate-900">HB</div>
          <div>
            <h1 className="text-2xl font-semibold">Habit Builder</h1>
            <div className="text-sm text-slate-300">Build momentum, one habit at a time</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 text-slate-300">Welcome — Habit Builder helps you create small daily wins. Use Build to add habits, Mark to track them, and Stats to see your progress. Ready to get started?</div>

          <div className="flex flex-col gap-2">
            <button onClick={() => onContinue(false)} className="px-4 py-2 rounded bg-emerald-500 text-black">Get Started</button>
            <button onClick={() => onContinue(true)} className="px-4 py-2 rounded border border-slate-700">Continue</button>
            <button onClick={() => { localStorage.removeItem('seen_welcome'); alert('Welcome will show again on next load.') }} className="px-4 py-2 rounded text-xs text-slate-400">Reset welcome</button>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">Tip: Aim for small wins. Start with one habit and build momentum.</div>
      </div>
    </div>
  )
}
