import { useState, type MouseEvent } from 'react'
import { formatDuration } from '../lib/format'

interface TrendChartProps {
  values: number[]
  max?: number
  color: string
  gradientId: string
  title: string
  /** Seconds between samples - used both for the "last Xm" caption and per-point hover times. */
  intervalSeconds: number
  /** SVG viewBox height in px - taller in the full-screen detail view. */
  height?: number
}

const VIEW_W = 320
const PAD_LEFT = 30
const PAD_TOP = 8
const PAD_BOTTOM = 8
const CHART_W = VIEW_W - PAD_LEFT
const GRID_LINES = [
  { value: 0, label: '0' },
  { value: 50, label: '50' },
  { value: 100, label: '100%' },
]

export function TrendChart({ values, max = 100, color, gradientId, title, intervalSeconds, height = 112 }: TrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const viewH = height
  const chartH = viewH - PAD_TOP - PAD_BOTTOM

  function yFor(value: number): number {
    const clamped = Math.min(Math.max(value, 0), max)
    return PAD_TOP + chartH - (clamped / max) * chartH
  }

  const gridLines = GRID_LINES.map((g) => ({ ...g, y: yFor(g.value) }))
  const windowSeconds = values.length * intervalSeconds

  const caption = (
    <div className="trend-caption">
      <span>{title}</span>
      <span className="dim">last {formatDuration(windowSeconds)}</span>
    </div>
  )

  if (values.length < 2) {
    return (
      <div className="trend-block">
        {caption}
        <svg className="trend-chart" viewBox={`0 0 ${VIEW_W} ${viewH}`} style={{ height: viewH }} preserveAspectRatio="none">
          {gridLines.map(({ value, label, y }) => (
            <g key={value}>
              <line x1={PAD_LEFT} x2={VIEW_W} y1={y} y2={y} className="trend-grid-line" />
              <text x={PAD_LEFT - 6} y={y + 3} className="trend-grid-label" textAnchor="end">
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    )
  }

  const step = CHART_W / (values.length - 1)
  const coords = values.map((v, i) => [PAD_LEFT + i * step, yFor(v)] as const)
  const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [firstX] = coords[0]
  const [lastX, lastY] = coords[coords.length - 1]
  const areaPath = `${linePath} L${lastX.toFixed(1)},${PAD_TOP + chartH} L${firstX.toFixed(1)},${PAD_TOP + chartH} Z`

  function handleMove(event: MouseEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    const viewBoxX = ratio * VIEW_W
    const index = Math.round((viewBoxX - PAD_LEFT) / step)
    setHoverIndex(Math.min(Math.max(index, 0), values.length - 1))
  }

  const hovered =
    hoverIndex !== null
      ? { index: hoverIndex, x: coords[hoverIndex][0], y: coords[hoverIndex][1], value: values[hoverIndex] }
      : null
  const hoverLeftPercent = hovered ? (hovered.x / VIEW_W) * 100 : 0
  const secondsAgo = hovered ? (values.length - 1 - hovered.index) * intervalSeconds : 0
  const tooltipAnchor = hoverLeftPercent < 15 ? 'start' : hoverLeftPercent > 85 ? 'end' : 'center'

  return (
    <div className="trend-block">
      {caption}

      <div className="trend-chart-wrap">
        <svg className="trend-chart" viewBox={`0 0 ${VIEW_W} ${viewH}`} style={{ height: viewH }} preserveAspectRatio="none">
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

          {hovered && (
            <line x1={hovered.x} x2={hovered.x} y1={PAD_TOP} y2={PAD_TOP + chartH} className="trend-hover-line" />
          )}

          <circle cx={lastX} cy={lastY} r="3" fill={color} className="trend-dot" />

          {hovered && <circle cx={hovered.x} cy={hovered.y} r="4" fill={color} className="trend-hover-dot" />}

          {/* Wide invisible strip, not per-point targets - with points only a few px apart,
              discrete hit circles would be nearly impossible to land on with a mouse. */}
          <rect
            x={PAD_LEFT}
            y={0}
            width={CHART_W}
            height={viewH}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered && (
          <div className="trend-tooltip" data-anchor={tooltipAnchor} style={{ left: `${hoverLeftPercent}%` }}>
            <span className="trend-tooltip-value">{hovered.value.toFixed(0)}%</span>
            <span className="trend-tooltip-time">{secondsAgo === 0 ? 'now' : `${formatDuration(secondsAgo)} ago`}</span>
          </div>
        )}
      </div>
    </div>
  )
}
