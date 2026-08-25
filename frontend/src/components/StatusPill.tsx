import type { ReactNode } from 'react'

export type PillTone = 'good' | 'warn' | 'bad' | 'neutral'

export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}
