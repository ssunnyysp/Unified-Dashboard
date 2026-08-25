import { useEffect, useRef, useState } from 'react'
import type { DashboardSummary } from '../api/types'
import { WS_SUMMARY_URL } from '../api/config'

export type ConnectionState = 'connecting' | 'live' | 'reconnecting'

// Capped backoff, not a max-attempts cutoff - this is a local dashboard talking to a
// backend the user starts themselves, so "keep trying forever, slower over time" is the
// right behavior rather than giving up and forcing a manual refresh.
const RECONNECT_DELAYS_MS = [500, 1000, 2000, 4000, 8000]

interface DashboardSummaryState {
  data: DashboardSummary | null
  state: ConnectionState
  lastUpdated: number | null
}

export function useDashboardSummary(intervalSeconds: number): DashboardSummaryState {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [state, setState] = useState<ConnectionState>('connecting')
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const attemptRef = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const unmountingRef = useRef(false)

  useEffect(() => {
    unmountingRef.current = false
    attemptRef.current = 0

    function connect() {
      setState(attemptRef.current === 0 ? 'connecting' : 'reconnecting')
      const socket = new WebSocket(`${WS_SUMMARY_URL}?interval=${intervalSeconds}`)
      socketRef.current = socket

      socket.onopen = () => {
        attemptRef.current = 0
        setState('live')
      }

      socket.onmessage = (event) => {
        try {
          setData(JSON.parse(event.data) as DashboardSummary)
          setLastUpdated(Date.now())
        } catch {
          // Malformed frame - drop it, next tick will arrive shortly.
        }
      }

      socket.onclose = () => {
        if (unmountingRef.current) return
        setState('reconnecting')
        const delay = RECONNECT_DELAYS_MS[Math.min(attemptRef.current, RECONNECT_DELAYS_MS.length - 1)]
        attemptRef.current += 1
        reconnectTimer.current = setTimeout(connect, delay)
      }

      socket.onerror = () => {
        socket.close()
      }
    }

    connect()

    return () => {
      unmountingRef.current = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      socketRef.current?.close()
    }
  }, [intervalSeconds])

  return { data, state, lastUpdated }
}
