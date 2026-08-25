interface SparklineProps {
  values: number[]
  max?: number
  color?: string
}

const WIDTH = 100
const HEIGHT = 28

export function Sparkline({ values, max = 100, color = 'var(--accent)' }: SparklineProps) {
  if (values.length < 2) {
    return <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" />
  }

  const step = WIDTH / (values.length - 1)
  const points = values
    .map((value, i) => {
      const x = i * step
      const clamped = Math.min(Math.max(value, 0), max)
      const y = HEIGHT - (clamped / max) * HEIGHT
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
