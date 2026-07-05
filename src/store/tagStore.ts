import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Tag } from '../types'

interface TagStore {
  tags: Tag[]
  loading: boolean
  fetchTags: () => Promise<void>
  addTag: (name: string, color: string, icon: string) => Promise<Tag | null>
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color' | 'icon'>>) => Promise<void>
  deleteTag: (id: string) => Promise<void>
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  loading: false,

  fetchTags: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (data) set({ tags: data as Tag[] })
    } catch {
      // Silently fail — UI shows empty state
    } finally {
      set({ loading: false })
    }
  },

  addTag: async (name, color, icon) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: name.trim().slice(0, 100), color, icon, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      if (data) {
        set((s) => ({ tags: [data as Tag, ...s.tags] }))
        return data as Tag
      }
    } catch {
      // Silently fail
    }
    return null
  },

  updateTag: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      if (data) set((s) => ({ tags: s.tags.map((t) => (t.id === id ? (data as Tag) : t)) }))
    } catch {
      // Silently fail
    }
  },

  deleteTag: async (id) => {
    // Optimistic update
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }))
    try {
      const { error } = await supabase.from('tags').delete().eq('id', id)
      if (error) throw error
    } catch {
      // Re-fetch to restore correct state on error
      get().fetchTags()
    }
  },
}))
