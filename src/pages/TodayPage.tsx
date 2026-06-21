import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckSquare, Target } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { FocusPickerBottomsheet } from '../components/FocusPickerBottomsheet'
import { useTaskStore } from '../store/taskStore'
import { useStreakStore } from '../store/streakStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import type { Task } from '../types'

function formatHeaderDate(): { weekday: string; date: string } {
  const d = new Date()
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
    date: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }),
  }
}

function StreakSquares({ heatmapData }: { heatmapData: Record<string, number> }) {
  const days: { key: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, count: heatmapData[key] ?? 0 })
  }
  const opacity = (count: number) => {
    if (count === 0) return 0.15
    if (count === 1) return 0.40
    if (count <= 3) return 0.65
    return 0.90
  }
  return (
    <div className="flex gap-1">
      {days.map(({ key, count }) => (
        <div key={key} className="rounded-[3px]" style={{ width: 13, height: 13, backgroundColor: `rgba(255,255,255,${opacity(count)})` }} />
      ))}
    </div>
  )
}

function TaskGroup({ tasks, checkboxColor }: { tasks: Task[]; checkboxColor?: 'peach' | 'gray' }) {
  if (tasks.length === 0) return null
  return (
    <div className="mx-4 rounded-[16px] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 4px rgba(28,16,7,0.07)' }}>
      {tasks.map((task, i) => (
        <React.Fragment key={task.id}>
          {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
          <TaskCard task={task} checkboxColor={checkboxColor} />
        </React.Fragment>
      ))}
    </div>
  )
}

export function TodayPage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks } = useTaskStore()
  const { streak, fetchStreak } = useStreakStore()
  const { focusTaskIds, openFocusPicker, openAddTask } = useUIStore()
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    fetchTasks()
    fetchStreak()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((task) => !task.is_done && task.date === today)
  const { weekday, date } = formatHeaderDate()

  const showFocus = settings?.focus_mode ?? true
  const showStreak = settings?.show_streak ?? true

  const focusTasks = todayTasks.filter((t) => focusTaskIds.includes(t.id))
  const otherTasks = showFocus ? todayTasks.filter((t) => !focusTaskIds.includes(t.id)) : todayTasks

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ backgroundColor: 'var(--color-primary)' }}>
        <p className="capitalize mb-0.5" style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.2 }}>
          {weekday}, {date}
        </p>
        <h1 style={{ fontSize: 32, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: showStreak ? 10 : 0 }}>
          {t('today.title')}
        </h1>
        {showStreak && (
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              {t('today.streak_days', { count: streak?.current_streak ?? 0 })} {t('today.streak_label')}
            </span>
            <StreakSquares heatmapData={streak?.heatmap_data ?? {}} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-24 pt-4">
        {showFocus && (
          <>
            <p className="section-label px-5 pb-2">{t('today.focus_day')}</p>
            {focusTasks.length === 0 ? (
              <div className="mx-4 mb-4">
                <button
                  onClick={openFocusPicker}
                  className="w-full rounded-[16px] py-6 flex flex-col items-center gap-2 active:opacity-70"
                  style={{ border: '1.5px dashed var(--color-primary)', backgroundColor: 'var(--color-primary-light)' }}
                >
                  <Target size={24} style={{ color: 'var(--color-primary)', opacity: 0.7 }} />
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
                    {t('today.focus_empty')}
                  </p>
                  <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}>
                    + {t('today.pick_focus')}
                  </span>
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <TaskGroup tasks={focusTasks} checkboxColor="peach" />
              </div>
            )}
          </>
        )}

        {(showFocus ? otherTasks : todayTasks).length > 0 && (
          <>
            <p className="section-label px-5 pb-2">{t('today.tasks_label')}</p>
            <TaskGroup tasks={showFocus ? otherTasks : todayTasks} />
          </>
        )}

        {todayTasks.length === 0 && (
          <EmptyState icon={<CheckSquare size={40} />} text={t('tasks.empty_progress')} />
        )}
      </div>

      <FAB onPress={() => openAddTask(null, { date: today })} />
      <FocusPickerBottomsheet />
    </div>
  )
}
