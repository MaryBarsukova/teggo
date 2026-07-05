interface ToggleProps {
  on: boolean
  onChange: (on: boolean) => void
  variant?: 'default' | 'header'
}

export function Toggle({ on, onChange, variant = 'default' }: ToggleProps) {
  if (variant === 'header') {
    return (
      <button
        onClick={() => onChange(!on)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: 44,
          height: 24,
          borderRadius: 9999,
          backgroundColor: on ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.25)',
          border: 'none',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background-color 0.2s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: 18,
            height: 18,
            borderRadius: 9999,
            backgroundColor: on ? 'var(--color-primary)' : 'rgba(255,255,255,0.8)',
            transform: on ? 'translateX(22px)' : 'translateX(3px)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    )
  }

  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        borderRadius: 9999,
        backgroundColor: on ? 'var(--color-primary)' : '#DDDDDD',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.2s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 18,
          height: 18,
          borderRadius: 9999,
          backgroundColor: 'white',
          transform: on ? 'translateX(22px)' : 'translateX(3px)',
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  )
}
