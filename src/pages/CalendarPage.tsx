import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import { useUIStore } from '../store/uiStore'
import type { Task } from '../types'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

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
  const { tags, fetchTags } = useTagStore()
  const { selectedCalendarDate, setSelectedCalendarDate } = useUIStore()
  const [viewDate, setViewDate] = useState(new Date())

  useEffect(() => { fetchTasks(); fetchTags() }, [])

  const today = new Date().toISOString().split('T')[0]
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = getDaysInMonth(year, month)

  const rawMonth = viewDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const monthName = (rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1)).replace(/\s*г\.?$/i, '').trim()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const tasksByDate = tasks.reduce<Record<string, { color: string }[]>>((acc, task) => {
    if (task.date) {
      if (!acc[task.date]) acc[task.date] = []
      const firstTagId = task.tag_ids?.[0]
      const tag = firstTagId ? tags.find((tg) => tg.id === firstTagId) : null
      acc[task.date].push({ color: tag?.color ?? '#E8775A' })
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)', paddingTop: 52, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{monthName}</p>
        <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1 }}>{t('calendar.title')}</h1>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)', textTransform: 'capitalize' }}>{monthName}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={prevMonth} style={{ padding: 4, borderRadius: 9999, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>
            <button onClick={nextMonth} style={{ padding: 4, borderRadius: 9999, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#AAAAAA' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 4 }}>
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />
            const dateStr = day.toISOString().split('T')[0]
            const isToday = dateStr === today
            const isSelected = dateStr === selectedCalendarDate
            const dayDots = (tasksByDate[dateStr] ?? []).slice(0, 3)
            const isCurrentMonth = day.getMonth() === month

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedCalendarDate(dateStr)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, paddingBottom: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 9999,
                    fontSize: 13,
                    backgroundColor: isToday ? 'var(--color-primary)' : isSelected ? 'var(--color-primary-light)' : 'transparent',
                    color: isToday ? 'white' : isSelected ? 'var(--color-primary-text)' : isCurrentMonth ? 'var(--color-text)' : 'var(--color-inactive)',
                    fontWeight: isToday || isSelected ? 500 : 400,
                  }}
                >
                  {day.getDate()}
                </div>
                {dayDots.length > 0 && (
                  <div style={{ display: 'flex', marginTop: 2 }}>
                    {dayDots.map((dot, i) => (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          margin: '0 1px',
                          backgroundColor: (isToday || isSelected) ? '#fff' : dot.color,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      <div style={{ flex: 1, paddingBottom: 96, paddingTop: 16 }}>
        {selectedTasks.length === 0 ? (
          <p style={{ fontSize: 14, color: '#AAAAAA', textAlign: 'center', padding: '24px 16px' }}>
            {t('calendar.empty_day', { date: selectedDateLabel })}
          </p>
        ) : (
          <>
            <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#AAAAAA', padding: '0 20px 8px' }}>
              {t('calendar.tasks_count', { date: selectedDateLabel, count: selectedTasks.length })}
            </p>
            <div style={{ backgroundColor: 'var(--color-surface)' }}>
              {selectedTasks.map((task: Task, i: number) => (
                <React.Fragment key={task.id}>
                  {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
                  <TaskCard task={task} />
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      <FAB onPress={handleFABPress} />
    </div>
  )
}
