'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
  MessageSquare,
  Settings,
  CreditCard,
  BarChart3,
  Bell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'mt5', label: 'MT5 Sync', icon: TrendingUp },
    { id: 'telegram', label: 'Telegram', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-full bg-accent/90 p-3 text-white shadow-xl lg:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-4 z-40 h-[calc(100vh-32px)] transform transition-all duration-500 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-24' : 'w-72'}`}
      >
        <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[rgba(5,12,25,0.9)] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 to-white/40 text-[color:var(--text-primary)]">
                <Sparkles className="h-7 w-7 text-[color:var(--text-primary)]" />
              </div>
              {!isCollapsed && (
                <>
                  <h1 className="text-lg font-semibold tracking-wide text-white">FXG Alpha</h1>
                  <p className="text-[13px] uppercase tracking-[0.3em] text-white/60">Dashboard</p>
                </>
              )}
            </div>
            <button
              className="hidden rounded-full border border-white/30 p-2 text-white/70 transition hover:bg-white/10 lg:inline-flex"
              onClick={() => setIsCollapsed((prev) => !prev)}
            >
              {isCollapsed ? '<' : '>'}
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    if (window.innerWidth < 1024) setIsOpen(false)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur'
                      : 'text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {isActive && !isCollapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                </button>
              )
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            {!isCollapsed && (
              <>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Operator</p>
                <p className="mt-2 text-lg font-semibold">Admin User</p>
                <p className="text-sm text-white/70">admin@fxgalpha.com</p>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-md lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
