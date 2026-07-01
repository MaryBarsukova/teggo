import { create } from 'zustand'
import type { Task } from '../types'

interface UIStore {
  isAddTaskOpen: boolean
  isAddProjectOpen: boolean
  editingTask: Task | null
  editingProjectId: string | null
  isFocusPickerOpen: boolean
  isFocusMode: boolean
  focusTaskIds: string[]
  selectedCalendarDate: string
  activeFilters: string[]

  newTaskDefaults: Partial<Task> | null
  openAddTask: (task?: Task | null, defaults?: Partial<Task>) => void
  closeAddTask: () => void
  openAddProject: (projectId?: string | null) => void
  closeAddProject: () => void
  openFocusPicker: () => void
  closeFocusPicker: () => void
  setFocusMode: (on: boolean) => void
  setFocusTaskIds: (ids: string[]) => void
  setSelectedCalendarDate: (date: string) => void
}

const todayStr = () => new Date().toISOString().split('T')[0]

export const useUIStore = create<UIStore>((set) => ({
  isAddTaskOpen: false,
  isAddProjectOpen: false,
  editingTask: null,
  newTaskDefaults: null,
  editingProjectId: null,
  isFocusPickerOpen: false,
  isFocusMode: false,
  focusTaskIds: [],
  selectedCalendarDate: todayStr(),
  activeFilters: [],

  openAddTask: (task = null, defaults = undefined) => set({ isAddTaskOpen: true, editingTask: task, newTaskDefaults: defaults ?? null }),
  closeAddTask: () => set({ isAddTaskOpen: false, editingTask: null, newTaskDefaults: null }),
  openAddProject: (projectId = null) => set({ isAddProjectOpen: true, editingProjectId: projectId }),
  closeAddProject: () => set({ isAddProjectOpen: false, editingProjectId: null }),
  openFocusPicker: () => set({ isFocusPickerOpen: true }),
  closeFocusPicker: () => set({ isFocusPickerOpen: false }),
  setFocusMode: (on) => set({ isFocusMode: on }),
  setFocusTaskIds: (ids) => set({ focusTaskIds: ids }),
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),
}))
