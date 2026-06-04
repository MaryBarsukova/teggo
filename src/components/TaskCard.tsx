import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Checkbox } from './Checkbox'
import type { Task } from '../types'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import { supabase } from '../lib/supabase'

interface TaskCardProps {
  task: Task
  checkboxColor?: 'peach' | 'gray'
}

function formatTaskDate(date: string | null, time: string | null, t: (k: string) => string): { text: string; overdue: boolean } | null {
  if (!date) return null
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const isOverdue = date < today

  let text = ''
  if (date === today) text = t('tasks.today')
  else if (date === tomorrow) text = t('tasks.tomorrow')
  else {
    const d = new Date(date)
    text = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  if (time) text += ` ${time}`

  return { text, overdue: isOverdue }
}

export function TaskCard({ task, checkboxColor = 'peach' }: TaskCardProps) {
  const { t } = useTranslation()
  const { toggleDone, deleteTask } = useTaskStore()
  const { openAddTask } = useUIStore()
  const settings = useSettingsStore((s) => s.settings)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setMenuOpen(true), 500)
  }
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const handleToggle = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) toggleDone(task.id, user.id)
  }

  const dateInfo = formatTaskDate(task.date, task.time, t)

  return (
    <>
      <div
        className="flex items-start gap-3 px-4 py-3 active:opacity-80"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
      >
        <div className="pt-0.5">
          <Checkbox checked={task.is_done} onChange={handleToggle} color={checkboxColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[14px] leading-snug"
            style={{
              color: 'var(--color-text)',
              textDecoration: task.is_done ? 'line-through' : 'none',
              opacity: task.is_done ? 0.5 : 1,
              fontWeight: 400,
            }}
          >
            {task.title}
          </p>
          {settings?.show_description && task.description && (
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)', opacity: task.is_done ? 0.5 : 1 }}>
              {task.description}
            </p>
          )}
          {dateInfo && (
            <p
              className="text-[11px] mt-0.5"
              style={{ color: dateInfo.overdue ? 'var(--color-overdue)' : 'var(--color-text-muted)' }}
            >
              {dateInfo.overdue ? `${dateInfo.text} · ${t('tasks.overdue')}` : dateInfo.text}
            </p>
          )}
        </div>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <div className="relative w-full rounded-t-[20px] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>
            <p className="px-4 py-2 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{task.title}</p>
            <button
              className="w-full text-left px-4 py-3 text-[16px]"
              style={{ color: 'var(--color-text)' }}
              onClick={() => { setMenuOpen(false); openAddTask(task) }}
            >
              {t('tasks.edit_task')}
            </button>
            <button
              className="w-full text-left px-4 py-3 text-[16px]"
              style={{ color: 'var(--color-overdue)' }}
              onClick={() => { setMenuOpen(false); setConfirmDelete(true) }}
            >
              {t('tasks.delete_task')}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-[16px] mb-5" style={{ color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-full text-[14px]" style={{ color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)' }} onClick={() => setConfirmDelete(false)}>
                {t('common.confirm_delete_no')}
              </button>
              <button className="flex-1 py-3 rounded-full text-[14px] text-white" style={{ backgroundColor: 'var(--color-overdue)' }} onClick={() => { deleteTask(task.id); setConfirmDelete(false) }}>
                {t('common.confirm_delete_yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
