import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Streak } from '../types'

interface StreakStore {
  streak: Streak | null
  fetchStreak: () => Promise<void>
}

export const useStreakStore = create<StreakStore>((set) => ({
  streak: null,

  fetchStreak: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('streaks').select('*').eq('user_id', user.id).single()
    if (data) set({ streak: data as Streak })
  },
}))
