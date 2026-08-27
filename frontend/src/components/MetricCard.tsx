import type { KeyboardEvent, ReactNode } from 'react'

interface MetricCardProps {
  title: string
  subtitle?: string
  wide?: boolean
  expanded?: boolean
  onClick?: () => void
  children: ReactNode
}

export function MetricCard({ title, subtitle, wide, expanded, onClick, children }: MetricCardProps) {
  const classNames = ['card']
  if (wide) classNames.push('card-wide')
  if (expanded) classNames.push('card-expanded')
  if (onClick) classNames.push('card-clickable')

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!onClick) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <section
      className={classNames.join(' ')}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View detailed ${title} stats` : undefined}
    >
      <header className="card-header">
        <h2>{title}</h2>
        {subtitle && <span className="card-subtitle">{subtitle}</span>}
      </header>
      <div className="card-body">{children}</div>
    </section>
  )
}
