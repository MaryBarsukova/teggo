import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckSquare, Target, Flame, Zap } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { FocusPickerBottomsheet } from '../components/FocusPickerBottomsheet'
import { Toggle } from '../components/Toggle'
import { useTaskStore } from '../store/taskStore'
import { useStreakStore } from '../store/streakStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import type { Task } from '../types'

function formatHeaderDate(): string {
  const d = new Date()
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })
  const date = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  return `${weekday}, ${date}`
}

function StreakSquares({ heatmapData }: { heatmapData: Record<string, number> }) {
  const days: { key: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, count: heatmapData[key] ?? 0 })
  }
  const opacity = (count: number) => {
    if (count === 0) return 0.15
    if (count === 1) return 0.35
    if (count <= 3) return 0.55
    if (count <= 5) return 0.75
    return 0.95
  }
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {days.map(({ key, count }) => (
        <div key={key} style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: `rgba(255,255,255,${opacity(count)})`, flexShrink: 0 }} />
      ))}
    </div>
  )
}

function TaskGroup({ tasks, checkboxColor }: { tasks: Task[]; checkboxColor?: 'peach' | 'gray' }) {
  if (tasks.length === 0) return null
  return (
    <div style={{ backgroundColor: 'var(--color-surface)' }}>
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
  const { settings, updateSettings } = useSettingsStore()

  useEffect(() => {
    fetchTasks()
    fetchStreak()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((task) => !task.is_done && task.date === today)
  const headerDate = formatHeaderDate()

  const showFocus = settings?.focus_mode ?? true
  const showStreak = settings?.show_streak ?? true

  const focusTasks = todayTasks.filter((t) => focusTaskIds.includes(t.id))
  const otherTasks = showFocus ? todayTasks.filter((t) => !focusTaskIds.includes(t.id)) : todayTasks

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        paddingTop: 52,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        overflow: 'hidden',
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'capitalize', marginBottom: 4 }}>
          {headerDate}
        </p>
        <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 10 }}>
          {t('today.title')}
        </h1>
        {showStreak && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Flame size={13} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              {t('today.streak_days', { count: streak?.current_streak ?? 0 })} {t('today.streak_label')}
            </span>
            <StreakSquares heatmapData={streak?.heatmap_data ?? {}} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} style={{ color: 'rgba(255,255,255,0.85)' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Фокус дня
            </span>
          </div>
          <Toggle variant="header" on={showFocus} onChange={(v) => updateSettings({ focus_mode: v })} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 16, paddingBottom: 96 }}>
        {showFocus && (
          <>
            {focusTasks.length === 0 ? (
              <button
                onClick={openFocusPicker}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  width: 'calc(100% - 32px)',
                  margin: '0 16px 16px',
                  border: '1.5px dashed #F0956E',
                  borderRadius: 16,
                  padding: 24,
                  backgroundColor: '#FDEEE6',
                  cursor: 'pointer',
                  background: '#FDEEE6',
                }}
              >
                <Target size={22} style={{ color: '#F0956E', opacity: 0.7 }} />
                <p style={{ fontSize: 14, color: '#6B5B52', textAlign: 'center', lineHeight: 1.4 }}>
                  {t('today.focus_empty')}
                </p>
                <span style={{ fontSize: 14, color: '#F0956E', fontWeight: 500 }}>
                  + {t('today.pick_focus')}
                </span>
              </button>
            ) : (
              <TaskGroup tasks={focusTasks} checkboxColor="peach" />
            )}
          </>
        )}

        {(showFocus ? otherTasks : todayTasks).length > 0 && (
          <>
            <span style={{
              display: 'block',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#AAAAAA',
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 16,
              paddingBottom: 8,
            }}>
              {t('today.tasks_label')}
            </span>
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
