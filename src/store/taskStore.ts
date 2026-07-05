import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import { track } from '../lib/analytics'
import { updateStreak } from '../lib/streak'

type TaskPayload = Omit<Task, 'id' | 'user_id' | 'created_at' | 'is_overdue' | 'tag_id'>

interface TaskStore {
  tasks: Task[]
  loading: boolean
  searchQuery: string
  activeTagId: string | null
  setSearchQuery: (q: string) => void
  setActiveTagId: (id: string | null) => void
  fetchTasks: () => Promise<void>
  addTask: (task: TaskPayload) => Promise<void>
  updateTask: (id: string, updates: Partial<TaskPayload>) => Promise<void>
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
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_tags(tag_id)')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) {
        const tasks = data.map((t: any) => ({
          ...t,
          tag_ids: (t.task_tags ?? []).map((tt: { tag_id: string }) => tt.tag_id),
        })) as Task[]
        set({ tasks })
      }
    } catch {
      // Silently fail — UI shows empty state
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { tag_ids, ...taskData } = task
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id, is_overdue: false, tag_id: null })
        .select()
        .single()
      if (error) throw error
      if (data) {
        if (tag_ids && tag_ids.length > 0) {
          await supabase.from('task_tags').insert(
            tag_ids.map((tid) => ({ task_id: data.id, tag_id: tid }))
          )
        }
        const newTask: Task = { ...data, tag_ids: tag_ids ?? [] }
        set((s) => ({ tasks: [newTask, ...s.tasks] }))
        track('task_created', {
          has_description: !!task.description,
          has_tags: (tag_ids?.length ?? 0) > 0,
          has_project: !!task.project_id,
          has_time: !!task.time,
          repeat_type: task.repeat_type,
        })
      }
    } catch {
      // Silently fail — task stays local until refresh
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { tag_ids, ...taskUpdates } = updates as any
      const dbUpdates: any = { ...taskUpdates }
      delete dbUpdates.tag_ids

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id)
        if (error) throw error
      }

      if (tag_ids !== undefined) {
        await supabase.from('task_tags').delete().eq('task_id', id)
        if (tag_ids.length > 0) {
          await supabase.from('task_tags').insert(
            tag_ids.map((tid: string) => ({ task_id: id, tag_id: tid }))
          )
        }
      }

      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }))
      track('task_edited')
    } catch {
      // Silently fail
    }
  },

  deleteTask: async (id) => {
    // Optimistic update
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      track('task_deleted')
    } catch {
      // Re-fetch to restore correct state on error
      get().fetchTasks()
    }
  },

  toggleDone: async (id, userId) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    try {
      const isDone = !task.is_done
      const updates = { is_done: isDone, done_at: isDone ? new Date().toISOString() : null }
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
      if (error) throw error
      if (data) {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }))
        if (isDone) {
          track('task_completed')
          await updateStreak(userId, supabase)
        }
      }
    } catch {
      // Silently fail — state unchanged
    }
  },
}))
