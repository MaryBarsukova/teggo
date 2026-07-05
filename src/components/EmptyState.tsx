import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
}

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div>{icon}</div>
      <p className="text-[14px] text-center" style={{ color: 'var(--color-text-muted)' }}>{text}</p>
    </div>
  )
}
