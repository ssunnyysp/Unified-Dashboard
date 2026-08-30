import type { DiskStats } from '../api/types'
import { MetricCard } from './MetricCard'
import { UsageBar } from './UsageBar'
import { formatGb } from '../lib/format'

interface DiskPanelProps {
  disk: DiskStats
  detailed?: boolean
  onExpand?: () => void
}

export function DiskPanel({ disk, detailed, onExpand }: DiskPanelProps) {
  return (
    <MetricCard title="Disk" subtitle={disk.path} expanded={detailed} onClick={onExpand}>
      <div className="metric-readout">
        <span className="metric-value">
          {disk.percent.toFixed(0)}
          <span className="metric-unit">%</span>
        </span>
      </div>
      <UsageBar percent={disk.percent} />

      <dl className="stat-list">
        <div>
          <dt>Used</dt>
          <dd>{formatGb(disk.used_gb)}</dd>
        </div>
        <div>
          <dt>Free</dt>
          <dd>{formatGb(disk.free_gb)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatGb(disk.total_gb)}</dd>
        </div>
      </dl>
    </MetricCard>
  )
}
