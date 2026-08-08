import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  text: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, text, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minHeight: 'calc(100vh - 220px)',
      gap: 10,
      padding: '0 40px',
      textAlign: 'center',
    }}>
      <div style={{ color: 'var(--color-text-muted)', opacity: 0.35, marginBottom: 4 }}>{icon}</div>
      <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.4 }}>{text}</p>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5, maxWidth: 260 }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            borderRadius: 12,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            fontSize: 14,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
