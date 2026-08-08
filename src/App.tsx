import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ListTodo, FolderOpen, Calendar, Settings, Plus } from 'lucide-react'
import { supabase } from './lib/supabase'
import { TabBar } from './components/TabBar'
import { AddTaskBottomsheet } from './components/AddTaskBottomsheet'
import { SplashScreen } from './components/SplashScreen'
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
import { useUIStore } from './store/uiStore'

const NAV_ITEMS = [
  { to: '/', icon: Home, key: 'nav.today', exact: true },
  { to: '/tasks', icon: ListTodo, key: 'nav.tasks', exact: false },
  { to: '/projects', icon: FolderOpen, key: 'nav.projects', exact: false },
  { to: '/calendar', icon: Calendar, key: 'nav.calendar', exact: false },
  { to: '/settings', icon: Settings, key: 'nav.settings', exact: false },
]

function DesktopSidebar() {
  const { t } = useTranslation()
  const { openAddTask } = useUIStore()

  return (
    <nav className="app-sidebar">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 20px', borderBottom: '0.5px solid var(--color-border)', marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>T</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)' }}>Teggo</span>
      </div>

      {/* New Task button */}
      <button
        onClick={() => openAddTask()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        <Plus size={16} />
        Новая задача
      </button>

      {/* Nav links */}
      {NAV_ITEMS.map(({ to, icon: Icon, key, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="transition-colors-fast"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            borderRadius: 9,
            marginBottom: 2,
            textDecoration: 'none',
            backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: isActive ? 500 : 400,
            fontSize: 14,
          })}
        >
          <Icon size={17} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function AppLayout() {
  return (
    <>
      <DesktopSidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar />
      <AddTaskBottomsheet />
    </>
  )
}

export default function App() {
  const navigate = useNavigate()
  const [session, setSession] = useState<boolean | null>(null)
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'))
  const { fetchSettings, settings } = useSettingsStore()
  const { fetchProjects } = useProjectStore()
  const { fetchTags } = useTagStore()

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', '1')
    setShowSplash(false)
  }

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

  if (showSplash) {
    return <SplashScreen onDone={handleSplashDone} />
  }

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
