import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-[22px] mb-2" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Check your email</h2>
          <p className="text-[14px] mb-8" style={{ color: 'var(--color-text-muted)' }}>
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <Link
            to="/login"
            className="block text-center py-3.5 rounded-full text-[14px] text-white"
            style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="mb-10">
        <h1 className="text-[28px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Teggo</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Forgot your password?</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            placeholder="you@example.com"
          />
        </div>

        {error && <p className="text-[12px]" style={{ color: 'var(--color-overdue)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full text-[14px] text-white mt-2 active:opacity-70 disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
        >
          {loading ? '...' : 'Send reset link'}
        </button>
      </form>

      <Link to="/login" className="mt-6 text-center text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        ← Back to sign in
      </Link>
    </div>
  )
}
