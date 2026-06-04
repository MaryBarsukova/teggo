import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bottomsheet } from './Bottomsheet'
import { Checkbox } from './Checkbox'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import { track } from '../lib/analytics'

export function FocusPickerBottomsheet() {
  const { t } = useTranslation()
  const { isFocusPickerOpen, closeFocusPicker, setFocusTaskIds, focusTaskIds, setFocusMode } = useUIStore()
  const { tasks } = useTaskStore()
  const [selected, setSelected] = useState<string[]>([])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((t) => !t.is_done && t.date === today)

  useEffect(() => {
    if (isFocusPickerOpen) setSelected(focusTaskIds)
  }, [isFocusPickerOpen])

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const handleDone = () => {
    if (selected.length === 0) {
      setFocusMode(false)
      setFocusTaskIds([])
    } else {
      setFocusTaskIds(selected)
      track('focus_tasks_selected', { count: selected.length })
    }
    closeFocusPicker()
  }

  return (
    <Bottomsheet open={isFocusPickerOpen} onClose={() => {
      if (selected.length === 0) setFocusMode(false)
      closeFocusPicker()
    }} fullHeight>
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-1 py-2">
          <p className="text-[16px]" style={{ fontWeight: 500, color: 'var(--color-text)' }}>{t('focus.pick_title')}</p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            {t('focus.counter', { current: selected.length, max: 3 })}
          </p>
        </div>
        <p className="text-[13px] mb-4" style={{ color: 'var(--color-text-muted)' }}>{t('focus.pick_sub')}</p>

        <div className="flex flex-col">
          {todayTasks.map((task) => {
            const isSelected = selected.includes(task.id)
            const isDisabled = !isSelected && selected.length >= 3
            return (
              <button
                key={task.id}
                onClick={() => !isDisabled && toggle(task.id)}
                className="flex items-center gap-3 py-3"
                style={{
                  opacity: isDisabled ? 0.4 : 1,
                  borderBottom: '0.5px solid var(--color-border)',
                }}
              >
                <Checkbox checked={isSelected} onChange={() => !isDisabled && toggle(task.id)} />
                <span className="text-[14px] text-left" style={{ color: 'var(--color-text)' }}>{task.title}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleDone}
          className="w-full py-3.5 rounded-full text-[14px] text-white mt-6"
          style={{ backgroundColor: 'var(--color-primary)', fontWeight: 500 }}
        >
          {t('focus.done')}
        </button>
      </div>
    </Bottomsheet>
  )
}
