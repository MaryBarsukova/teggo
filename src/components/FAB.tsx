import { Plus } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

interface FABProps {
  onPress?: () => void
}

export function FAB({ onPress }: FABProps) {
  const { openAddTask } = useUIStore()

  return (
    <button
      onClick={() => onPress ? onPress() : openAddTask()}
      aria-label="Новая задача"
      className="fab-mobile fixed z-30 flex items-center justify-center rounded-full active:opacity-70 transition-colors-fast"
      style={{
        width: 52,
        height: 52,
        backgroundColor: 'var(--color-primary)',
        bottom: `calc(env(safe-area-inset-bottom) + 70px)`,
        right: 'max(18px, calc(50vw - 196px))',
        boxShadow: '0 4px 16px rgba(240,149,110,0.40), 0 1px 4px rgba(0,0,0,0.12)',
      }}
    >
      <Plus size={22} color="white" strokeWidth={2.5} />
    </button>
  )
}
