import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { TabBar } from './components/TabBar'
import { AddTaskBottomsheet } from './components/AddTaskBottomsheet'
import { TodayPage } from './pages/TodayPage'
import { TasksPage } from './pages/TasksPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { useSettingsStore } from './store/settingsStore'
import { useProjectStore } from './store/projectStore'
import { useTagStore } from './store/tagStore'

function AppLayout() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
      <AddTaskBottomsheet />
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const [session, setSession] = useState<boolean | null>(null)
  const { fetchSettings, settings } = useSettingsStore()
  const { fetchProjects } = useProjectStore()
  const { fetchTags } = useTagStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session)
      if (data.session) {
        fetchSettings()
        fetchProjects()
        fetchTags()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess)
      if (sess) {
        navigate('/')
        fetchSettings()
        fetchProjects()
        fetchTags()
      } else {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Apply dark mode from settings
  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    if (settings.dark_mode === 'dark') root.setAttribute('data-theme', 'dark')
    else if (settings.dark_mode === 'light') root.setAttribute('data-theme', 'light')
    else root.removeAttribute('data-theme')
  }, [settings?.dark_mode])

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AppLayout />
}
