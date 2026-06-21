import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Trash2 } from 'lucide-react'
import { Toggle } from '../components/Toggle'
import { Bottomsheet } from '../components/Bottomsheet'
import { useSettingsStore } from '../store/settingsStore'
import { useTagStore } from '../store/tagStore'
import { useTaskStore } from '../store/taskStore'
import { TagIcon } from '../components/AddTaskBottomsheet'
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
  const { tags, fetchTags, deleteTag } = useTagStore()
  const { tasks } = useTaskStore()
  const [user, setUser] = useState<User | null>(null)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchTags()
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

  const getTagTaskCount = (tagId: string) => {
    return tasks.filter((task) => (task.tag_ids ?? []).includes(tagId)).length
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ backgroundColor: 'var(--color-primary)' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>{t('settings.personalization')}</p>
        <h1 style={{ fontSize: 32, color: 'white', fontWeight: 500, lineHeight: 1.1 }}>{t('settings.title')}</h1>
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

      {/* ОРГАНИЗАЦИЯ section */}
      <div className="mx-4 mt-4">
        <p className="section-label px-1 mb-2">{t('settings.organization')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <button className="w-full" onClick={() => setTagsOpen(true)}>
            <SettingsRow
              label={t('settings.tags')}
              sublabel={tags.length > 0 ? `${tags.length}` : undefined}
              right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            />
          </button>
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <button className="w-full" onClick={() => alert('Projects page')}>
            <SettingsRow
              label={t('settings.projects_manage')}
              sublabel={t('settings.projects_manage_sub')}
              right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            />
          </button>
        </div>
      </div>

      {/* ЗАДАЧИ section */}
      <div className="mx-4 mt-4">
        <p className="section-label px-1 mb-2">{t('settings.tasks_section')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <SettingsRow
            label={t('settings.show_description')}
            sublabel={t('settings.show_description_sub')}
            right={<Toggle on={settings?.show_description ?? true} onChange={(v) => updateSettings({ show_description: v })} />}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <SettingsRow
            label={t('settings.focus_mode')}
            sublabel={t('settings.focus_mode_sub')}
            right={<Toggle on={settings?.focus_mode ?? true} onChange={(v) => updateSettings({ focus_mode: v })} />}
          />
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <SettingsRow
            label={t('settings.streak')}
            sublabel={t('settings.streak_sub')}
            right={<Toggle on={settings?.show_streak ?? true} onChange={(v) => updateSettings({ show_streak: v })} />}
          />
        </div>
      </div>

      {/* ПРИЛОЖЕНИЕ section */}
      <div className="mx-4 mt-4">
        <p className="section-label px-1 mb-2">{t('settings.app_section')}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '0.5px solid var(--color-border)' }}>
          <button className="w-full" onClick={() => alert('Notifications coming soon')}>
            <SettingsRow
              label={t('settings.notifications_nav')}
              right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            />
          </button>
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <button className="w-full" onClick={() => setLangPickerOpen(true)}>
            <SettingsRow
              label={t('settings.theme')}
              sublabel={languageLabel()}
              right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            />
          </button>
          <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 16 }} />
          <button className="w-full" onClick={() => alert('Export coming soon')}>
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

      {/* Tags bottomsheet */}
      <Bottomsheet open={tagsOpen} onClose={() => setTagsOpen(false)} fullHeight>
        <div className="px-4 pb-6">
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)', padding: '12px 0 16px' }}>
            {t('settings.tags')}
          </p>
          {tags.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 32 }}>
              Тегов пока нет
            </p>
          ) : (
            <div className="flex flex-col">
              {tags.map((tag) => {
                const count = getTagTaskCount(tag.id)
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 py-3"
                    style={{ borderBottom: '0.5px solid var(--color-border)' }}
                  >
                    {/* Colored icon square */}
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${tag.color}20` }}
                    >
                      <TagIcon icon={tag.icon ?? 'tag'} size={17} color={tag.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, color: 'var(--color-text)', fontWeight: 500 }}>{tag.name}</p>
                      {count > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{count} задач</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="p-2 active:opacity-50"
                    >
                      <Trash2 size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Bottomsheet>

      {/* Language / theme picker */}
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
          <p className="text-[16px] py-3 mt-4 mb-2" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{t('settings.dark_mode')}</p>
          <SettingsRow
            label={t('settings.dark_mode')}
            sublabel={t('settings.dark_mode_sub')}
            right={<Toggle on={settings?.dark_mode === 'dark'} onChange={(v) => updateSettings({ dark_mode: v ? 'dark' : 'light' })} />}
          />
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
