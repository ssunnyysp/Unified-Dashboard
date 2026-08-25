import { useEffect, useState } from 'react'
import type { ConnectionState } from '../hooks/useDashboardSummary'
import { formatRelativeTime } from '../lib/format'

interface ConnectionStatusProps {
  state: ConnectionState
  lastUpdated: number | null
}

const LABELS: Record<ConnectionState, string> = {
  connecting: 'Connecting',
  live: 'Live',
  reconnecting: 'Reconnecting',
}

export function ConnectionStatus({ state, lastUpdated }: ConnectionStatusProps) {
  // Ticks once a second purely to keep the "Xs ago" label fresh.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="connection-status" data-state={state}>
      <span className="status-dot" />
      <span>{LABELS[state]}</span>
      {lastUpdated !== null && <span className="dim">· {formatRelativeTime(lastUpdated)}</span>}
    </div>
  )
}
