import { useEffect, useState } from 'react'
import type { DashboardSummary } from '../api/types'

const MAX_POINTS = 60

interface SummaryHistory {
  cpu: number[]
  memory: number[]
  gpuUtil: number[]
}

const EMPTY_HISTORY: SummaryHistory = { cpu: [], memory: [], gpuUtil: [] }

// Backend intentionally has no persistence (current-state only, by design) - trends are
// kept client-side as a short rolling buffer that resets on page reload.
export function useSummaryHistory(summary: DashboardSummary | null): SummaryHistory {
  const [history, setHistory] = useState<SummaryHistory>(EMPTY_HISTORY)

  useEffect(() => {
    if (!summary) return
    setHistory((prev) => ({
      cpu: [...prev.cpu, summary.system.cpu.percent_total].slice(-MAX_POINTS),
      memory: [...prev.memory, summary.system.memory.percent].slice(-MAX_POINTS),
      gpuUtil: [...prev.gpuUtil, summary.gpu.gpus[0]?.gpu_utilization_pct ?? 0].slice(-MAX_POINTS),
    }))
  }, [summary])

  return history
}
