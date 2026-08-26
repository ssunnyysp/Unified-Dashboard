import type { MemoryStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { Sparkline } from './Sparkline'
import { TopProcessList } from './TopProcessList'
import { formatMb } from '../lib/format'

interface MemoryPanelProps {
  memory: MemoryStats
  history: number[]
}

export function MemoryPanel({ memory, history }: MemoryPanelProps) {
  return (
    <MetricCard title="Memory" subtitle={formatMb(memory.total_mb)}>
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
      <TopProcessList processes={memory.top_processes} />
    </MetricCard>
  )
}
