import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { identifyUser, track } from '../lib/analytics'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      if (err.message.toLowerCase().includes('email not confirmed')) {
        setEmailError('Подтвердите email — проверьте почту.')
      } else if (err.message.toLowerCase().includes('invalid login credentials') || err.message.toLowerCase().includes('invalid credentials')) {
        setPasswordError('Неверный email или пароль.')
      } else {
        setGeneralError(err.message)
      }
    } else if (data.user) {
      identifyUser(data.user.id, { email: data.user.email })
      track('user_signed_in')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Salmon header area */}
      <div
        className="flex flex-col items-center justify-center pt-16 pb-10"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {/* Logo mark */}
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="3" rx="1.5" fill="white" />
            <rect x="4" y="15" width="18" height="3" rx="1.5" fill="white" />
            <rect x="4" y="22" width="21" height="3" rx="1.5" fill="white" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: 'white', letterSpacing: -0.5 }}>Teggo</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Personal task planner</p>
      </div>

      {/* Form area */}
      <div className="flex-1 px-6 pt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label
              className="text-[11px] tracking-widest"
              style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.08em' }}
            >
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
              required
              className="w-full px-4 py-3 text-[15px] rounded-[var(--radius-md)] outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: emailError ? '1px solid var(--color-overdue)' : '0.5px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="you@example.com"
            />
            {emailError && (
              <p style={{ fontSize: 12, color: 'var(--color-overdue)', marginTop: 2 }}>× {emailError}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                className="text-[11px] tracking-widest"
                style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.08em' }}
              >
                {t('auth.password')}
              </label>
              <Link to="/forgot-password" className="text-[12px]" style={{ color: 'var(--color-primary)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
              required
              className="w-full px-4 py-3 text-[15px] rounded-[var(--radius-md)] outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: passwordError ? '1px solid var(--color-overdue)' : '0.5px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="••••••••"
            />
            {passwordError && (
              <p style={{ fontSize: 12, color: 'var(--color-overdue)', marginTop: 2 }}>× {passwordError}</p>
            )}
          </div>

          {generalError && (
            <p style={{ fontSize: 12, color: 'var(--color-overdue)' }}>× {generalError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-[15px] text-white mt-2 active:opacity-70 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
          >
            {loading ? '...' : t('auth.sign_in')}
          </button>
        </form>

        <Link to="/register" className="mt-6 block text-center text-[13px]" style={{ color: 'var(--color-primary)' }}>
          {t('auth.no_account')}
        </Link>
      </div>
    </div>
  )
}
