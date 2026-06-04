import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import { track } from '../lib/analytics'
import { updateStreak } from '../lib/streak'

interface TaskStore {
  tasks: Task[]
  loading: boolean
  searchQuery: string
  activeTagId: string | null
  setSearchQuery: (q: string) => void
  setActiveTagId: (id: string | null) => void
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'is_overdue'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleDone: (id: string, userId: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  searchQuery: '',
  activeTagId: null,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTagId: (id) => set({ activeTagId: id }),

  fetchTasks: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ tasks: data as Task[] })
    set({ loading: false })
  },

  addTask: async (task) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id, is_overdue: false })
      .select()
      .single()
    if (data) {
      set((s) => ({ tasks: [data as Task, ...s.tasks] }))
      track('task_created', {
        has_description: !!task.description,
        has_tag: !!task.tag_id,
        has_project: !!task.project_id,
        has_time: !!task.time,
        repeat_type: task.repeat_type,
      })
    }
  },

  updateTask: async (id, updates) => {
    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? (data as Task) : t)) }))
      track('task_edited')
    }
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    track('task_deleted')
  },

  toggleDone: async (id, userId) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const isDone = !task.is_done
    const updates: Partial<Task> = {
      is_done: isDone,
      done_at: isDone ? new Date().toISOString() : null,
    }
    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? (data as Task) : t)) }))
      if (isDone) {
        track('task_completed')
        await updateStreak(userId, supabase)
      }
    }
  },
}))
