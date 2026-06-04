import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'
import { track } from '../lib/analytics'

interface ProjectStore {
  projects: Project[]
  loading: boolean
  fetchProjects: () => Promise<void>
  addProject: (project: Omit<Project, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true })
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (data) set({ projects: data as Project[] })
    set({ loading: false })
  },

  addProject: async (project) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .insert({ ...project, user_id: user.id })
      .select()
      .single()
    if (data) {
      set((s) => ({ projects: [data as Project, ...s.projects] }))
      track('project_created', { has_description: !!project.description })
    }
  },

  updateProject: async (id, updates) => {
    const { data } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    if (data) {
      set((s) => ({ projects: s.projects.map((p) => (p.id === id ? (data as Project) : p)) }))
    }
  },

  deleteProject: async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
  },
}))
