import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'
import { Toggle } from '../components/Toggle'
import { Bottomsheet } from '../components/Bottomsheet'
import { useSettingsStore } from '../store/settingsStore'
import { supabase } from '../lib/supabase'
import i18n from '../lib/i18n'

interface User {
  id: string
  email?: string
  user_metadata?: { display_name?: string }
}

export function SettingsPage() {
  const { t } = useTranslation()
  const { settings, fetchSettings, updateSettings } = useSettingsStore()
  const [user, setUser] = useState<User | null>(null)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
    supabase.auth.getUser().then(({ data }) => setUser(data.user as User))
  }, [])

  useEffect(() => {
    if (settings?.language && settings.language !== 'auto') {
      i18n.changeLanguage(settings.language)
    } else if (settings?.language === 'auto') {
      i18n.changeLanguage(navigator.language.startsWith('ru') ? 'ru' : 'en')
    }
  }, [settings?.language])

  const displayName = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? '?'
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleDeleteAccount = async () => {
    setConfirmDeleteOpen(false)
    await supabase.auth.signOut()
  }

  const languageLabel = () => {
    switch (settings?.language) {
      case 'ru': return 'Русский'
      case 'en': return 'English'
      default: return 'Auto'
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1 className="text-[22px] text-white" style={{ fontWeight: 500 }}>{t('settings.title')}</h1>
      </div>

      {/* Profile */}
      <div className="mx-4 mt-4 p-4 rounded-[var(--radius-md)] flex items-center gap-3" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px]" style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}>
          {initials}
        </div>
        <div>
          <p className="text-[14px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{displayName}</p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
        </div>
        <button className="ml-auto text-[12px]" style={{ color: 'var(--color-overdue)' }} onClick={handleSignOut}>
          {t('auth.sign_out')}
        </button>
      </div>

      {/* Display section */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('settings.display')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <SettingsRow
            label={t('settings.show_description')}
            sublabel={t('settings.show_description_sub')}
            right={<Toggle on={settings?.show_description ?? true} onChange={(v) => updateSettings({ show_description: v })} />}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <SettingsRow
            label={t('settings.dark_mode')}
            sublabel={t('settings.dark_mode_sub')}
            right={<Toggle on={settings?.dark_mode === 'dark'} onChange={(v) => updateSettings({ dark_mode: v ? 'dark' : 'light' })} />}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <button className="w-full" onClick={() => setLangPickerOpen(true)}>
            <SettingsRow
              label={t('settings.language')}
              sublabel={languageLabel()}
              right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('settings.notifications_section')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <SettingsRow
            label={t('settings.push')}
            sublabel={t('settings.push_sub')}
            right={<Toggle on={settings?.notifications ?? false} onChange={(v) => updateSettings({ notifications: v })} />}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <SettingsRow
            label={t('settings.morning_digest')}
            sublabel={settings?.morning_time ?? '08:00'}
            right={<Toggle on={settings?.morning_digest ?? false} onChange={(v) => updateSettings({ morning_digest: v })} />}
          />
        </div>
      </div>

      {/* Data */}
      <div className="mx-4 mt-4">
        <p className="text-[11px] px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('settings.data')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <button className="w-full" onClick={() => alert('Coming soon')}>
            <SettingsRow label={t('settings.export')} right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />} />
          </button>
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <button className="w-full" onClick={() => setConfirmDeleteOpen(true)}>
            <div className="flex items-center px-4 py-3.5">
              <p className="text-[14px]" style={{ color: 'var(--color-overdue)' }}>{t('settings.delete_account')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Language picker */}
      <Bottomsheet open={langPickerOpen} onClose={() => setLangPickerOpen(false)}>
        <div className="px-4 pb-6">
          <p className="text-[16px] py-3 mb-2" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{t('settings.language')}</p>
          {([['auto', 'Auto'], ['ru', 'Русский'], ['en', 'English']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => { updateSettings({ language: val }); setLangPickerOpen(false) }}
              className="w-full text-left py-3.5 text-[15px]"
              style={{
                color: settings?.language === val ? 'var(--color-primary)' : 'var(--color-text)',
                borderBottom: '0.5px solid var(--color-border)',
                fontWeight: settings?.language === val ? 500 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </Bottomsheet>

      {/* Delete confirm */}
      {confirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDeleteOpen(false)} />
          <div className="relative w-full rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-[16px] mb-5" style={{ color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-full text-[14px]" style={{ color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)' }} onClick={() => setConfirmDeleteOpen(false)}>
                {t('common.confirm_delete_no')}
              </button>
              <button className="flex-1 py-3 rounded-full text-[14px] text-white" style={{ backgroundColor: 'var(--color-overdue)' }} onClick={handleDeleteAccount}>
                {t('common.confirm_delete_yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SettingsRowProps {
  label: string
  sublabel?: string
  right?: React.ReactNode
}

function SettingsRow({ label, sublabel, right }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <p className="text-[14px]" style={{ color: 'var(--color-text)' }}>{label}</p>
        {sublabel && <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{sublabel}</p>}
      </div>
      {right}
    </div>
  )
}
