import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, FolderOpen } from 'lucide-react'
import { AddProjectBottomsheet } from '../components/AddProjectBottomsheet'
import { EmptyState } from '../components/EmptyState'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'

export function ProjectsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { projects, fetchProjects, deleteProject } = useProjectStore()
  const { tasks, fetchTasks } = useTaskStore()
  const { openAddProject } = useUIStore()
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [])

  const activeProjects = projects.filter((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id)
    return projectTasks.some((t) => !t.is_done)
  })

  const handlePressStart = (id: string) => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setMenuProjectId(id)
    }, 500)
  }

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  const handleClick = (id: string) => {
    if (!didLongPress.current) {
      navigate(`/projects/${id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ backgroundColor: 'var(--color-primary)' }}>
        <h1 style={{ fontSize: 32, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 2 }}>{t('projects.title')}</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
          {t('projects.active', { count: activeProjects.length })}
        </p>
      </div>

      {/* Project list */}
      <div className="flex-1 px-4 py-4 pb-24">
        {projects.length === 0 ? (
          <EmptyState icon={<FolderOpen size={40} />} text={t('projects.empty')} />
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.project_id === project.id)
            const doneCount = projectTasks.filter((t) => t.is_done).length
            const totalCount = projectTasks.length
            const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

            return (
              <div
                key={project.id}
                className="mb-3 p-4 rounded-[var(--radius-md)] active:opacity-80 cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '0.5px solid var(--color-border)',
                }}
                onTouchStart={() => handlePressStart(project.id)}
                onTouchEnd={() => { handlePressEnd(); handleClick(project.id) }}
                onMouseDown={() => handlePressStart(project.id)}
                onMouseUp={() => { handlePressEnd(); handleClick(project.id) }}
                onMouseLeave={handlePressEnd}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                    <p className="text-[14px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{project.name}</p>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                    {t('projects.tasks_count', { count: totalCount })}
                  </p>
                </div>

                <div className="h-1 rounded-full mb-2" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percent}%`, backgroundColor: project.color }}
                  />
                </div>

                <div className="flex justify-between">
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {t('projects.done_of', { done: doneCount, total: totalCount })}
                  </p>
                  <p className="text-[11px]" style={{ color: project.color }}>{percent}%</p>
                </div>
              </div>
            )
          })
        )}

        {/* Add new project button */}
        <button
          onClick={() => openAddProject()}
          className="w-full py-4 rounded-[var(--radius-md)] flex items-center justify-center gap-2 text-[14px]"
          style={{
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Plus size={16} />
          {t('projects.new_project')}
        </button>
      </div>

      {/* Context menu */}
      {menuProjectId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setMenuProjectId(null)}>
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
              onClick={() => { setMenuProjectId(null); openAddProject(menuProjectId) }}
            >
              {t('projects.edit_project')}
            </button>
            <button
              className="w-full text-left px-4 py-3 text-[16px]"
              style={{ color: 'var(--color-overdue)' }}
              onClick={() => { setMenuProjectId(null); setConfirmDeleteId(menuProjectId) }}
            >
              {t('projects.delete_project')}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDeleteId(null)} />
          <div className="relative w-full rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface)', maxWidth: 390 }}>
            <p className="text-[16px] mb-5" style={{ color: 'var(--color-text)' }}>{t('common.confirm_delete')}</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-full text-[14px]" style={{ color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)' }} onClick={() => setConfirmDeleteId(null)}>
                {t('common.confirm_delete_no')}
              </button>
              <button className="flex-1 py-3 rounded-full text-[14px] text-white" style={{ backgroundColor: 'var(--color-overdue)' }} onClick={() => { deleteProject(confirmDeleteId); setConfirmDeleteId(null) }}>
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
