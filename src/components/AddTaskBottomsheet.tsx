import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Clock, Repeat2, ChevronRight, X, Check, Tag, Briefcase, Heart, GraduationCap, Code2, Home, Scissors, Dumbbell } from 'lucide-react'
import { Bottomsheet } from './Bottomsheet'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { useTagStore } from '../store/tagStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import type { Task } from '../types'

export const TAG_COLORS = ['#E07060', '#7C6FCC', '#3D9968', '#C49A3A', '#C04080', '#4A7FD9', '#52B040', '#8A8A8A']
export const TAG_ICONS = ['dumbbell', 'briefcase', 'heart', 'graduation-cap', 'code', 'home', 'scissors', 'tag']

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'dumbbell': Dumbbell,
  'briefcase': Briefcase,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'code': Code2,
  'home': Home,
  'scissors': Scissors,
  'tag': Tag,
}

export function TagIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  const IconComp = ICON_MAP[icon] ?? Tag
  return <IconComp size={size} color={color} />
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function AddTaskBottomsheet() {
  const { t } = useTranslation()
  const { isAddTaskOpen, editingTask, newTaskDefaults, closeAddTask } = useUIStore()
  const { addTask, updateTask } = useTaskStore()
  const { projects } = useProjectStore()
  const { tags, addTag } = useTagStore()
  const settings = useSettingsStore((s) => s.settings)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [repeatType, setRepeatType] = useState<Task['repeat_type']>('none')
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [showRepeat, setShowRepeat] = useState(false)
  // New tag form
  const [addingTag, setAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [newTagIcon, setNewTagIcon] = useState(TAG_ICONS[0])

  const isEditing = !!(editingTask?.id)

  useEffect(() => {
    if (!isAddTaskOpen) return
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description ?? '')
      setDate(editingTask.date ?? '')
      setTime(editingTask.time ?? '')
      setRepeatType(editingTask.repeat_type)
      setRepeatDays(editingTask.repeat_days ?? [])
      setTagIds(editingTask.tag_ids ?? [])
      setProjectId(editingTask.project_id)
    } else {
      setTitle('')
      setDescription('')
      setDate(newTaskDefaults?.date ?? '')
      setTime(newTaskDefaults?.time ?? '')
      setRepeatType('none')
      setRepeatDays([])
      setTagIds(newTaskDefaults?.tag_ids ?? [])
      setProjectId(newTaskDefaults?.project_id ?? null)
    }
    setShowRepeat(false)
    setAddingTag(false)
    setNewTagName('')
    setNewTagColor(TAG_COLORS[0])
    setNewTagIcon(TAG_ICONS[0])
  }, [editingTask, isAddTaskOpen])

  const handleSave = async () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      date: date || null,
      time: time || null,
      is_done: editingTask?.is_done ?? false,
      done_at: editingTask?.done_at ?? null,
      project_id: projectId,
      tag_ids: tagIds,
      repeat_type: repeatType,
      repeat_days: repeatDays.length > 0 ? repeatDays : null,
    }
    if (isEditing) await updateTask(editingTask!.id, payload)
    else await addTask(payload)
    closeAddTask()
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const tag = await addTag(newTagName.trim(), newTagColor, newTagIcon)
    if (tag) setTagIds((ids) => [...ids, tag.id])
    setNewTagName('')
    setAddingTag(false)
  }

  const toggleTag = (id: string) => {
    setTagIds((ids) => ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id])
  }

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const dateLabel = () => {
    if (!date) return null
    if (date === today) return t('tasks.today')
    if (date === tomorrow) return t('tasks.tomorrow')
    return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const repeatLabel = () => {
    switch (repeatType) {
      case 'daily': return t('tasks.repeat_daily')
      case 'weekly': return t('tasks.repeat_weekly')
      case 'monthly': return t('tasks.repeat_monthly')
      case 'custom': return t('tasks.repeat_custom')
      default: return null
    }
  }

  const selectedProject = projects.find((p) => p.id === projectId)
  const showDescription = settings?.show_description ?? true

  return (
    <>
      <Bottomsheet open={isAddTaskOpen} onClose={closeAddTask} fullHeight>
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom)' }}>

          {/* Title input */}
          <div className="px-5 pt-4 pb-3" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tasks.new_task')}
              className="w-full outline-none bg-transparent"
              style={{ fontSize: 20, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1.3 }}
            />
          </div>

          {/* Date / Time / Repeat rows */}
          <div style={{ borderBottom: '0.5px solid var(--color-border)' }}>
            {/* Date */}
            <div className="relative" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }}
              />
              <div className="flex items-center gap-3.5 px-5 py-3.5">
                <CalendarDays size={17} style={{ color: date ? 'var(--color-primary)' : 'var(--color-inactive)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text)' }}>{t('tasks.date_label')}</span>
                {date ? (
                  <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}>{dateLabel()}</span>
                    <button onClick={(e) => { e.stopPropagation(); setDate('') }} className="active:opacity-50">
                      <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>—</span>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="relative" style={{ borderBottom: '0.5px solid var(--color-border)' }}>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 1 }}
              />
              <div className="flex items-center gap-3.5 px-5 py-3.5">
                <Clock size={17} style={{ color: time ? 'var(--color-primary)' : 'var(--color-inactive)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text)' }}>{t('tasks.time_label')}</span>
                {time ? (
                  <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}>{time}</span>
                    <button onClick={(e) => { e.stopPropagation(); setTime('') }} className="active:opacity-50">
                      <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>—</span>
                )}
              </div>
            </div>

            {/* Repeat */}
            <button
              className="flex items-center gap-3.5 px-5 py-3.5 w-full text-left active:opacity-60"
              onClick={() => setShowRepeat(true)}
            >
              <Repeat2 size={17} style={{ color: repeatType !== 'none' ? 'var(--color-primary)' : 'var(--color-inactive)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text)' }}>{t('tasks.repeat')}</span>
              <span style={{ fontSize: 14, color: repeatType !== 'none' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: repeatType !== 'none' ? 500 : 400 }}>
                {repeatLabel() ?? t('tasks.repeat_never')}
              </span>
              <ChevronRight size={14} style={{ color: 'var(--color-inactive)', marginLeft: 2 }} />
            </button>
          </div>

          {/* Tags, Project, Description */}
          <div style={{ borderBottom: '0.5px solid var(--color-border)' }}>
            {/* Tags row */}
            <div style={{ borderBottom: '0.5px solid var(--color-border)', padding: '12px 20px' }}>
              <div className="flex items-start gap-3.5">
                <Tag size={17} style={{ color: tagIds.length > 0 ? 'var(--color-primary)' : 'var(--color-inactive)', flexShrink: 0, marginTop: 3 }} />
                <div style={{ flex: 1 }}>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {tags.filter((tg) => tagIds.includes(tg.id)).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full active:opacity-70"
                        style={{ fontSize: 13, backgroundColor: `${tag.color}22`, color: tag.color, fontWeight: 500 }}
                      >
                        <Check size={11} />
                        {tag.name}
                      </button>
                    ))}
                    {tags.filter((tg) => !tagIds.includes(tg.id)).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full active:opacity-70"
                        style={{ fontSize: 13, backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
                      >
                        {tag.name}
                      </button>
                    ))}
                    {!addingTag && (
                      <button
                        onClick={() => setAddingTag(true)}
                        className="px-2.5 py-1 rounded-full active:opacity-70"
                        style={{ fontSize: 13, color: 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}
                      >
                        {t('tasks.new_tag')}
                      </button>
                    )}
                  </div>

                  {addingTag && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          autoFocus
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                          placeholder="Название"
                          className="flex-1 outline-none bg-transparent"
                          style={{ fontSize: 14, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border-strong)', paddingBottom: 4 }}
                          maxLength={12}
                        />
                        <button onClick={handleCreateTag} style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500 }}>OK</button>
                        <button onClick={() => setAddingTag(false)}>
                          <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                      </div>
                      {/* Color picker */}
                      <div className="flex gap-2 mb-2">
                        {TAG_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setNewTagColor(c)}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: c,
                              border: newTagColor === c ? '2px solid var(--color-text)' : '2px solid transparent',
                              outline: newTagColor === c ? '1px solid white' : 'none',
                              outlineOffset: '-3px',
                            }}
                          />
                        ))}
                      </div>
                      {/* Icon picker */}
                      <div className="flex gap-2">
                        {TAG_ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => setNewTagIcon(icon)}
                            className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: newTagIcon === icon ? `${newTagColor}30` : 'var(--color-bg)',
                              border: newTagIcon === icon ? `1.5px solid ${newTagColor}` : '1px solid var(--color-border)',
                            }}
                          >
                            <TagIcon icon={icon} size={15} color={newTagIcon === icon ? newTagColor : 'var(--color-text-muted)'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project row */}
            <div style={{ borderBottom: showDescription ? '0.5px solid var(--color-border)' : 'none' }}>
              <button
                className="flex items-center gap-3.5 px-5 py-3.5 w-full text-left active:opacity-60"
                onClick={() => {
                  // Cycle through projects or clear
                  if (!projectId) {
                    if (projects.length > 0) setProjectId(projects[0].id)
                  } else {
                    const idx = projects.findIndex(p => p.id === projectId)
                    const next = projects[idx + 1]
                    setProjectId(next ? next.id : null)
                  }
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={projectId ? 'var(--color-primary)' : 'var(--color-inactive)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ flex: 1, fontSize: 15, color: 'var(--color-text)' }}>{t('tasks.project')}</span>
                {selectedProject ? (
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, color: selectedProject.color, fontWeight: 500 }}>{selectedProject.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setProjectId(null) }} className="active:opacity-50">
                      <X size={14} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>—</span>
                )}
              </button>
            </div>

            {/* Description row - only if show_description enabled */}
            {showDescription && (
              <div className="flex items-start gap-3.5 px-5 py-3.5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={description ? 'var(--color-primary)' : 'var(--color-inactive)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('tasks.add_description')}
                  rows={2}
                  className="flex-1 outline-none bg-transparent resize-none"
                  style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
                />
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              onClick={closeAddTask}
              className="py-1 active:opacity-50"
              style={{ fontSize: 15, color: 'var(--color-text-muted)' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-8 py-2.5 rounded-full active:opacity-70 disabled:opacity-30"
              style={{ fontSize: 15, backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 500 }}
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Bottomsheet>

      {/* Repeat picker */}
      <Bottomsheet open={showRepeat} onClose={() => setShowRepeat(false)}>
        <div className="px-5 pb-8">
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)', padding: '12px 0 16px' }}>
            {t('tasks.repeat')}
          </p>
          {(['none', 'daily', 'weekly', 'monthly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setRepeatType(type); if (type !== 'weekly') setShowRepeat(false) }}
              className="w-full flex items-center justify-between active:opacity-60"
              style={{ padding: '14px 0', borderBottom: '0.5px solid var(--color-border)' }}
            >
              <span style={{ fontSize: 15, color: 'var(--color-text)' }}>
                {type === 'none' ? t('tasks.repeat_never') : type === 'daily' ? t('tasks.repeat_daily') : type === 'weekly' ? t('tasks.repeat_weekly') : t('tasks.repeat_monthly')}
              </span>
              {repeatType === type && <Check size={17} style={{ color: 'var(--color-primary)' }} />}
            </button>
          ))}
          {repeatType === 'weekly' && (
            <div style={{ marginTop: 20 }}>
              <p className="section-label mb-3">Дни недели</p>
              <div className="flex gap-2">
                {WEEKDAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRepeatDays((p) => p.includes(idx) ? p.filter((d) => d !== idx) : [...p, idx])}
                    className="flex-1 py-2.5 rounded-[10px] active:opacity-70"
                    style={{
                      fontSize: 13,
                      fontWeight: repeatDays.includes(idx) ? 500 : 400,
                      backgroundColor: repeatDays.includes(idx) ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: repeatDays.includes(idx) ? 'white' : 'var(--color-text-secondary)',
                      border: `1px solid ${repeatDays.includes(idx) ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRepeat(false)}
                className="w-full py-3.5 rounded-full mt-5 active:opacity-70"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontSize: 15, fontWeight: 500 }}
              >
                {t('common.done')}
              </button>
            </div>
          )}
        </div>
      </Bottomsheet>
    </>
  )
}
