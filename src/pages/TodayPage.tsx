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
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'long' })
  const day = d.getDate()
  const month = d.toLocaleDateString('ru-RU', { month: 'long' })
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month}`
}

function StreakSquares({ heatmapData }: { heatmapData: Record<string, number> }) {
  const days: { key: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ key, count: heatmapData[key] ?? 0 })
  }
  // Guarantee exactly 7 entries regardless of any external data
  const displayDays = days.slice(-7)
  const getOpacity = (count: number) => {
    if (count === 0) return 0.2
    if (count === 1) return 0.4
    if (count <= 3) return 0.6
    if (count <= 5) return 0.8
    return 1.0
  }
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
      {displayDays.map(({ key, count }) => (
        <div
          key={key}
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: `rgba(255,255,255,${getOpacity(count)})`,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  )
}

function TaskList({ tasks, checkboxColor }: { tasks: Task[]; checkboxColor?: 'peach' | 'gray' }) {
  if (tasks.length === 0) return null
  return (
    <div style={{ backgroundColor: 'var(--color-surface)' }}>
      {tasks.map((task, i) => (
        <React.Fragment key={task.id}>
          {i > 0 && (
            <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
          )}
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

  const showFocus = settings?.focus_mode ?? true
  const showStreak = settings?.show_streak ?? true

  const focusTasks = todayTasks.filter((t) => focusTaskIds.includes(t.id))
  const otherTasks = todayTasks.filter((t) => !focusTaskIds.includes(t.id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── HEADER ── */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        paddingTop: 52,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        overflow: 'hidden',
      }}>
        {/* Date */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4, letterSpacing: '0.01em' }}>
          {formatHeaderDate()}
        </p>

        {/* Title */}
        <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 10 }}>
          {t('today.title')}
        </h1>

        {/* Streak row */}
        {showStreak && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Flame size={13} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, flexShrink: 0 }}>
              {streak?.current_streak ?? 0} {t('today.streak_label')}
            </span>
            <StreakSquares heatmapData={streak?.heatmap_data ?? {}} />
          </div>
        )}

        {/* Focus toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
            }}>
              {t('today.focus_mode')}
            </span>
          </div>
          <Toggle
            variant="header"
            on={showFocus}
            onChange={(v) => updateSettings({ focus_mode: v })}
          />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, paddingBottom: 96 }}>

        {/* Focus block */}
        {showFocus && (
          <div style={{ paddingTop: 16 }}>
            {focusTasks.length === 0 ? (
              /* Empty focus picker */
              <div style={{ margin: '0 16px 16px' }}>
                <button
                  onClick={openFocusPicker}
                  style={{
                    width: '100%',
                    border: '1.5px dashed var(--color-primary)',
                    borderRadius: 16,
                    backgroundColor: 'var(--color-primary-light)',
                    padding: '20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Target size={22} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
                    {t('today.focus_empty')}
                  </p>
                  <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 500 }}>
                    + {t('today.pick_focus')}
                  </span>
                </button>
              </div>
            ) : (
              /* Focus tasks */
              <div style={{ marginBottom: 4 }}>
                <p style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  padding: '0 16px 8px',
                }}>
                  {t('today.in_focus')}
                </p>
                <TaskList tasks={focusTasks} checkboxColor="peach" />
              </div>
            )}
          </div>
        )}

        {/* Other tasks */}
        {(showFocus ? otherTasks : todayTasks).length > 0 && (
          <div style={{ marginTop: showFocus && focusTasks.length > 0 ? 16 : 0 }}>
            {showFocus && focusTasks.length > 0 && (
              <p style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                padding: '0 16px 8px',
              }}>
                {t('today.other')}
              </p>
            )}
            <TaskList tasks={showFocus ? otherTasks : todayTasks} checkboxColor="gray" />
          </div>
        )}

        {/* Empty state */}
        {todayTasks.length === 0 && (
          <EmptyState icon={<CheckSquare size={40} color="#E8775A" />} text={t('tasks.empty_progress')} />
        )}
      </div>

      <FAB onPress={() => openAddTask(null, { date: today })} />
      <FocusPickerBottomsheet />
    </div>
  )
}
