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
    focus_mode: true,
    show_streak: true,
  })
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1 mt-1" style={{ fontSize: 12, color: 'var(--color-overdue)' }}>
      <span>×</span> {message}
    </p>
  )
}

export function RegisterPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const validate = () => {
    const e: typeof errors = {}
    if (password.length > 0 && password.length < 8) e.password = 'Минимум 8 символов'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() } },
      })
      if (err) {
        const msg = err.message.toLowerCase()
        if (msg.includes('rate limit')) {
          setErrors({ general: 'Слишком много попыток. Подожди немного.' })
        } else if (msg.includes('already registered') || msg.includes('already been registered')) {
          setErrors({ email: 'Этот email уже зарегистрирован' })
        } else {
          setErrors({ general: t('auth.error_general') })
        }
      } else if (data.user) {
        await createDefaultSettings(data.user.id)
        identifyUser(data.user.id)
        track('user_signed_up')
        if (!data.session) setNeedsConfirmation(true)
      }
    } catch {
      setErrors({ general: t('auth.error_network') })
    }
    setLoading(false)
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="px-6 pt-16 pb-10 flex flex-col items-center" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: 28, color: 'white', fontWeight: 700 }}>T</span>
          </div>
          <h1 style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>Teggo</h1>
        </div>
        <div className="flex flex-col items-center px-6 pt-12 text-center">
          <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-text)', marginBottom: 8 }}>Проверь почту</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Мы отправили ссылку на <strong>{email}</strong>. Нажми на неё и затем войди в приложение.
          </p>
          <Link
            to="/login"
            className="mt-8 block w-full py-3.5 rounded-full text-center text-white"
            style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500, fontSize: 15 }}
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-6 pt-16 pb-8 flex flex-col items-center" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: 28, color: 'white', fontWeight: 700 }}>T</span>
        </div>
        <h1 style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>Teggo</h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="section-label block mb-1.5">{t('auth.name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-[12px] outline-none"
              style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', fontSize: 15 }}
              placeholder="Мария"
            />
          </div>

          {/* Email */}
          <div>
            <label className="section-label block mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
              required
              className="w-full px-4 py-3 rounded-[12px] outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `0.5px solid ${errors.email ? 'var(--color-overdue)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                fontSize: 15,
              }}
              placeholder="you@example.com"
            />
            {errors.email && <FieldError message={errors.email} />}
          </div>

          {/* Password */}
          <div>
            <label className="section-label block mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
              required
              className="w-full px-4 py-3 rounded-[12px] outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `0.5px solid ${errors.password ? 'var(--color-overdue)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                fontSize: 15,
              }}
              placeholder="••••••••"
            />
            {errors.password && <FieldError message={errors.password} />}
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 flex-shrink-0"
              style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              {t('auth.terms')}
            </span>
          </label>

          {errors.general && <FieldError message={errors.general} />}

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-3.5 rounded-full text-white active:opacity-70 disabled:opacity-40 mt-1"
            style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500, fontSize: 15 }}
          >
            {loading ? '...' : t('auth.sign_up')}
          </button>
        </form>

        <Link to="/login" className="block mt-5 text-center" style={{ fontSize: 13, color: 'var(--color-primary)' }}>
          {t('auth.has_account')}
        </Link>
      </div>
    </div>
  )
}
