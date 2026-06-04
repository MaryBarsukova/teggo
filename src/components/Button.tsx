import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  fullWidth?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', fullWidth = false, type = 'button', disabled = false }: ButtonProps) {
  const base = 'px-4 py-2.5 rounded-full text-[14px] font-[500] transition-opacity active:opacity-70 disabled:opacity-40'
  const variants = {
    primary: 'text-white',
    ghost: 'text-[var(--color-text-muted)]',
    danger: 'text-[var(--color-overdue)]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
      style={variant === 'primary' ? { backgroundColor: 'var(--color-primary)' } : undefined}
    >
      {children}
    </button>
  )
}
