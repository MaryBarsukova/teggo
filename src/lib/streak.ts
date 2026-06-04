import { SupabaseClient } from '@supabase/supabase-js'

export async function updateStreak(userId: string, supabase: SupabaseClient) {
  const today = new Date().toISOString().split('T')[0]
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      heatmap_data: { [today]: 1 },
    })
    return
  }

  const heatmap = { ...streak.heatmap_data }
  heatmap[today] = (heatmap[today] || 0) + 1

  if (streak.last_active_date === today) {
    await supabase.from('streaks').update({ heatmap_data: heatmap }).eq('user_id', userId)
    return
  }

  const yesterday = getDateOffset(-1)
  const twoDaysAgo = getDateOffset(-2)

  const isConsecutive = streak.last_active_date === yesterday
  const canFreeze = !streak.freeze_used_this_week && streak.last_active_date === twoDaysAgo

  let newStreak = streak.current_streak
  let freezeUsed = streak.freeze_used_this_week

  if (isConsecutive || canFreeze) {
    newStreak = streak.current_streak + 1
    if (canFreeze) freezeUsed = true
  } else {
    newStreak = 1
  }

  await supabase.from('streaks').update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, streak.longest_streak),
    last_active_date: today,
    freeze_used_this_week: freezeUsed,
    heatmap_data: heatmap,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)
}

function getDateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
