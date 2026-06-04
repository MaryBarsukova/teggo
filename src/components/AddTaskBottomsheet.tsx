import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bottomsheet } from './Bottomsheet'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { useTagStore } from '../store/tagStore'
import { useUIStore } from '../store/uiStore'
import type { Task } from '../types'
import { ChevronDown, X } from 'lucide-react'

const REPEAT_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function AddTaskBottomsheet() {
  const { t } = useTranslation()
  const { isAddTaskOpen, editingTask, newTaskDefaults, closeAddTask } = useUIStore()
  const { addTask, updateTask } = useTaskStore()
  const { projects } = useProjectStore()
  const { tags, addTag } = useTagStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [repeatType, setRepeatType] = useState<Task['repeat_type']>('none')
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [tagId, setTagId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [showRepeat, setShowRepeat] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [addingTag, setAddingTag] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description ?? '')
      setDate(editingTask.date ?? '')
      setTime(editingTask.time ?? '')
      setRepeatType(editingTask.repeat_type)
      setRepeatDays(editingTask.repeat_days ?? [])
      setTagId(editingTask.tag_id)
      setProjectId(editingTask.project_id)
    } else {
      setTitle('')
      setDescription('')
      setDate(newTaskDefaults?.date ?? '')
      setTime(newTaskDefaults?.time ?? '')
      setRepeatType('none')
      setRepeatDays([])
      setTagId(newTaskDefaults?.tag_id ?? null)
      setProjectId(newTaskDefaults?.project_id ?? null)
    }
    setShowRepeat(false)
    setAddingTag(false)
    setNewTagName('')
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
      tag_id: tagId,
      repeat_type: repeatType,
      repeat_days: repeatDays.length > 0 ? repeatDays : null,
    }
    if (editingTask) {
      await updateTask(editingTask.id, payload)
    } else {
      await addTask(payload)
    }
    closeAddTask()
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const tag = await addTag(newTagName.trim())
    if (tag) setTagId(tag.id)
    setNewTagName('')
    setAddingTag(false)
  }

  const toggleRepeatDay = (idx: number) => {
    setRepeatDays((prev) => prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx])
  }

  const repeatLabel = () => {
    switch (repeatType) {
      case 'daily': return t('tasks.repeat_daily')
      case 'weekly': return t('tasks.repeat_weekly')
      case 'monthly': return t('tasks.repeat_monthly')
      case 'custom': return t('tasks.repeat_custom')
      default: return t('tasks.repeat')
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const datePillLabel = () => {
    if (!date) return t('tasks.today').slice(0, 3)
    if (date === today) return t('tasks.today')
    if (date === tomorrow) return t('tasks.tomorrow')
    const d = new Date(date)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Bottomsheet open={isAddTaskOpen} onClose={closeAddTask}>
        <div className="px-4 pb-4">
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('tasks.new_task')}
            className="w-full text-[16px] outline-none bg-transparent py-2"
            style={{ color: 'var(--color-text)', fontWeight: 400 }}
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tasks.add_description')}
            rows={2}
            className="w-full text-[12px] outline-none bg-transparent resize-none py-1"
            style={{ color: 'var(--color-text-muted)' }}
          />

          {/* Pills row */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {/* Date pill */}
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px]"
                style={{
                  backgroundColor: date ? 'var(--color-primary-light)' : 'var(--color-bg)',
                  color: date ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                  border: '0.5px solid var(--color-border)',
                }}
              >
                {datePillLabel()}
              </span>
            </div>

            {/* Time pill */}
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <span
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px]"
                style={{
                  backgroundColor: time ? 'var(--color-primary-light)' : 'var(--color-bg)',
                  color: time ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                  border: '0.5px solid var(--color-border)',
                }}
              >
                {time || '—:——'}
              </span>
            </div>

            {/* Repeat pill */}
            <button
              onClick={() => setShowRepeat(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px]"
              style={{
                backgroundColor: repeatType !== 'none' ? 'var(--color-primary-light)' : 'var(--color-bg)',
                color: repeatType !== 'none' ? 'var(--color-primary-text)' : 'var(--color-text-muted)',
                border: '0.5px solid var(--color-border)',
              }}
            >
              {repeatLabel()} <ChevronDown size={12} />
            </button>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <p className="text-[11px] mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('tasks.tag')}</p>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagId(tagId === tag.id ? null : tag.id)}
                  className="px-3 py-1 rounded-full text-[12px]"
                  style={{
                    backgroundColor: tagId === tag.id ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: tagId === tag.id ? 'white' : 'var(--color-text)',
                    border: '0.5px solid var(--color-border)',
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {addingTag ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                    className="text-[12px] outline-none bg-transparent border-b w-24"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text)' }}
                    placeholder="Tag name"
                  />
                  <button onClick={handleCreateTag} className="text-[12px]" style={{ color: 'var(--color-primary)' }}>✓</button>
                  <button onClick={() => setAddingTag(false)}><X size={12} style={{ color: 'var(--color-text-muted)' }} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTag(true)}
                  className="px-3 py-1 rounded-full text-[12px]"
                  style={{ color: 'var(--color-primary)', border: '0.5px solid var(--color-border)' }}
                >
                  {t('tasks.new_tag')}
                </button>
              )}
            </div>
          </div>

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] mb-2" style={{ color: 'var(--color-text-muted)' }}>{t('tasks.project')}</p>
              <div className="flex gap-2 flex-wrap">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setProjectId(projectId === project.id ? null : project.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px]"
                    style={{
                      backgroundColor: projectId === project.id ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      color: projectId === project.id ? 'var(--color-primary-text)' : 'var(--color-text)',
                      border: '0.5px solid var(--color-border)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-6">
            <button onClick={closeAddTask} className="px-4 py-2 text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-full text-[14px] text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Bottomsheet>

      {/* Repeat sub-sheet */}
      <Bottomsheet open={showRepeat} onClose={() => setShowRepeat(false)}>
        <div className="px-4 pb-6">
          <p className="text-[16px] mb-4 py-2" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{t('tasks.repeat')}</p>
          {(['none', 'daily', 'weekly', 'monthly'] as const).map((type) => {
            const labels = { none: t('tasks.repeat_never'), daily: t('tasks.repeat_daily'), weekly: t('tasks.repeat_weekly'), monthly: t('tasks.repeat_monthly') }
            return (
              <button
                key={type}
                onClick={() => { setRepeatType(type); setShowRepeat(false) }}
                className="w-full text-left py-3.5 text-[15px]"
                style={{
                  color: repeatType === type ? 'var(--color-primary)' : 'var(--color-text)',
                  borderBottom: '0.5px solid var(--color-border)',
                  fontWeight: repeatType === type ? 500 : 400,
                }}
              >
                {labels[type]}
              </button>
            )
          })}
          <button
            onClick={() => { setRepeatType('custom'); setShowRepeat(false) }}
            className="w-full text-left py-3.5 text-[15px]"
            style={{ color: repeatType === 'custom' ? 'var(--color-primary)' : 'var(--color-text)', fontWeight: repeatType === 'custom' ? 500 : 400 }}
          >
            {t('tasks.repeat_custom')}
          </button>

          {repeatType === 'weekly' && (
            <div className="flex gap-2 mt-4 justify-center">
              {REPEAT_DAYS.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleRepeatDay(idx)}
                  className="w-9 h-9 rounded-full text-[12px] flex items-center justify-center"
                  style={{
                    backgroundColor: repeatDays.includes(idx) ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: repeatDays.includes(idx) ? 'white' : 'var(--color-text)',
                    border: '0.5px solid var(--color-border)',
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      </Bottomsheet>
    </>
  )
}
