import type { ProcessMemoryStats } from '../api/types'
import { formatMb } from '../lib/format'

interface TopProcessListProps {
  processes: ProcessMemoryStats[]
}

export function TopProcessList({ processes }: TopProcessListProps) {
  if (processes.length === 0) return null

  const largest = Math.max(...processes.map((p) => p.memory_mb))

  return (
    <ol className="process-list">
      {processes.map((p, i) => (
        <li key={p.name} className="process-row">
          <div className="process-row-top">
            <span className="process-rank">{i + 1}</span>
            <span className="process-name" title={p.name}>
              {p.name}
              {p.process_count > 1 && <span className="process-count"> ×{p.process_count}</span>}
            </span>
            <span className="process-mem">{formatMb(p.memory_mb)}</span>
            <span className="process-pct">{p.percent.toFixed(1)}%</span>
          </div>
          {/* Bar is scaled against the top consumer in this list, not against 100% of
              system memory - a normal #1 process isn't a "warning", so it doesn't borrow
              the red/amber/green usage-bar semantics used elsewhere. */}
          <div className="process-bar">
            <div className="process-bar-fill" style={{ width: `${(p.memory_mb / largest) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
