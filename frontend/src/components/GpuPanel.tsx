import type { GPUSnapshot } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { TrendChart } from './TrendChart'
import { EmptyState } from './EmptyState'
import { formatMb } from '../lib/format'

interface GpuPanelProps {
  gpu: GPUSnapshot
  utilHistory: number[]
  intervalSeconds: number
  detailed?: boolean
  /** Render only this GPU's card (by its NVML index) - used by the full-screen detail view. */
  onlyIndex?: number
  onExpand?: (index: number) => void
}

export function GpuPanel({ gpu, utilHistory, intervalSeconds, detailed, onlyIndex, onExpand }: GpuPanelProps) {
  if (!gpu.available) {
    return (
      <MetricCard title="GPU">
        <EmptyState message={gpu.error ?? 'No NVIDIA GPU detected.'} />
      </MetricCard>
    )
  }

  const gpusToRender = onlyIndex === undefined ? gpu.gpus : gpu.gpus.filter((g) => g.index === onlyIndex)

  return (
    <>
      {gpusToRender.map((g) => {
        const vramPercent = (g.memory_used_mb / g.memory_total_mb) * 100
        // utilHistory only ever tracks the primary GPU (index 0) - see useSummaryHistory -
        // so the trend chart must key off the GPU's own index, not its position in this
        // (possibly filtered) array, or a secondary GPU's card would show GPU 0's history.
        const isPrimary = g.index === 0
        return (
          <MetricCard
            key={g.uuid}
            title={gpu.gpus.length > 1 ? `GPU ${g.index}` : 'GPU'}
            subtitle={g.name}
            expanded={detailed}
            onClick={onExpand ? () => onExpand(g.index) : undefined}
          >
            <div className="metric-readout">
              <span className="metric-value">
                {g.gpu_utilization_pct.toFixed(0)}
                <span className="metric-unit">%</span>
              </span>
            </div>

            {isPrimary ? (
              <TrendChart
                values={utilHistory}
                color="var(--status-good)"
                gradientId={detailed ? 'gpu-trend-fill-detail' : 'gpu-trend-fill'}
                title="GPU compute utilization"
                intervalSeconds={intervalSeconds}
                height={detailed ? 220 : 112}
              />
            ) : (
              <UsageBar percent={g.gpu_utilization_pct} />
            )}

            <div className="section-label">
              VRAM (video memory) — {formatMb(g.memory_used_mb)} used of {formatMb(g.memory_total_mb)}
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
