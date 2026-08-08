import { NavLink } from 'react-router-dom'
import { Home, ListTodo, FolderOpen, Calendar, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const tabs = [
  { to: '/', icon: Home, key: 'nav.today', exact: true },
  { to: '/tasks', icon: ListTodo, key: 'nav.tasks', exact: false },
  { to: '/projects', icon: FolderOpen, key: 'nav.projects', exact: false },
  { to: '/calendar', icon: Calendar, key: 'nav.calendar', exact: false },
  { to: '/settings', icon: Settings, key: 'nav.settings', exact: false },
]

export function TabBar() {
  const { t } = useTranslation()

  return (
    <nav
      className="tab-bar-mobile fixed bottom-0 z-40 flex"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '0.5px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(430px, 100vw)',
      }}
    >
      {tabs.map(({ to, icon: Icon, key, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className="flex-1 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? '#F0956E' : '#AAAAAA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            gap: 3,
            minHeight: 56,
          })}
        >
          <Icon size={20} />
          <span style={{ fontSize: '10px', fontWeight: 500 }}>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
