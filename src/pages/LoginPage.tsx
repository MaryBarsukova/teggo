import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { identifyUser, track } from '../lib/analytics'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      if (err.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first. Check your inbox for a confirmation link.')
      } else {
        setError(err.message)
      }
    } else if (data.user) {
      identifyUser(data.user.id, { email: data.user.email })
      track('user_signed_in')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="mb-10">
        <h1 className="text-[28px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Teggo</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Personal task planner</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '0.5px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{t('auth.password')}</label>
            <Link to="/forgot-password" className="text-[12px]" style={{ color: 'var(--color-primary)' }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? '...' : t('auth.sign_in')}
        </button>
      </form>

      <Link to="/register" className="mt-6 text-center text-[13px]" style={{ color: 'var(--color-primary)' }}>
        {t('auth.no_account')}
      </Link>
    </div>
  )
}
