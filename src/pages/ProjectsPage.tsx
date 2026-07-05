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
    if (!didLongPress.current) navigate(`/projects/${id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ── HEADER ── */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        paddingTop: 52,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
      }}>
        <h1 style={{ fontSize: 26, color: 'white', fontWeight: 500, lineHeight: 1.1, marginBottom: 2 }}>
          {t('projects.title')}
        </h1>
        {activeProjects.length > 0 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            {t('projects.active', { count: activeProjects.length })}
          </p>
        )}
      </div>

      {/* ── PROJECT LIST ── */}
      <div style={{ flex: 1, padding: '16px 16px 96px' }}>
        {projects.length === 0 ? (
          <EmptyState icon={<FolderOpen size={48} color="#E8775A" />} text={t('projects.empty')} />
        ) : (
          projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.project_id === project.id)
            const doneCount = projectTasks.filter((t) => t.is_done).length
            const totalCount = projectTasks.length
            const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

            return (
              <div
                key={project.id}
                onTouchStart={() => handlePressStart(project.id)}
                onTouchEnd={() => { handlePressEnd(); handleClick(project.id) }}
                onMouseDown={() => handlePressStart(project.id)}
                onMouseUp={() => { handlePressEnd(); handleClick(project.id) }}
                onMouseLeave={handlePressEnd}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  cursor: 'pointer',
                }}
              >
                {/* Project name + task count */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: project.color, flexShrink: 0 }} />
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>{project.name}</p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {t('projects.tasks_count', { count: totalCount })}
                  </p>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 9999, backgroundColor: 'var(--color-bg)', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', borderRadius: 9999, width: `${percent}%`, backgroundColor: project.color, transition: 'width 0.3s ease' }} />
                </div>

                {/* Progress labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {t('projects.done_of', { done: doneCount, total: totalCount })}
                  </p>
                  <p style={{ fontSize: 11, color: project.color, fontWeight: 500 }}>{percent}%</p>
                </div>
              </div>
            )
          })
        )}

        {/* Add project button */}
        <button
          onClick={() => openAddProject()}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 14,
            border: 'none',
            backgroundColor: '#FEF0EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 15,
            fontWeight: 500,
            color: '#E8775A',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          {t('projects.new_project')}
        </button>
      </div>

      {/* Context menu */}
      {menuProjectId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setMenuProjectId(null)}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 430,
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px 20px 0 0',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 32, height: 3, borderRadius: 2, backgroundColor: 'var(--color-border-strong)' }} />
            </div>
            <button
              style={{ width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 15, color: 'var(--color-text)', background: 'none', borderTop: '0.5px solid var(--color-border)', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer' }}
              onClick={() => { setMenuProjectId(null); openAddProject(menuProjectId ?? undefined) }}
            >
              {t('projects.edit_project')}
            </button>
            <button
              style={{ width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 15, color: 'var(--color-overdue)', background: 'none', borderTop: '0.5px solid var(--color-border)', borderLeft: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer' }}
              onClick={() => { setMenuProjectId(null); setConfirmDeleteId(menuProjectId) }}
            >
              {t('projects.delete_project')}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setConfirmDeleteId(null)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 360, backgroundColor: 'var(--color-surface)', borderRadius: 20, padding: 24 }}>
            <p style={{ fontSize: 16, color: 'var(--color-text)', marginBottom: 20 }}>{t('common.confirm_delete')}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{ flex: 1, padding: '12px 0', borderRadius: 9999, fontSize: 14, color: 'var(--color-text-muted)', border: '0.5px solid var(--color-border)', background: 'none', cursor: 'pointer' }}
                onClick={() => setConfirmDeleteId(null)}
              >
                {t('common.confirm_delete_no')}
              </button>
              <button
                style={{ flex: 1, padding: '12px 0', borderRadius: 9999, fontSize: 14, color: 'white', backgroundColor: 'var(--color-overdue)', border: 'none', cursor: 'pointer' }}
                onClick={() => { deleteProject(confirmDeleteId); setConfirmDeleteId(null) }}
              >
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
