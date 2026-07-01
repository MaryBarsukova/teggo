import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { FAB } from '../components/FAB'
import { EmptyState } from '../components/EmptyState'
import { AddProjectBottomsheet } from '../components/AddProjectBottomsheet'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import { ListTodo } from 'lucide-react'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { projects, deleteProject } = useProjectStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { openAddTask, openAddProject } = useUIStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => { fetchTasks() }, [])

  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Project not found</p>
      </div>
    )
  }

  const projectTasks = tasks.filter((t) => t.project_id === project.id)
  const inProgress = projectTasks.filter((t) => !t.is_done)
  const done = projectTasks.filter((t) => t.is_done)
  const totalCount = projectTasks.length
  const doneCount = done.length
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const handleDelete = async () => {
    await deleteProject(project.id)
    navigate('/projects')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: project.color }}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 active:opacity-60"
          >
            <ChevronLeft size={20} color="white" />
            <span className="text-[14px] text-white">{t('projects.title')}</span>
          </button>
          <button onClick={() => setMenuOpen(true)} className="p-1 active:opacity-60">
            <MoreHorizontal size={20} color="white" />
          </button>
        </div>

        <h1 style={{ fontSize: 28, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 10 }}>{project.name}</h1>

        {project.description && (
          <p className="text-[13px] mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>{project.description}</p>
        )}

        {/* Progress bar */}
        <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: 'white' }}
          />
        </div>
        <div className="flex justify-between">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('projects.done_of', { done: doneCount, total: totalCount })}
          </p>
          <p className="text-[11px] text-white">{percent}%</p>
        </div>
      </div>

      {/* Task sections */}
      <div className="flex-1 pb-24 pt-4">
        {projectTasks.length === 0 ? (
          <EmptyState icon={<ListTodo size={40} />} text={t('tasks.empty_progress')} />
        ) : (
          <>
            {/* In progress */}
            {inProgress.length > 0 && (
              <>
                <p className="section-label px-5 pb-2">{t('projects.in_progress')}</p>
                <div
                  className="mx-4 rounded-[16px] overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 4px rgba(28,16,7,0.07)' }}
                >
                  {inProgress.map((task, i) => (
                    <React.Fragment key={task.id}>
                      {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
                      <TaskCard task={task} />
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}

            {/* Done */}
            {done.length > 0 && (
              <>
                <p className="section-label px-5 pt-5 pb-2">{t('projects.done_section')}</p>
                <div
                  className="mx-4 rounded-[16px] overflow-hidden"
                  style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 4px rgba(28,16,7,0.07)' }}
                >
                  {done.map((task, i) => (
                    <React.Fragment key={task.id}>
                      {i > 0 && <div style={{ height: '0.5px', backgroundColor: 'var(--color-border)', marginLeft: 52 }} />}
                      <TaskCard task={task} />
                    </React.Fragment>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <FAB onPress={() => openAddTask(null, { project_id: project.id })} />

      {/* Context menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <div
            className="relative w-full rounded-t-[20px] overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              maxWidth: 430,
            }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>
            <button
              className="w-full text-left px-4 py-3 text-[16px]"
              style={{ color: 'var(--color-text)' }}
              onClick={() => { setMenuOpen(false); openAddProject(project.id) }}
            >
              {t('projects.edit_project')}
            </button>
            <button
              className="w-full text-left px-4 py-3 text-[16px]"
              style={{ color: 'var(--color-overdue)' }}
              onClick={() => { setMenuOpen(false); setConfirmDelete(true) }}
            >
              {t('projects.delete_project')}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDelete(false)} />
          <div className="relative w-full rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface)', maxWidth: 390 }}>
            <p className="text-[16px] mb-5" style={{ color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-full text-[14px]" style={{ color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)' }} onClick={() => setConfirmDelete(false)}>
                {t('common.confirm_delete_no')}
              </button>
              <button className="flex-1 py-3 rounded-full text-[14px] text-white" style={{ backgroundColor: 'var(--color-overdue)' }} onClick={handleDelete}>
                {t('common.confirm_delete_yes')}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddProjectBottomsheet />
    </div>
  )
}
