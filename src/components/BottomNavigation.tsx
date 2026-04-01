import { Link, useLocation } from 'react-router-dom'
import {
  TrendUp,
  Users,
  GameController,
  Gear,
  ChartLineUp
} from '@phosphor-icons/react'

interface NavItem {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const navItems: NavItem[] = [
  { to: '/',           icon: TrendUp,      label: 'Dashboard' },
  { to: '/players',    icon: Users,         label: 'Players' },
  { to: '/games',      icon: GameController, label: 'Games' },
  { to: '/stats',      icon: ChartLineUp,   label: 'Stats' },
  { to: '/settings',   icon: Gear,          label: 'Settings' },
]

export function BottomNavigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-white/10">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center p-3 transition-colors ${
                isActive ? 'text-teal-400' : 'text-white/60 hover:text-white'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation
