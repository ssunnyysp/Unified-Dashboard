export function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(0)} MB`
}

export function formatGb(gb: number): string {
  return `${gb.toFixed(1)} GB`
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (days || hours) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return parts.join(' ')
}

export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`
  const minutes = totalSeconds / 60
  return minutes >= 10 ? `${Math.round(minutes)}m` : `${minutes.toFixed(1)}m`
}

export function formatRelativeTime(sinceMs: number | null): string {
  if (sinceMs === null) return '—'
  const seconds = Math.max(0, Math.round((Date.now() - sinceMs) / 1000))
  if (seconds < 1) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}
