import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { identifyUser, track } from '../lib/analytics'

async function createDefaultSettings(userId: string) {
  await supabase.from('user_settings').insert({
    user_id: userId,
    show_description: true,
    dark_mode: 'system',
    language: 'auto',
    notifications: true,
    morning_digest: true,
    morning_time: '08:00',
  })
}

export function RegisterPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (err) {
      if (err.message.toLowerCase().includes('rate limit')) {
        setError('Email sending is rate-limited by Supabase. Please go to Supabase Dashboard → Authentication → Providers → Email and turn OFF "Confirm email", then try again.')
      } else {
        setError(err.message)
      }
    } else if (data.user) {
      await createDefaultSettings(data.user.id)
      identifyUser(data.user.id, { email: data.user.email, name })
      track('user_signed_up')
      // If email confirmation required, session will be null
      if (!data.session) {
        setNeedsConfirmation(true)
      }
    }
    setLoading(false)
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="mb-6 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-[22px] mb-2" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Check your email</h2>
          <p className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
        </div>
        <Link to="/login" className="block text-center py-3.5 rounded-full text-[14px] text-white" style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}>
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="mb-10">
        <h1 className="text-[28px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>Teggo</h1>
        <p className="text-[14px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Personal task planner</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{t('auth.name')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)' }}
            placeholder="Maria"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)' }}
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 text-[14px] rounded-[var(--radius-md)] outline-none"
            style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)' }}
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
          {loading ? '...' : t('auth.sign_up')}
        </button>
      </form>

      <Link to="/login" className="mt-6 text-center text-[13px]" style={{ color: 'var(--color-primary)' }}>
        {t('auth.has_account')}
      </Link>
    </div>
  )
}
