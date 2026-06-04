// React auto-import

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  color?: 'peach' | 'gray'
}

export function Checkbox({ checked, onChange, color = 'peach' }: CheckboxProps) {
  const peach = color === 'peach'

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      className="flex-shrink-0 w-[22px] h-[22px] rounded-full border flex items-center justify-center transition-colors"
      style={{
        borderColor: checked ? (peach ? 'var(--color-primary)' : 'var(--color-inactive)') : (peach ? 'var(--color-primary)' : 'var(--color-inactive)'),
        backgroundColor: checked ? (peach ? 'var(--color-primary)' : 'var(--color-inactive)') : 'transparent',
      }}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path
            d="M1 4L4.5 7.5L11 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="checkbox-check"
          />
        </svg>
      )}
    </button>
  )
}
