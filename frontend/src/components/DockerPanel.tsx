import type { ContainerStats, DockerSnapshot } from '../api/types'
import { MetricCard } from './MetricCard'
import { EmptyState } from './EmptyState'
import { StatusPill, type PillTone } from './StatusPill'

function statusTone(status: string): PillTone {
  if (status === 'running') return 'good'
  if (status === 'restarting' || status === 'paused') return 'warn'
  if (status === 'exited' || status === 'dead') return 'bad'
  return 'neutral'
}

function containerTitle(container: ContainerStats): string | undefined {
  if (!container.created) return undefined
  return `created ${new Date(container.created).toLocaleString()}`
}

interface DockerPanelProps {
  docker: DockerSnapshot
  detailed?: boolean
  onExpand?: () => void
}

export function DockerPanel({ docker, detailed, onExpand }: DockerPanelProps) {
  if (!docker.available) {
    return (
      <MetricCard title="Docker" wide expanded={detailed} onClick={onExpand}>
        <EmptyState message={docker.error ?? 'Docker daemon unreachable.'} />
      </MetricCard>
    )
  }

  if (docker.containers.length === 0) {
    return (
      <MetricCard title="Docker" wide subtitle="0 containers" expanded={detailed} onClick={onExpand}>
        <EmptyState message="No containers found." />
      </MetricCard>
    )
  }

  return (
    <MetricCard
      title="Docker"
      wide
      subtitle={`${docker.containers.length} container${docker.containers.length === 1 ? '' : 's'}`}
      expanded={detailed}
      onClick={onExpand}
    >
      <table className="container-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Image</th>
            <th>Status</th>
            <th>CPU</th>
            <th>Mem</th>
            <th>Ports</th>
          </tr>
        </thead>
        <tbody>
          {docker.containers.map((c) => (
            <tr key={c.id} title={containerTitle(c)}>
              <td>{c.name}</td>
              <td className="mono dim">{c.image}</td>
              <td>
                <StatusPill tone={statusTone(c.status)}>{c.status}</StatusPill>
              </td>
              <td className="mono">{c.cpu_percent !== null ? `${c.cpu_percent.toFixed(1)}%` : '—'}</td>
              <td className="mono">{c.memory_percent !== null ? `${c.memory_percent.toFixed(1)}%` : '—'}</td>
              <td className="mono dim">{c.ports.length ? c.ports.join(', ') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MetricCard>
  )
}
