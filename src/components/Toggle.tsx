// React auto-import

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
        className="relative flex items-center w-[52px] h-[28px] rounded-full transition-colors duration-200"
        style={{
          backgroundColor: on ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.15)',
        }}
      >
        <span
          className="absolute w-5 h-5 rounded-full transition-transform duration-200"
          style={{
            backgroundColor: on ? 'var(--color-primary)' : 'white',
            transform: on ? 'translateX(28px)' : 'translateX(4px)',
          }}
        />
      </button>
    )
  }

  return (
    <button
      onClick={() => onChange(!on)}
      className="relative flex items-center w-[48px] h-[26px] rounded-full transition-colors duration-200"
      style={{
        backgroundColor: on ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <span
        className="absolute w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200"
        style={{
          transform: on ? 'translateX(26px)' : 'translateX(4px)',
        }}
      />
    </button>
  )
}
