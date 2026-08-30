import type { MemoryStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { Sparkline } from './Sparkline'
import { TopProcessList } from './TopProcessList'
import { formatMb } from '../lib/format'

const COMPACT_PROCESS_COUNT = 5

interface MemoryPanelProps {
  memory: MemoryStats
  history: number[]
  detailed?: boolean
  onExpand?: () => void
}

export function MemoryPanel({ memory, history, detailed, onExpand }: MemoryPanelProps) {
  const processes = detailed ? memory.top_processes : memory.top_processes.slice(0, COMPACT_PROCESS_COUNT)

  return (
    <MetricCard title="Memory" subtitle={formatMb(memory.total_mb)} expanded={detailed} onClick={onExpand}>
      <div className="metric-readout">
        <span className="metric-value">
          {memory.percent.toFixed(0)}
          <span className="metric-unit">%</span>
        </span>
        <Sparkline values={history} color="var(--status-good)" />
      </div>
      <UsageBar percent={memory.percent} />

      <dl className="stat-list">
        <div>
          <dt>Used</dt>
          <dd>{formatMb(memory.used_mb)}</dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{formatMb(memory.available_mb)}</dd>
        </div>
      </dl>

      <div className="section-label">Top memory consumers</div>
      <TopProcessList processes={processes} />
    </MetricCard>
  )
}
