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
      if (date === today) label = 'Today'
      else if (date === yesterday) label = 'Yesterday'
      else {
        const d = new Date(date)
        label = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
      }
      return { label, tasks }
    })
}

function TaskGroup({ tasks }: { tasks: Task[] }) {
  return (
    <div
      className="mx-4 rounded-[16px] overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 1px 4px rgba(28,16,7,0.07)',
      }}
    >
      {tasks.map((task, i) => (
        <React.Fragment key={task.id}>
          {i > 0 && (
            <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
          )}
          <TaskCard task={task} />
        </React.Fragment>
      ))}
    </div>
  )
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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="px-5 pt-12 pb-0">
          <h1 style={{ fontSize: 32, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 2 }}>
            {t('tasks.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>
            {count} {activeTab === 'progress' ? t('tasks.in_progress').toLowerCase() : t('tasks.done').toLowerCase()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-6">
          <button
            onClick={() => setActiveTab('progress')}
            className="pb-3"
            style={{
              fontSize: 15,
              color: 'white',
              fontWeight: activeTab === 'progress' ? 500 : 400,
              opacity: activeTab === 'progress' ? 1 : 0.6,
              borderBottom: activeTab === 'progress' ? '2px solid white' : '2px solid transparent',
            }}
          >
            {t('tasks.active_tab')}
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className="pb-3"
            style={{
              fontSize: 15,
              color: 'white',
              fontWeight: activeTab === 'done' ? 500 : 400,
              opacity: activeTab === 'done' ? 1 : 0.6,
              borderBottom: activeTab === 'done' ? '2px solid white' : '2px solid transparent',
            }}
          >
            {t('tasks.done_tab')}
          </button>
        </div>
      </div>

      {/* Search + tag filter */}
      <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Search size={15} style={{ color: 'var(--color-inactive)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tasks.search')}
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: 15, color: 'var(--color-text)' }}
          />
        </div>
        {tags.length > 0 && (
          <>
            <p className="section-label px-4 pb-1.5">{t('tasks.filter_by_tag')}</p>
            <div
              className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide"
            >
              <button
                onClick={() => setActiveTagId(null)}
                className="px-3 py-1.5 rounded-full flex-shrink-0"
                style={{
                  fontSize: 13,
                  backgroundColor: activeTagId === null ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: activeTagId === null ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${activeTagId === null ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                  fontWeight: activeTagId === null ? 500 : 400,
                }}
              >
                {t('tasks.all')}
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
                  className="px-3 py-1.5 rounded-full flex-shrink-0"
                  style={{
                    fontSize: 13,
                    backgroundColor: activeTagId === tag.id ? `${tag.color}22` : 'var(--color-bg)',
                    color: activeTagId === tag.id ? tag.color : 'var(--color-text-secondary)',
                    border: `1px solid ${activeTagId === tag.id ? tag.color : 'var(--color-border-strong)'}`,
                    fontWeight: activeTagId === tag.id ? 500 : 400,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 pb-24 pt-4">
        {activeTab === 'progress' ? (
          inProgress.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_progress')} />
          ) : (
            <TaskGroup tasks={inProgress} />
          )
        ) : (
          done.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_done')} />
          ) : (
            <div className="flex flex-col gap-5">
              {doneGroups.map(({ label, tasks: groupTasks }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 px-5 pb-2">
                    <p className="section-label">{label}</p>
                    <span
                      className="px-2 py-0.5 rounded-full text-white"
                      style={{ fontSize: 11, backgroundColor: 'var(--color-primary)' }}
                    >
                      {groupTasks.length}
                    </span>
                  </div>
                  <TaskGroup tasks={groupTasks} />
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
