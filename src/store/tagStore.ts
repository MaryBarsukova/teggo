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

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  loading: false,

  fetchTags: async () => {
    set({ loading: true })
    const { data } = await supabase.from('tags').select('*').order('created_at', { ascending: false })
    if (data) set({ tags: data as Tag[] })
    set({ loading: false })
  },

  addTag: async (name, color, icon) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('tags')
      .insert({ name, color, icon, user_id: user.id })
      .select()
      .single()
    if (data) {
      set((s) => ({ tags: [data as Tag, ...s.tags] }))
      return data as Tag
    }
    return null
  },

  updateTag: async (id, updates) => {
    const { data } = await supabase.from('tags').update(updates).eq('id', id).select().single()
    if (data) set((s) => ({ tags: s.tags.map((t) => (t.id === id ? (data as Tag) : t)) }))
  },

  deleteTag: async (id) => {
    await supabase.from('tags').delete().eq('id', id)
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }))
  },
}))
