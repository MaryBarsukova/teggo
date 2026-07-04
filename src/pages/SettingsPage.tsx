import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Trash2, Plus } from 'lucide-react'
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

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  color: '#AAAAAA',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '0 16px',
  marginBottom: 8,
  display: 'block',
}

const CREATE_TAG_COLORS = ['#F0956E', '#7A9E6C', '#378ADD', '#A96CC4', '#E2A030', '#D4537E']

export function SettingsPage() {
  const { t } = useTranslation()
  const { settings, fetchSettings, updateSettings } = useSettingsStore()
  const { tags, fetchTags, deleteTag, addTag } = useTagStore()
  const { tasks } = useTaskStore()
  const [user, setUser] = useState<User | null>(null)
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [createTagOpen, setCreateTagOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(CREATE_TAG_COLORS[0])
  const [savingTag, setSavingTag] = useState(false)

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

  const handleCreateTag = async () => {
    if (!newTagName.trim() || savingTag) return
    setSavingTag(true)
    await addTag(newTagName.trim(), newTagColor, 'tag')
    setNewTagName('')
    setNewTagColor(CREATE_TAG_COLORS[0])
    setSavingTag(false)
    setCreateTagOpen(false)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ backgroundColor: 'var(--color-primary)' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 2 }}>{t('settings.personalization')}</p>
        <h1 style={{ fontSize: 28, color: 'white', fontWeight: 500, lineHeight: 1.1 }}>{t('settings.title')}</h1>
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
      <div style={{ marginTop: 24 }}>
        <span style={SECTION_LABEL_STYLE}>{t('settings.organization')}</span>
        <button className="w-full" onClick={() => setTagsOpen(true)}>
          <SettingsRow
            label={t('settings.tags')}
            sublabel={tags.length > 0 ? `${tags.length}` : undefined}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            isFirst
          />
        </button>
        <button className="w-full" onClick={() => alert('Projects page')}>
          <SettingsRow
            label={t('settings.projects_manage')}
            sublabel={t('settings.projects_manage_sub')}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
          />
        </button>
      </div>

      {/* ЗАДАЧИ section */}
      <div style={{ marginTop: 24 }}>
        <span style={SECTION_LABEL_STYLE}>{t('settings.tasks_section')}</span>
        <SettingsRow
          label={t('settings.show_description')}
          sublabel={t('settings.show_description_sub')}
          right={<Toggle on={settings?.show_description ?? true} onChange={(v) => updateSettings({ show_description: v })} />}
          isFirst
        />
        <SettingsRow
          label={t('settings.focus_mode')}
          sublabel={t('settings.focus_mode_sub')}
          right={<Toggle on={settings?.focus_mode ?? true} onChange={(v) => updateSettings({ focus_mode: v })} />}
        />
        <SettingsRow
          label={t('settings.streak')}
          sublabel={t('settings.streak_sub')}
          right={<Toggle on={settings?.show_streak ?? true} onChange={(v) => updateSettings({ show_streak: v })} />}
        />
      </div>

      {/* ПРИЛОЖЕНИЕ section */}
      <div style={{ marginTop: 24 }}>
        <span style={SECTION_LABEL_STYLE}>{t('settings.app_section')}</span>
        <button className="w-full" onClick={() => alert('Notifications coming soon')}>
          <SettingsRow
            label={t('settings.notifications_nav')}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            isFirst
          />
        </button>
        <button className="w-full" onClick={() => setLangPickerOpen(true)}>
          <SettingsRow
            label={t('settings.theme')}
            sublabel={languageLabel()}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
          />
        </button>
        <button className="w-full" onClick={() => alert('Export coming soon')}>
          <SettingsRow label={t('settings.export')} right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />} />
        </button>
        <button className="w-full" onClick={() => setConfirmDeleteOpen(true)}>
          <div style={{ padding: '14px 16px', backgroundColor: 'white', borderBottom: '0.5px solid rgba(45,27,20,0.08)' }}>
            <p style={{ fontSize: 14, color: 'var(--color-overdue)' }}>{t('settings.delete_account')}</p>
          </div>
        </button>
      </div>

      {/* Tags bottomsheet */}
      <Bottomsheet open={tagsOpen} onClose={() => setTagsOpen(false)} fullHeight>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between" style={{ padding: '12px 0 16px' }}>
            <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)' }}>
              {t('settings.tags')}
            </p>
            <button
              onClick={() => setCreateTagOpen(true)}
              className="flex items-center gap-1 active:opacity-60"
              style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}
            >
              <Plus size={16} />
              Создать тег
            </button>
          </div>
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
                    <button onClick={() => deleteTag(tag.id)} className="p-2 active:opacity-50">
                      <Trash2 size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Bottomsheet>

      {/* Create tag bottomsheet */}
      <Bottomsheet open={createTagOpen} onClose={() => { setCreateTagOpen(false); setNewTagName(''); setNewTagColor(CREATE_TAG_COLORS[0]) }}>
        <div className="px-4 pb-6">
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)', padding: '12px 0 20px' }}>
            Новый тег
          </p>

          {/* Name input */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <p style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Название</p>
              <p style={{ fontSize: 11, color: '#AAAAAA' }}>{newTagName.length}/12</p>
            </div>
            <input
              autoFocus
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value.slice(0, 12))}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="Название тега"
              className="w-full outline-none bg-transparent"
              style={{
                fontSize: 16,
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-border-strong)',
                paddingBottom: 8,
              }}
              maxLength={12}
            />
          </div>

          {/* Color picker */}
          <div className="mb-6">
            <p style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Цвет</p>
            <div className="flex gap-3">
              {CREATE_TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: c,
                    outline: newTagColor === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleCreateTag}
            className="w-full py-3.5 rounded-[14px]"
            style={{
              fontSize: 15,
              backgroundColor: '#F0956E',
              color: '#FFFFFF',
              fontWeight: 500,
              opacity: newTagName.trim() && !savingTag ? 1 : 0.5,
              pointerEvents: newTagName.trim() && !savingTag ? 'auto' : 'none',
            }}
          >
            {t('common.save')}
          </button>
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
  isFirst?: boolean
}

function SettingsRow({ label, sublabel, right, isFirst }: SettingsRowProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '14px 16px',
        backgroundColor: 'white',
        borderTop: isFirst ? '0.5px solid rgba(45,27,20,0.08)' : 'none',
        borderBottom: '0.5px solid rgba(45,27,20,0.08)',
      }}
    >
      <div>
        <p style={{ fontSize: 14, color: 'var(--color-text)' }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sublabel}</p>}
      </div>
      {right}
    </div>
  )
}
