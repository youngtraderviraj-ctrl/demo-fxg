'use client'

import { Search, Bell, Sun, Moon, ChevronRight } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { ibProfile, commissionSummary, currency } from './mock-data'
import { Avatar } from './shared'
import { IB_NAV } from './IBSidebar'

interface Props {
  active: string
  onSearch: (v: string) => void
  search: string
  unread: number
  onBell: () => void
}

export default function IBTopbar({ active, onSearch, search, unread, onBell }: Props) {
  const { theme, toggleTheme } = useTheme()
  const label = IB_NAV.find((n) => n.id === active)?.label ?? 'Dashboard'

  return (
    <header className="glass-card sticky top-0 z-20 mb-6 rounded-3xl px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1 text-sm text-soft md:flex">
          <span>Master IB</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-[color:var(--text-primary)]">{label}</span>
        </div>

        <div className="relative ml-0 flex-1 md:ml-4 md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-full border border-white/30 bg-white/20 py-2 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder:text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 lg:flex">
            <span className="text-xs uppercase tracking-[0.2em] text-soft">Commission</span>
            <span className="text-sm font-bold text-accent">{currency(commissionSummary.monthly)}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[color:var(--text-primary)] transition hover:bg-white/30"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button
            onClick={onBell}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[color:var(--text-primary)] transition hover:bg-white/30"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          <Avatar name={ibProfile.name} color={ibProfile.avatarColor} size={40} />
        </div>
      </div>
    </header>
  )
}
