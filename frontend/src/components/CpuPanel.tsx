import type { CPUStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { TrendChart } from './TrendChart'

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
      </div>

      <TrendChart values={history} color="var(--accent)" gradientId="cpu-trend-fill" />

      <div className="core-grid">
        {cpu.percent_per_core.map((pct, i) => (
          <div key={i} className="core-cell">
            <div className="core-cell-header">
              <span>C{i}</span>
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
