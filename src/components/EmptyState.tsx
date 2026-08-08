import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
}

export function EmptyState({ icon, text }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minHeight: 'calc(100vh - 200px)',
      gap: 12,
      padding: '0 32px',
    }}>
      <div style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>{icon}</div>
      <p style={{ fontSize: 15, color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: 1.5 }}>{text}</p>
    </div>
  )
}
