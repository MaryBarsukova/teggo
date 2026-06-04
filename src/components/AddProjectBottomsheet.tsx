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
    if (!name.trim()) return
    if (editingProject) {
      await updateProject(editingProject.id, {
        name: name.trim(),
        color,
        description: description.trim() || null,
      })
    } else {
      await addProject({
        name: name.trim(),
        color,
        description: description.trim() || null,
      })
    }
    closeAddProject()
  }

  return (
    <Bottomsheet open={isAddProjectOpen} onClose={closeAddProject}>
      <div className="px-4 pb-4">
        <p className="text-[16px] py-2 mb-4" style={{ fontWeight: 500, color: 'var(--color-text)' }}>
          {editingProject ? t('projects.edit_project') : t('projects.new_project')}
        </p>

        {/* Name with colored dot */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('projects.name')}
            className="flex-1 text-[16px] outline-none bg-transparent py-2"
            style={{ color: 'var(--color-text)', borderBottom: '0.5px solid var(--color-border)' }}
          />
        </div>

        {/* Color picker */}
        <p className="text-[11px] mb-3" style={{ color: 'var(--color-text-muted)' }}>{t('projects.color')}</p>
        <div className="flex gap-3 mb-4 flex-wrap">
          {PROJECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: c }}
            >
              {color === c && <Check size={16} color="white" />}
            </button>
          ))}
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('projects.add_description')}
          rows={2}
          className="w-full text-[13px] outline-none bg-transparent resize-none py-2"
          style={{
            color: 'var(--color-text)',
            borderBottom: '0.5px solid var(--color-border)',
          }}
        />

        {/* Actions */}
        <div className="flex justify-between items-center mt-6">
          <button onClick={closeAddProject} className="px-4 py-2 text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2.5 rounded-full text-[14px] text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
          >
            {editingProject ? t('common.save') : t('projects.create')}
          </button>
        </div>
      </div>
    </Bottomsheet>
  )
}
