import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from './Checkbox'
import type { Task } from '../types'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import { useTagStore } from '../store/tagStore'
import { supabase } from '../lib/supabase'

interface TaskCardProps {
  task: Task
  checkboxColor?: 'peach' | 'gray'
}

function formatTaskDate(date: string | null, t: (k: string) => string) {
  if (!date) return null
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const isOverdue = date < today
  let text = ''
  if (date === today) text = t('tasks.today')
  else if (date === tomorrow) text = t('tasks.tomorrow')
  else text = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return { text, overdue: isOverdue }
}

export function TaskCard({ task, checkboxColor = 'peach' }: TaskCardProps) {
  const { t } = useTranslation()
  const { toggleDone, deleteTask } = useTaskStore()
  const { openAddTask } = useUIStore()
  const { tags } = useTagStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const taskTags = (task.tag_ids ?? []).map((id) => tags.find((tg) => tg.id === id)).filter(Boolean) as typeof tags

  const handlePressStart = () => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setMenuOpen(true)
    }, 500)
  }
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const handleToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) toggleDone(task.id, user.id)
  }

  const dateInfo = formatTaskDate(task.date, t)

  return (
    <>
      <div
        className="flex items-start gap-3 px-4 py-3.5"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
      >
        <div className="mt-0.5 flex-shrink-0">
          <Checkbox checked={task.is_done} onChange={handleToggle} color={checkboxColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize: 15,
              color: 'var(--color-text)',
              textDecoration: task.is_done ? 'line-through' : 'none',
              opacity: task.is_done ? 0.45 : 1,
              lineHeight: 1.4,
            }}
          >
            {task.title}
          </p>
          {/* Metadata: date indicator + tags */}
          {(task.time || task.date || taskTags.length > 0) && (
            <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
              {task.time && (
                <span style={{ fontSize: 12, color: dateInfo?.overdue ? 'var(--color-overdue)' : 'var(--color-text-muted)' }}>
                  {task.time}
                </span>
              )}
              {!task.time && dateInfo && (
                <span style={{ fontSize: 12, color: dateInfo.overdue ? 'var(--color-overdue)' : 'var(--color-text-muted)', fontWeight: dateInfo.overdue ? 500 : 400 }}>
                  {dateInfo.overdue ? `⚠ ${dateInfo.text}` : dateInfo.text}
                </span>
              )}
              {taskTags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: 11,
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    fontWeight: 500,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} />
          <div
            className="relative w-full rounded-t-[20px]"
            style={{
              backgroundColor: 'var(--color-surface)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              maxWidth: 430,
            }}
          >
            <div className="flex justify-center pt-3 pb-3">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border-strong)' }} />
            </div>
            <p className="px-5 pb-3" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{task.title}</p>
            <button
              className="w-full text-left px-5 py-4 active:opacity-60"
              style={{ fontSize: 15, color: 'var(--color-text)', borderTop: '0.5px solid var(--color-border)' }}
              onClick={() => { setMenuOpen(false); openAddTask(task) }}
            >
              {t('tasks.edit_task')}
            </button>
            <button
              className="w-full text-left px-5 py-4 active:opacity-60"
              style={{ fontSize: 15, color: 'var(--color-overdue)', borderTop: '0.5px solid var(--color-border)' }}
              onClick={() => { setMenuOpen(false); setConfirmDelete(true) }}
            >
              {t('tasks.delete_task')}
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface)', maxWidth: 360 }}>
            <p className="mb-2" style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <p className="mb-6" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>«{task.title}»</p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-full"
                style={{ fontSize: 15, color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-strong)' }}
                onClick={() => setConfirmDelete(false)}
              >
                {t('common.confirm_delete_no')}
              </button>
              <button
                className="flex-1 py-3 rounded-full text-white"
                style={{ fontSize: 15, backgroundColor: 'var(--color-overdue)', fontWeight: 500 }}
                onClick={() => { deleteTask(task.id); setConfirmDelete(false) }}
              >
                {t('common.confirm_delete_yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
