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
      className="fixed z-30 flex items-center justify-center rounded-full active:opacity-70"
      style={{
        width: 50,
        height: 50,
        backgroundColor: 'var(--color-primary)',
        bottom: `calc(env(safe-area-inset-bottom) + 72px)`,
        right: 'max(20px, calc(50vw - 195px))',
      }}
    >
      <Plus size={24} color="white" />
    </button>
  )
}
