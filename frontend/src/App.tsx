import { useState } from 'react'
import { useDashboardSummary } from './hooks/useDashboardSummary'
import { useSummaryHistory } from './hooks/useSummaryHistory'
import { ConnectionStatus } from './components/ConnectionStatus'
import { CpuPanel } from './components/CpuPanel'
import { MemoryPanel } from './components/MemoryPanel'
import { DiskPanel } from './components/DiskPanel'
import { GpuPanel } from './components/GpuPanel'
import { DockerPanel } from './components/DockerPanel'
import { formatUptime } from './lib/format'
import './App.css'

const INTERVAL_OPTIONS = [1, 2, 5] as const

function App() {
  const [intervalSeconds, setIntervalSeconds] = useState<number>(2)
  const { data, state, lastUpdated } = useDashboardSummary(intervalSeconds)
  const history = useSummaryHistory(data)

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
            <CpuPanel cpu={data.system.cpu} history={history.cpu} intervalSeconds={intervalSeconds} />
            <MemoryPanel memory={data.system.memory} history={history.memory} />
            <DiskPanel disk={data.system.disk} />
            <GpuPanel gpu={data.gpu} utilHistory={history.gpuUtil} intervalSeconds={intervalSeconds} />
            <DockerPanel docker={data.docker} />
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
    </div>
  )
}

export default App
