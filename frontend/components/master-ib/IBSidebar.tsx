'use client'

import {
  LayoutDashboard,
  Users,
  Wallet,
  Share2,
  CreditCard,
  BarChart3,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Crown,
} from 'lucide-react'
import { ibProfile } from './mock-data'
import { Avatar } from './shared'

export const IB_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'My Clients', icon: Users },
  { id: 'commissions', label: 'Commissions', icon: Wallet },
  { id: 'referral', label: 'Referral Center', icon: Share2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: UserCircle },
]

interface Props {
  active: string
  onChange: (id: string) => void
  open: boolean
  setOpen: (v: boolean) => void
  unread: number
}

export default function IBSidebar({ active, onChange, open, setOpen, unread }: Props) {
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-full bg-accent p-3 text-white shadow-xl lg:hidden"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed left-4 top-4 z-40 h-[calc(100vh-32px)] w-72 transform transition-transform duration-500 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-[110%]'
        }`}
      >
        <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[rgba(5,12,25,0.9)] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-[#0a1224] shadow-lg">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-wide text-white">Master IB</h1>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">Portal</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {IB_NAV.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChange(item.id)
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) setOpen(false)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                    isActive ? 'bg-white/20 text-white shadow-lg backdrop-blur' : 'text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unread > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                  {isActive && item.id !== 'notifications' && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={ibProfile.name} color={ibProfile.avatarColor} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{ibProfile.name}</p>
                <p className="truncate text-xs text-white/60">{ibProfile.email}</p>
              </div>
            </div>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-md lg:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  )
}
