import { useState } from 'react'
import { useDashboardSummary } from './hooks/useDashboardSummary'
import { useSummaryHistory } from './hooks/useSummaryHistory'
import { ConnectionStatus } from './components/ConnectionStatus'
import { CpuPanel } from './components/CpuPanel'
import { MemoryPanel } from './components/MemoryPanel'
import { DiskPanel } from './components/DiskPanel'
import { GpuPanel } from './components/GpuPanel'
import { DockerPanel } from './components/DockerPanel'
import { PanelOverlay } from './components/PanelOverlay'
import { formatUptime } from './lib/format'
import type { DashboardSummary } from './api/types'
import './App.css'

const INTERVAL_OPTIONS = [1, 2, 5] as const

type ExpandedPanel =
  | { kind: 'cpu' }
  | { kind: 'memory' }
  | { kind: 'disk' }
  | { kind: 'gpu'; index: number }
  | { kind: 'docker' }

function overlayTitle(panel: ExpandedPanel, data: DashboardSummary): string {
  switch (panel.kind) {
    case 'cpu':
      return 'CPU'
    case 'memory':
      return 'Memory'
    case 'disk':
      return 'Disk'
    case 'gpu':
      return data.gpu.gpus.length > 1 ? `GPU ${panel.index}` : 'GPU'
    case 'docker':
      return 'Docker'
  }
}

function App() {
  const [intervalSeconds, setIntervalSeconds] = useState<number>(2)
  const { data, state, lastUpdated } = useDashboardSummary(intervalSeconds)
  const history = useSummaryHistory(data)
  const [expanded, setExpanded] = useState<ExpandedPanel | null>(null)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>unified dashboard</span>
        </div>
        <div className="header-controls">
          <div className="interval-control" role="group" aria-label="Refresh interval">
            {INTERVAL_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={seconds === intervalSeconds ? 'active' : undefined}
                onClick={() => setIntervalSeconds(seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
          <ConnectionStatus state={state} lastUpdated={lastUpdated} />
        </div>
      </header>

      <main className="dashboard-grid">
        {data ? (
          <>
            <CpuPanel
              cpu={data.system.cpu}
              history={history.cpu}
              intervalSeconds={intervalSeconds}
              onExpand={() => setExpanded({ kind: 'cpu' })}
            />
            <MemoryPanel memory={data.system.memory} history={history.memory} onExpand={() => setExpanded({ kind: 'memory' })} />
            <DiskPanel disk={data.system.disk} onExpand={() => setExpanded({ kind: 'disk' })} />
            <GpuPanel
              gpu={data.gpu}
              utilHistory={history.gpuUtil}
              intervalSeconds={intervalSeconds}
              onExpand={(index) => setExpanded({ kind: 'gpu', index })}
            />
            <DockerPanel docker={data.docker} onExpand={() => setExpanded({ kind: 'docker' })} />
          </>
        ) : (
          <p className="loading-state">Connecting to backend…</p>
        )}
      </main>

      <footer className="app-footer">
        {data && (
          <span>
            uptime {formatUptime(data.system.uptime_seconds)} · {data.system.process_count} processes
          </span>
        )}
      </footer>

      {data && expanded && (
        <PanelOverlay title={overlayTitle(expanded, data)} onClose={() => setExpanded(null)}>
          {expanded.kind === 'cpu' && (
            <CpuPanel cpu={data.system.cpu} history={history.cpu} intervalSeconds={intervalSeconds} detailed />
          )}
          {expanded.kind === 'memory' && <MemoryPanel memory={data.system.memory} history={history.memory} detailed />}
          {expanded.kind === 'disk' && <DiskPanel disk={data.system.disk} detailed />}
          {expanded.kind === 'gpu' && (
            <GpuPanel
              gpu={data.gpu}
              utilHistory={history.gpuUtil}
              intervalSeconds={intervalSeconds}
              detailed
              onlyIndex={expanded.index}
            />
          )}
          {expanded.kind === 'docker' && <DockerPanel docker={data.docker} detailed />}
        </PanelOverlay>
      )}
    </div>
  )
}

export default App
