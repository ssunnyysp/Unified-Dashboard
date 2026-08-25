import type { GPUSnapshot } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { TrendChart } from './TrendChart'
import { EmptyState } from './EmptyState'
import { formatMb } from '../lib/format'

interface GpuPanelProps {
  gpu: GPUSnapshot
  utilHistory: number[]
}

export function GpuPanel({ gpu, utilHistory }: GpuPanelProps) {
  if (!gpu.available) {
    return (
      <MetricCard title="GPU">
        <EmptyState message={gpu.error ?? 'No NVIDIA GPU detected.'} />
      </MetricCard>
    )
  }

  return (
    <>
      {gpu.gpus.map((g, idx) => {
        const vramPercent = (g.memory_used_mb / g.memory_total_mb) * 100
        return (
          <MetricCard
            key={g.uuid}
            title={gpu.gpus.length > 1 ? `GPU ${g.index}` : 'GPU'}
            subtitle={g.name}
          >
            <div className="metric-readout">
              <span className="metric-value">
                {g.gpu_utilization_pct.toFixed(0)}
                <span className="metric-unit">%</span>
              </span>
            </div>

            {idx === 0 ? (
              <TrendChart values={utilHistory} color="var(--status-good)" gradientId="gpu-trend-fill" />
            ) : (
              <UsageBar percent={g.gpu_utilization_pct} />
            )}

            <div className="stat-row-label">
              VRAM {formatMb(g.memory_used_mb)} / {formatMb(g.memory_total_mb)}
            </div>
            <UsageBar percent={vramPercent} />

            <dl className="stat-list">
              <div>
                <dt>Temp</dt>
                <dd>{g.temperature_c !== null ? `${g.temperature_c.toFixed(0)}°C` : '—'}</dd>
              </div>
              <div>
                <dt>Power</dt>
                <dd>
                  {g.power_draw_w !== null
                    ? `${g.power_draw_w.toFixed(0)}${g.power_limit_w !== null ? ` / ${g.power_limit_w.toFixed(0)}` : ''} W`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt>Driver</dt>
                <dd>{gpu.driver_version ?? '—'}</dd>
              </div>
            </dl>
          </MetricCard>
        )
      })}
    </>
  )
}
