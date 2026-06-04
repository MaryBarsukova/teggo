import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Flame } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { Toggle } from '../components/Toggle'
import { EmptyState } from '../components/EmptyState'
import { FocusPickerBottomsheet } from '../components/FocusPickerBottomsheet'
import { useTaskStore } from '../store/taskStore'
import { useStreakStore } from '../store/streakStore'
import { useUIStore } from '../store/uiStore'
import { CheckSquare } from 'lucide-react'
import { track } from '../lib/analytics'

function formatHeaderDate(): { weekday: string; date: string } {
  const d = new Date()
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' })
  const date = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  return { weekday, date }
}

function HeatmapBar({ heatmapData }: { heatmapData: Record<string, number> }) {
  const days: { date: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days.push({ date: key, count: heatmapData[key] ?? 0 })
  }

  const opacity = (count: number) => {
    if (count === 0) return 0.10
    if (count === 1) return 0.35
    if (count <= 3) return 0.55
    if (count <= 5) return 0.75
    return 0.95
  }

  return (
    <div className="flex gap-1 justify-end">
      {days.map(({ date, count }) => (
        <div
          key={date}
          className="rounded-[3px]"
          style={{
            width: 14,
            height: 14,
            backgroundColor: `rgba(255,255,255,${opacity(count)})`,
          }}
        />
      ))}
    </div>
  )
}

export function TodayPage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks } = useTaskStore()
  const { streak, fetchStreak } = useStreakStore()
  const { isFocusMode, focusTaskIds, setFocusMode, openFocusPicker, openAddTask } = useUIStore()

  useEffect(() => {
    fetchTasks()
    fetchStreak()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((task) => !task.is_done && task.date === today)
  const { weekday, date } = formatHeaderDate()

  const handleFocusToggle = (on: boolean) => {
    if (on) {
      track('focus_mode_enabled')
      setFocusMode(true)
      openFocusPicker()
    } else {
      setFocusMode(false)
    }
  }

  const focusTasks = todayTasks.filter((t) => focusTaskIds.includes(t.id))
  const otherTasks = todayTasks.filter((t) => !focusTaskIds.includes(t.id))

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[12px] capitalize" style={{ color: 'rgba(255,255,255,0.7)' }}>{weekday}, {date}</p>
            <h1 className="text-[28px]" style={{ color: 'white', fontWeight: 500 }}>{t('today.title')}</h1>
          </div>
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Flame size={14} color="white" />
            <span className="text-[13px] text-white">{streak?.current_streak ?? 0}</span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{t('today.streak_label')}</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="mt-3 mb-3">
          <HeatmapBar heatmapData={streak?.heatmap_data ?? {}} />
        </div>

        {/* Focus toggle row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-white">{t('today.focus_mode')}</span>
          </div>
          <Toggle on={isFocusMode} onChange={handleFocusToggle} variant="header" />
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 pb-24">
        {!isFocusMode ? (
          todayTasks.length === 0 ? (
            <EmptyState icon={<CheckSquare size={40} />} text={t('tasks.empty_progress')} />
          ) : (
            <div>
              {todayTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <TaskCard task={task} />
                  <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          <div>
            {focusTasks.length > 0 && (
              <>
                <div className="px-4 py-2">
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('today.in_focus')}</p>
                </div>
                {focusTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TaskCard task={task} checkboxColor="peach" />
                    <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
                  </React.Fragment>
                ))}
                {otherTasks.length > 0 && (
                  <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', margin: '8px 0' }} />
                )}
              </>
            )}
            {otherTasks.length > 0 && (
              <>
                <div className="px-4 py-2">
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{t('today.other')}</p>
                </div>
                {otherTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TaskCard task={task} checkboxColor="gray" />
                    <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
                  </React.Fragment>
                ))}
              </>
            )}
            {focusTasks.length === 0 && otherTasks.length === 0 && (
              <EmptyState icon={<CheckSquare size={40} />} text={t('tasks.empty_progress')} />
            )}
          </div>
        )}
      </div>

      <FAB onPress={() => openAddTask(null, { date: today })} />
      <FocusPickerBottomsheet />
    </div>
  )
}
