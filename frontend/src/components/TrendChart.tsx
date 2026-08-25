import { formatDuration } from '../lib/format'

interface TrendChartProps {
  values: number[]
  max?: number
  color: string
  gradientId: string
  title: string
  /** How much wall-clock time the current `values` buffer spans, for the "last Xm" caption. */
  windowSeconds: number
}

const VIEW_W = 320
const VIEW_H = 112
const PAD_LEFT = 30
const PAD_TOP = 8
const PAD_BOTTOM = 8
const CHART_W = VIEW_W - PAD_LEFT
const CHART_H = VIEW_H - PAD_TOP - PAD_BOTTOM
const GRID_LINES = [
  { value: 0, label: '0' },
  { value: 50, label: '50' },
  { value: 100, label: '100%' },
]

function yFor(value: number, max: number): number {
  const clamped = Math.min(Math.max(value, 0), max)
  return PAD_TOP + CHART_H - (clamped / max) * CHART_H
}

// Larger, explicitly-labeled trend chart. The previous version had gridlines with bare
// numbers and no indication of what metric or time span was being plotted - this makes
// both explicit via an HTML caption (kept out of the SVG so text doesn't get stretched
// by preserveAspectRatio="none") plus a "%" unit marker on the axis itself.
export function TrendChart({ values, max = 100, color, gradientId, title, windowSeconds }: TrendChartProps) {
  const gridLines = GRID_LINES.map((g) => ({ ...g, y: yFor(g.value, max) }))

  const chart =
    values.length < 2 ? (
      <svg className="trend-chart" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
        {gridLines.map(({ value, label, y }) => (
          <g key={value}>
            <line x1={PAD_LEFT} x2={VIEW_W} y1={y} y2={y} className="trend-grid-line" />
            <text x={PAD_LEFT - 6} y={y + 3} className="trend-grid-label" textAnchor="end">
              {label}
            </text>
          </g>
        ))}
      </svg>
    ) : (
      (() => {
        const step = CHART_W / (values.length - 1)
        const coords = values.map((v, i) => [PAD_LEFT + i * step, yFor(v, max)] as const)
        const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
        const [firstX] = coords[0]
        const [lastX, lastY] = coords[coords.length - 1]
        const areaPath = `${linePath} L${lastX.toFixed(1)},${PAD_TOP + CHART_H} L${firstX.toFixed(1)},${PAD_TOP + CHART_H} Z`

        return (
          <svg className="trend-chart" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {gridLines.map(({ value, label, y }) => (
              <g key={value}>
                <line x1={PAD_LEFT} x2={VIEW_W} y1={y} y2={y} className="trend-grid-line" />
                <text x={PAD_LEFT - 6} y={y + 3} className="trend-grid-label" textAnchor="end">
                  {label}
                </text>
              </g>
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={lastX} cy={lastY} r="3" fill={color} className="trend-dot" />
          </svg>
        )
      })()
    )

  return (
    <div className="trend-block">
      <div className="trend-caption">
        <span>{title}</span>
        <span className="dim">last {formatDuration(windowSeconds)}</span>
      </div>
      {chart}
    </div>
  )
}
