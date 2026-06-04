import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the token in the URL hash — it handles the session automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="mb-10">
        <h1 className="text-[28px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Teggo</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Set a new password</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            placeholder="••••••••"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-[12px]" style={{ color: 'var(--color-overdue)' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full text-[14px] text-white mt-2 active:opacity-70 disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
        >
          {loading ? '...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
