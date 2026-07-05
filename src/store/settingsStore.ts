import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { UserSettings } from '../types'
import { track } from '../lib/analytics'

interface SettingsStore {
  settings: UserSettings | null
  fetchSettings: () => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,

  fetchSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error) throw error
      if (data) set({ settings: data as UserSettings })
    } catch {
      // Silently fail — defaults applied at usage sites
    }
  },

  updateSettings: async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const current = get().settings
      const merged = { ...current, ...updates } as UserSettings

      if (updates.language !== undefined && updates.language !== current?.language) {
        track('language_changed', { language: updates.language })
      }
      if (updates.dark_mode !== undefined && updates.dark_mode !== current?.dark_mode) {
        track('dark_mode_toggled', { enabled: updates.dark_mode !== 'light' })
      }
      if (updates.show_description !== undefined && updates.show_description !== current?.show_description) {
        track('description_display_toggled', { enabled: updates.show_description })
      }

      // Optimistic update
      set({ settings: merged })

      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
      if (error) throw error
    } catch {
      // Re-fetch to restore correct state on error
      get().fetchSettings()
    }
  },
}))
