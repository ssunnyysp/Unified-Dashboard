import type { CPUStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { TrendChart } from './TrendChart'

interface CpuPanelProps {
  cpu: CPUStats
  history: number[]
  intervalSeconds: number
  detailed?: boolean
  onExpand?: () => void
}

export function CpuPanel({ cpu, history, intervalSeconds, detailed, onExpand }: CpuPanelProps) {
  const cores = cpu.core_count_physical ?? '—'
  const threads = cpu.core_count_logical ?? '—'
  const threadCount = cpu.percent_per_core.length

  return (
    <MetricCard
      title="CPU"
      subtitle={`${cores} physical cores / ${threads} threads`}
      expanded={detailed}
      onClick={onExpand}
    >
      <div className="metric-readout">
        <span className="metric-value">
          {cpu.percent_total.toFixed(0)}
          <span className="metric-unit">%</span>
        </span>
      </div>

      <TrendChart
        values={history}
        color="var(--accent)"
        gradientId={detailed ? 'cpu-trend-fill-detail' : 'cpu-trend-fill'}
        title="Total CPU utilization"
        intervalSeconds={intervalSeconds}
        height={detailed ? 220 : 112}
      />

      <div className="section-label">
        Per-thread utilization ({threadCount} logical processors
        {typeof cores === 'number' && cores !== threadCount ? ` — ${cores} physical cores with SMT/Hyper-Threading` : ''})
      </div>
      <div className={detailed ? 'core-grid core-grid-detailed' : 'core-grid'}>
        {cpu.percent_per_core.map((pct, i) => (
          <div key={i} className="core-cell">
            <div className="core-cell-header">
              <span>T{i}</span>
              <span className="core-cell-pct">{pct.toFixed(0)}%</span>
            </div>
            <div className="usage-bar core-cell-bar" data-tone={pct >= 85 ? 'bad' : pct >= 60 ? 'warn' : 'good'}>
              <div className="usage-bar-fill" style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
            </div>
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
