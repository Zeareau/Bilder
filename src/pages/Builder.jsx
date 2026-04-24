import React from 'react'
import * as Lucide from 'lucide-react'

export default function Builder({ form, setForm, addOrUpdate, editingId, cancelEdit, hasHabits = false }) {
  // derive a safe value for the date input (YYYY-MM-DD) from ISO or other values
  const startDateValue = (() => {
    if (!form || !form.startDate) return ''
    try {
      const d = new Date(form.startDate)
      if (isNaN(d.getTime())) return ''
      return d.toISOString().slice(0,10)
    } catch (e) { return '' }
  })()

  return (
    <section className="bg-slate-800 p-4 rounded-lg mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="block text-sm text-slate-300 mb-1">Habit Name</label>
          <input
            value={form.name || ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm"
            placeholder="e.g. Meditate, Read, Run"
          />
        </div>

        <div className="w-48">
          <label className="block text-sm text-slate-300 mb-1">Interval</label>
          <select
            value={form.intervalType}
            onChange={(e) => setForm((f) => ({ ...f, intervalType: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (days)</option>
          </select>
        </div>

        {form.intervalType === 'custom' && (
          <div className="w-36">
            <label className="block text-sm text-slate-300 mb-1">Every (days)</label>
            <input
              type="number"
              min={1}
              value={form.intervalValue}
              onChange={(e) => setForm((f) => ({ ...f, intervalValue: Number(e.target.value) }))}
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={addOrUpdate} className="bg-emerald-500 text-black px-4 py-2 rounded font-medium">{editingId ? 'Update' : 'Add Habit'}</button>
          {editingId && <button onClick={cancelEdit} className="px-4 py-2 rounded border border-slate-700 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="md:col-span-1">
          <label className="block text-sm text-slate-300 mb-1">Difficulty</label>
          <select value={form.difficulty || 'Medium'} onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Start Date</label>
          <input type="date" value={startDateValue} onChange={(e) => setForm(f=>({...f, startDate: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm" />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Goal (Completions)</label>
          <input type="number" min={0} value={form.goalTarget ?? ''} onChange={(e) => setForm(f => ({ ...f, goalTarget: e.target.value ? Number(e.target.value) : 0 }))} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm" />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-sm text-slate-300 mb-1">Why?</label>
        <textarea value={form.why ?? ''} onChange={(e) => setForm(f => ({ ...f, why: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm" placeholder="Why do you want to do this?" rows={2} />
      </div>

      {!hasHabits && (
        <div className="space-y-3 mt-4">
          <div className="text-sm text-slate-400">Create habits and mark them complete for the current period. Streaks build when you complete consecutive periods.</div>
        </div>
      )}
    </section>
  )
}
