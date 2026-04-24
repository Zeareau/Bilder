export function formatInterval(interval = '') {
  if (!interval || typeof interval !== 'string') return ''
  const s = interval.trim().toLowerCase()
  if (s === 'daily') return 'Daily'
  if (s === 'weekly') return 'Weekly'
  if (s === 'monthly') return 'Monthly'
  if (s === 'custom') return 'Custom'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default { formatInterval }
