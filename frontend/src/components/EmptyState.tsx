interface EmptyStateProps {
  message: string
  tone?: 'neutral' | 'bad'
}

export function EmptyState({ message, tone = 'neutral' }: EmptyStateProps) {
  return <p className={`empty-state empty-state-${tone}`}>{message}</p>
}
