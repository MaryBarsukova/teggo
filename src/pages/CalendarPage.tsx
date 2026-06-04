import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import type { Task } from '../types'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  return days
}

export function CalendarPage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks } = useTaskStore()
  const { selectedCalendarDate, setSelectedCalendarDate } = useUIStore()
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => { fetchTasks() }, [])

  const today = new Date().toISOString().split('T')[0]
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = getDaysInMonth(year, month)

  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const tasksByDate = tasks.reduce<Record<string, number>>((acc, task) => {
    if (task.date) acc[task.date] = (acc[task.date] ?? 0) + 1
    return acc
  }, {})

  const selectedTasks = tasks.filter((t: Task) => t.date === selectedCalendarDate)

  const selectedDateLabel = (() => {
    const d = new Date(selectedCalendarDate + 'T00:00:00')
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  })()

  const handleFABPress = () => {
    const store = useUIStore.getState()
    store.openAddTask(null, { date: selectedCalendarDate })
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1 className="text-[22px] text-white capitalize" style={{ fontWeight: 500 }}>{t('calendar.title')}</h1>
        <p className="text-[12px] capitalize" style={{ color: 'rgba(255,255,255,0.7)' }}>{monthName}</p>
      </div>

      {/* Calendar grid */}
      <div className="px-4 py-4" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] capitalize" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{monthName}</p>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1 rounded-full active:opacity-60">
              <ChevronLeft size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>
            <button onClick={nextMonth} className="p-1 rounded-full active:opacity-60">
              <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />
            const dateStr = day.toISOString().split('T')[0]
            const isToday = dateStr === today
            const isSelected = dateStr === selectedCalendarDate
            const hasTasks = !!tasksByDate[dateStr]
            const isCurrentMonth = day.getMonth() === month

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedCalendarDate(dateStr)}
                className="flex flex-col items-center py-1"
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[13px]"
                  style={{
                    backgroundColor: isToday ? 'var(--color-primary)' : isSelected ? 'var(--color-primary-light)' : 'transparent',
                    color: isToday ? 'white' : isSelected ? 'var(--color-primary-text)' : isCurrentMonth ? 'var(--color-text)' : 'var(--color-inactive)',
                    fontWeight: isToday || isSelected ? 500 : 400,
                  }}
                >
                  {day.getDate()}
                </div>
                {hasTasks && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: isToday ? 'white' : 'var(--color-primary)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      <div className="flex-1 pb-24">
        <div className="px-4 py-3">
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {selectedTasks.length === 0
              ? t('calendar.empty_day', { date: selectedDateLabel })
              : t('calendar.tasks_count', { date: selectedDateLabel, count: selectedTasks.length })}
          </p>
        </div>
        {selectedTasks.map((task: Task) => (
          <React.Fragment key={task.id}>
            <TaskCard task={task} />
            <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
          </React.Fragment>
        ))}
      </div>

      <FAB onPress={handleFABPress} />
    </div>
  )
}
