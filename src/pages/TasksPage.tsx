import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ListTodo } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { useTaskStore } from '../store/taskStore'
import { useTagStore } from '../store/tagStore'
import type { Task } from '../types'

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
  const count = activeTab === 'progress' ? inProgress.length : done.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: 'var(--color-primary)' }}>
        <div style={{ paddingTop: 52, paddingLeft: 16, paddingRight: 16, paddingBottom: 0 }}>
          <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 2 }}>
            {t('tasks.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>
            {count} {activeTab === 'progress' ? t('tasks.in_progress').toLowerCase() : t('tasks.done').toLowerCase()}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', paddingLeft: 16, paddingRight: 16, gap: 24 }}>
          {(['progress', 'done'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 15,
                color: 'white',
                fontWeight: activeTab === tab ? 500 : 400,
                opacity: activeTab === tab ? 1 : 0.55,
                paddingBottom: 10,
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTab === tab ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              {tab === 'progress' ? t('tasks.active_tab') : t('tasks.done_tab')}
            </button>
          ))}
        </div>
      </div>

      {/* ── SEARCH + TAGS ── */}
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

        {/* Tag pills */}
        {tags.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 12,
            overflowX: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}>
            <button
              onClick={() => setActiveTagId(null)}
              style={{
                fontSize: 12,
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 5,
                paddingBottom: 5,
                borderRadius: 9999,
                flexShrink: 0,
                cursor: 'pointer',
                backgroundColor: activeTagId === null ? 'var(--color-primary)' : 'transparent',
                color: activeTagId === null ? 'white' : '#AAAAAA',
                border: activeTagId === null ? 'none' : '0.5px solid var(--color-border-strong)',
                fontWeight: activeTagId === null ? 500 : 400,
              }}
            >
              {t('tasks.all')}
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                style={{
                  fontSize: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 5,
                  paddingBottom: 5,
                  borderRadius: 9999,
                  flexShrink: 0,
                  cursor: 'pointer',
                  backgroundColor: activeTagId === tag.id ? `${tag.color}22` : 'transparent',
                  color: activeTagId === tag.id ? tag.color : '#AAAAAA',
                  border: `0.5px solid ${activeTagId === tag.id ? tag.color : 'var(--color-border-strong)'}`,
                  fontWeight: activeTagId === tag.id ? 500 : 400,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TASK LIST ── */}
      <div style={{ flex: 1, paddingBottom: 96, paddingTop: 16 }}>
        {activeTab === 'progress' ? (
          inProgress.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_progress')} />
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
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_done')} />
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
