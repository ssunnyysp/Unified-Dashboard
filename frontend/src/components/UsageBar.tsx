interface UsageBarProps {
  percent: number
}

type Tone = 'good' | 'warn' | 'bad'

function toneFor(percent: number): Tone {
  if (percent >= 85) return 'bad'
  if (percent >= 60) return 'warn'
  return 'good'
}

export function UsageBar({ percent }: UsageBarProps) {
  const clamped = Math.min(Math.max(percent, 0), 100)
  return (
    <div className="usage-bar" data-tone={toneFor(clamped)}>
      <div className="usage-bar-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}
