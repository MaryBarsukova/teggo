import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Bottomsheet } from './Bottomsheet'
import { useProjectStore } from '../store/projectStore'
import { useUIStore } from '../store/uiStore'

const PROJECT_COLORS = [
  '#F0956E', '#E8775A', '#A96CC4', '#7A9E6C',
  '#378ADD', '#E2A030', '#D4537E', '#5DCAA5', '#888780',
]

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  padding: '16px 16px 6px',
}

export function AddProjectBottomsheet() {
  const { t } = useTranslation()
  const { isAddProjectOpen, editingProjectId, closeAddProject } = useUIStore()
  const { projects, addProject, updateProject } = useProjectStore()

  const editingProject = editingProjectId ? projects.find((p) => p.id === editingProjectId) : null

  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name)
      setColor(editingProject.color)
      setDescription(editingProject.description ?? '')
    } else {
      setName('')
      setColor(PROJECT_COLORS[0])
      setDescription('')
    }
  }, [editingProject, isAddProjectOpen])

  const handleSave = async () => {
    const trimmedName = name.trim().slice(0, 100)
    if (!trimmedName) return
    const trimmedDesc = description.trim().slice(0, 2000) || null
    if (editingProject) {
      await updateProject(editingProject.id, {
        name: trimmedName,
        color,
        description: trimmedDesc,
      })
    } else {
      await addProject({
        name: trimmedName,
        color,
        description: trimmedDesc,
      })
    }
    closeAddProject()
  }

  return (
    <Bottomsheet open={isAddProjectOpen} onClose={closeAddProject}>
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom)' }}>

        {/* Title */}
        <div style={{ padding: '0 16px 16px', borderBottom: '0.5px solid var(--color-border)' }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-text)', paddingTop: 16 }}>
            {editingProject ? t('projects.edit_project') : t('projects.new_project')}
          </p>
        </div>

        {/* Name section */}
        <p style={sectionLabel}>НАЗВАНИЕ</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название проекта"
          maxLength={100}
          style={{
            fontSize: 16,
            color: 'var(--color-text)',
            padding: '12px 16px',
            outline: 'none',
            background: 'transparent',
            borderBottom: '0.5px solid var(--color-border)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        {/* Description section */}
        <p style={{ ...sectionLabel, marginTop: 8 }}>ОПИСАНИЕ</p>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Необязательно"
          maxLength={2000}
          style={{
            fontSize: 15,
            color: 'var(--color-text)',
            padding: '12px 16px',
            outline: 'none',
            background: 'transparent',
            borderBottom: '0.5px solid var(--color-border)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        {/* Color section */}
        <p style={{ ...sectionLabel, marginTop: 8, paddingBottom: 12 }}>ЦВЕТ</p>
        <div style={{ display: 'flex', gap: 10, padding: '0 16px', flexWrap: 'wrap' }}>
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: c,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {color === c && <Check size={16} color="white" />}
            </button>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            margin: '20px 16px 8px',
            padding: 14,
            borderRadius: 14,
            backgroundColor: '#F0956E',
            color: 'white',
            fontSize: 15,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          {editingProject ? t('common.save') : t('projects.create')}
        </button>

        {/* Cancel */}
        <button
          onClick={closeAddProject}
          style={{
            padding: 8,
            textAlign: 'center',
            fontSize: 14,
            color: '#AAAAAA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {t('common.cancel')}
        </button>
      </div>
    </Bottomsheet>
  )
}
