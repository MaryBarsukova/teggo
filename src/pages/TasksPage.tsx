import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ListTodo } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import { TagIcon } from '../components/AddTaskBottomsheet'
import type { Task } from '../types'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function groupByDoneAt(tasks: Task[]): { label: string; tasks: Task[] }[] {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const groups: Record<string, Task[]> = {}
  tasks.forEach((task) => {
    const key = task.done_at?.split('T')[0] ?? 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(task)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, tasks]) => {
      let label = date
      if (date === today) label = 'Сегодня'
      else if (date === yesterday) label = 'Вчера'
      else {
        const d = new Date(date)
        label = d.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' })
      }
      return { label, tasks }
    })
}

export function TasksPage() {
  const { t } = useTranslation()
  const { tasks, fetchTasks, searchQuery, setSearchQuery, activeTagId, setActiveTagId } = useTaskStore()
  const { tags, fetchTags } = useTagStore()
  const [activeTab, setActiveTab] = useState<'progress' | 'done'>('progress')

  useEffect(() => {
    fetchTasks()
    fetchTags()
  }, [])

  const filtered = tasks.filter((task) => {
    const matchesSearch = searchQuery === '' || task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = activeTagId === null || (task.tag_ids ?? []).includes(activeTagId)
    return matchesSearch && matchesTag
  })

  const inProgress = filtered.filter((t) => !t.is_done).sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date.localeCompare(b.date)
  })

  const done = filtered.filter((t) => t.is_done).sort((a, b) => {
    if (!a.done_at || !b.done_at) return 0
    return b.done_at.localeCompare(a.done_at)
  })

  const doneGroups = groupByDoneAt(done)

  const totalInProgress = tasks.filter((t) => !t.is_done).length
  const totalDone = tasks.filter((t) => t.is_done).length
  const headerSubtitle = totalInProgress > 0 || totalDone > 0
    ? `${totalInProgress} ${t('tasks.in_progress').toLowerCase()} · ${totalDone} ${t('tasks.done').toLowerCase()}`
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: 'var(--color-primary)' }}>
        <div style={{ paddingTop: 52, paddingLeft: 16, paddingRight: 16, paddingBottom: 16 }}>
          <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 2 }}>
            {t('tasks.title')}
          </h1>
          {headerSubtitle && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
              {headerSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── SEARCH + TAGS + TABS ── */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        {/* Search */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'var(--color-bg)',
            borderRadius: 10,
            padding: '8px 12px',
          }}>
            <Search size={14} style={{ color: '#AAAAAA', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tasks.search')}
              style={{
                flex: 1,
                outline: 'none',
                background: 'transparent',
                fontSize: 15,
                color: 'var(--color-text)',
                border: 'none',
              }}
            />
          </div>
        </div>

        {/* Tag filter chips */}
        {tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 6,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 4,
            paddingBottom: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}>
            <button
              onClick={() => setActiveTagId(null)}
              style={{
                fontSize: 11,
                fontWeight: 500,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 5,
                paddingBottom: 5,
                borderRadius: 9999,
                flexShrink: 0,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: activeTagId === null ? '#E8775A' : '#FEF0EB',
                color: activeTagId === null ? '#fff' : '#E8775A',
                border: 'none',
              }}
            >
              {t('tasks.all')}
            </button>
            {tags.map((tag) => {
              const isActive = activeTagId === tag.id
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingTop: 5,
                    paddingBottom: 5,
                    borderRadius: 9999,
                    flexShrink: 0,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: isActive ? hexToRgba(tag.color, 0.22) : hexToRgba(tag.color, 0.12),
                    color: tag.color,
                    border: `0.5px solid ${hexToRgba(tag.color, isActive ? 0.5 : 0.3)}`,
                  }}
                >
                  {tag.icon && <TagIcon icon={tag.icon} size={10} color={tag.color} />}
                  {tag.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Tabs — chip style */}
        <div style={{ display: 'flex', gap: 4, padding: '8px 16px 12px' }}>
          {(['progress', 'done'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '5px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#E8775A' : '#F0E6DF',
                color: activeTab === tab ? '#fff' : '#B5897A',
              }}
            >
              {tab === 'progress' ? t('tasks.active_tab') : t('tasks.done_tab')}
            </button>
          ))}
        </div>
      </div>

      {/* ── TASK LIST ── */}
      <div style={{ flex: 1, paddingBottom: 96, paddingTop: 16 }}>
        {activeTab === 'progress' ? (
          inProgress.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} color="#E8775A" />} text={t('tasks.empty_progress')} />
          ) : (
            <div style={{ backgroundColor: 'var(--color-surface)' }}>
              {inProgress.map((task, i) => (
                <React.Fragment key={task.id}>
                  {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
                  <TaskCard task={task} />
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          done.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} color="#E8775A" />} text={t('tasks.empty_done')} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {doneGroups.map(({ label, tasks: groupTasks }) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingBottom: 8,
                  }}>
                    <p style={{
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#AAAAAA',
                    }}>
                      {label}
                    </p>
                    <span style={{
                      fontSize: 11,
                      color: 'white',
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: 9999,
                      paddingLeft: 8,
                      paddingRight: 8,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}>
                      {groupTasks.length}
                    </span>
                  </div>
                  <div style={{ backgroundColor: 'var(--color-surface)' }}>
                    {groupTasks.map((task, i) => (
                      <React.Fragment key={task.id}>
                        {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
                        <TaskCard task={task} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {activeTab === 'progress' && <FAB />}
    </div>
  )
}
