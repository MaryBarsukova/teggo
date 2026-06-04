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
    const matchesTag = activeTagId === null || task.tag_id === activeTagId
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
      <div className="px-4 pt-12 pb-0" style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1 className="text-[22px] text-white mb-0.5" style={{ fontWeight: 500 }}>{t('tasks.title')}</h1>
        <p className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {count} {activeTab === 'progress' ? t('tasks.in_progress').toLowerCase() : t('tasks.done').toLowerCase()}
        </p>
        <div className="flex gap-6">
          {(['progress', 'done'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 text-[14px] text-white transition-all"
              style={{
                borderBottom: activeTab === tab ? '2px solid white' : '2px solid transparent',
                fontWeight: activeTab === tab ? 500 : 400,
                opacity: activeTab === tab ? 1 : 0.7,
              }}
            >
              {tab === 'progress' ? t('tasks.in_progress') : t('tasks.done')}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tasks.search')}
            className="flex-1 text-[14px] outline-none bg-transparent"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Tag filter */}
      <div
        className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide"
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '0.5px solid var(--color-border)' }}
      >
        <button
          onClick={() => setActiveTagId(null)}
          className="px-3 py-1 rounded-full text-[12px] flex-shrink-0"
          style={{
            backgroundColor: activeTagId === null ? 'var(--color-primary)' : 'var(--color-bg)',
            color: activeTagId === null ? 'white' : 'var(--color-text)',
            border: '0.5px solid var(--color-border)',
          }}
        >
          {t('tasks.all')}
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
            className="px-3 py-1 rounded-full text-[12px] flex-shrink-0"
            style={{
              backgroundColor: activeTagId === tag.id ? 'var(--color-primary)' : 'var(--color-bg)',
              color: activeTagId === tag.id ? 'white' : 'var(--color-text)',
              border: '0.5px solid var(--color-border)',
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 pb-24">
        {activeTab === 'progress' ? (
          inProgress.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_progress')} />
          ) : (
            inProgress.map((task) => (
              <React.Fragment key={task.id}>
                <TaskCard task={task} />
                <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
              </React.Fragment>
            ))
          )
        ) : (
          done.length === 0 ? (
            <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_done')} />
          ) : (
            doneGroups.map(({ label, tasks: groupTasks }) => (
              <div key={label}>
                <div className="flex items-center gap-2 px-4 py-2">
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <div className="px-2 py-0.5 rounded-full text-[11px] text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
                    {groupTasks.length}
                  </div>
                </div>
                {groupTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TaskCard task={task} />
                    <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />
                  </React.Fragment>
                ))}
              </div>
            ))
          )
        )}
      </div>

      {activeTab === 'progress' && <FAB />}
    </div>
  )
}
