import type { CPUStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { Sparkline } from './Sparkline'

interface CpuPanelProps {
  cpu: CPUStats
  history: number[]
}

export function CpuPanel({ cpu, history }: CpuPanelProps) {
  const cores = cpu.core_count_physical ?? '—'
  const threads = cpu.core_count_logical ?? '—'

  return (
    <MetricCard title="CPU" subtitle={`${cores}c / ${threads}t`}>
      <div className="metric-readout">
        <span className="metric-value">
          {cpu.percent_total.toFixed(0)}
          <span className="metric-unit">%</span>
        </span>
        <Sparkline values={history} />
      </div>
      <UsageBar percent={cpu.percent_total} />

      <div className="core-grid" title={cpu.percent_per_core.map((p, i) => `core ${i}: ${p.toFixed(0)}%`).join(', ')}>
        {cpu.percent_per_core.map((pct, i) => (
          <div key={i} className="core-bar">
            <div className="core-bar-fill" style={{ height: `${Math.min(Math.max(pct, 0), 100)}%` }} />
          </div>
        ))}
      </div>

      <dl className="stat-list">
        <div>
          <dt>Frequency</dt>
          <dd>{cpu.freq_current_mhz ? `${(cpu.freq_current_mhz / 1000).toFixed(2)} GHz` : '—'}</dd>
        </div>
      </dl>
    </MetricCard>
  )
}
