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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 96, backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', paddingTop: 52, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{t('settings.personalization')}</p>
        <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1 }}>{t('settings.title')}</h1>
      </div>

      {/* Profile row */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)', borderTop: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginTop: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary)', color: 'white', fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{displayName}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user?.email}</p>
        </div>
        <button style={{ fontSize: 12, color: '#E24B4A', background: 'none', border: 'none', cursor: 'pointer' }} onClick={handleSignOut}>
          {t('auth.sign_out')}
        </button>
      </div>

      {/* ОРГАНИЗАЦИЯ section */}
      <div style={{ marginTop: 24 }}>
        <span style={SECTION_LABEL_STYLE}>{t('settings.organization')}</span>
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => setTagsOpen(true)}>
          <SettingsRow
            label={t('settings.tags')}
            sublabel={tags.length > 0 ? `${tags.length}` : undefined}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            isFirst
          />
        </button>
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => alert('Projects page')}>
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
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => alert('Notifications coming soon')}>
          <SettingsRow
            label={t('settings.notifications_nav')}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
            isFirst
          />
        </button>
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => setLangPickerOpen(true)}>
          <SettingsRow
            label={t('settings.theme')}
            sublabel={languageLabel()}
            right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />}
          />
        </button>
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => alert('Export coming soon')}>
          <SettingsRow label={t('settings.export')} right={<ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />} />
        </button>
        <button style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => setConfirmDeleteOpen(true)}>
          <div style={{ padding: '14px 16px', backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
            <p style={{ fontSize: 15, color: '#E24B4A' }}>{t('settings.delete_account')}</p>
          </div>
        </button>
      </div>

      {/* Tags bottomsheet */}
      <Bottomsheet open={tagsOpen} onClose={() => setTagsOpen(false)} fullHeight>
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0 16px' }}>
            <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)' }}>
              {t('settings.tags')}
            </p>
            <button
              onClick={() => setCreateTagOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: 'var(--color-primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tags.map((tag) => {
                const count = getTagTaskCount(tag.id)
                return (
                  <div
                    key={tag.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '0.5px solid var(--color-border)' }}
                  >
                    <div
                      style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: `${tag.color}20` }}
                    >
                      <TagIcon icon={tag.icon ?? 'tag'} size={17} color={tag.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, color: 'var(--color-text)', fontWeight: 500 }}>{tag.name}</p>
                      {count > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{count} задач</p>
                      )}
                    </div>
                    <button onClick={() => deleteTag(tag.id)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
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
        <div style={{ padding: '0 16px 24px' }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)', padding: '12px 0 20px' }}>
            Новый тег
          </p>

          {/* Name input */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <p style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Название</p>
              <p style={{ fontSize: 11, color: '#AAAAAA' }}>{newTagName.length}/12</p>
            </div>
            <input
              autoFocus
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value.slice(0, 12))}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="Название тега"
              style={{
                width: '100%',
                outline: 'none',
                background: 'transparent',
                fontSize: 16,
                color: 'var(--color-text)',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: '1px solid var(--color-border-strong)',
                paddingBottom: 8,
              }}
              maxLength={12}
            />
          </div>

          {/* Color picker */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#AAAAAA', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Цвет</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {CREATE_TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewTagColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    flexShrink: 0,
                    backgroundColor: c,
                    outline: newTagColor === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleCreateTag}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 14,
              fontSize: 15,
              backgroundColor: '#F0956E',
              color: '#FFFFFF',
              fontWeight: 500,
              opacity: newTagName.trim() && !savingTag ? 1 : 0.4,
              pointerEvents: newTagName.trim() && !savingTag ? 'auto' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('common.save')}
          </button>
        </div>
      </Bottomsheet>

      {/* Language / theme picker */}
      <Bottomsheet open={langPickerOpen} onClose={() => setLangPickerOpen(false)}>
        <div style={{ padding: '0 16px 24px' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)', padding: '12px 0 8px' }}>{t('settings.language')}</p>
          {([['auto', 'Auto'], ['ru', 'Русский'], ['en', 'English']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => { updateSettings({ language: val }); setLangPickerOpen(false) }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 0',
                fontSize: 15,
                color: settings?.language === val ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: settings?.language === val ? 500 : 400,
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: '0.5px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text)', padding: '16px 0 8px' }}>{t('settings.dark_mode')}</p>
          <SettingsRow
            label={t('settings.dark_mode')}
            sublabel={t('settings.dark_mode_sub')}
            right={<Toggle on={settings?.dark_mode === 'dark'} onChange={(v) => updateSettings({ dark_mode: v ? 'dark' : 'light' })} />}
          />
        </div>
      </Bottomsheet>

      {/* Delete confirm */}
      {confirmDeleteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDeleteOpen(false)} />
          <div style={{ position: 'relative', width: '100%', borderRadius: 20, padding: 24, backgroundColor: 'var(--color-surface)' }}>
            <p style={{ fontSize: 16, marginBottom: 20, color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ flex: 1, padding: '12px 0', borderRadius: 9999, fontSize: 14, color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', background: 'none', cursor: 'pointer' }} onClick={() => setConfirmDeleteOpen(false)}>
                {t('common.confirm_delete_no')}
              </button>
              <button style={{ flex: 1, padding: '12px 0', borderRadius: 9999, fontSize: 14, color: 'white', backgroundColor: '#E24B4A', border: 'none', cursor: 'pointer' }} onClick={handleDeleteAccount}>
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: 'var(--color-surface)',
        borderTop: isFirst ? '0.5px solid var(--color-border)' : 'none',
        borderBottom: '0.5px solid var(--color-border)',
      }}
    >
      <div>
        <p style={{ fontSize: 15, color: 'var(--color-text)' }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sublabel}</p>}
      </div>
      {right}
    </div>
  )
}
