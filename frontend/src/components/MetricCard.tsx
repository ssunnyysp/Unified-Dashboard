import type { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  subtitle?: string
  wide?: boolean
  children: ReactNode
}

export function MetricCard({ title, subtitle, wide, children }: MetricCardProps) {
  return (
    <section className={wide ? 'card card-wide' : 'card'}>
      <header className="card-header">
        <h2>{title}</h2>
        {subtitle && <span className="card-subtitle">{subtitle}</span>}
      </header>
      <div className="card-body">{children}</div>
    </section>
  )
}
