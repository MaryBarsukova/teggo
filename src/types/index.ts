export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  date: string | null
  time: string | null
  is_done: boolean
  done_at: string | null
  is_overdue: boolean
  project_id: string | null
  tag_id: string | null  // keep for DB compat
  tag_ids: string[]      // derived from task_tags join
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  repeat_days: number[] | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string   // hex color e.g. '#7C6FCC'
  icon: string    // lucide icon name e.g. 'briefcase'
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_date: string | null
  freeze_used_this_week: boolean
  heatmap_data: Record<string, number>
  updated_at: string
}

export interface UserSettings {
  user_id: string
  show_description: boolean
  dark_mode: 'system' | 'light' | 'dark'
  language: 'auto' | 'ru' | 'en'
  notifications: boolean
  morning_digest: boolean
  morning_time: string
  focus_mode: boolean    // show focus section on Today
  show_streak: boolean   // show streak/heatmap in Today header
}
