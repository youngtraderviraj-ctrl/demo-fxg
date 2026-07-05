'use client'

import { useEffect, useState } from 'react'
import IBSidebar, { IB_NAV } from '@/components/master-ib/IBSidebar'
import IBTopbar from '@/components/master-ib/IBTopbar'
import DashboardPage from '@/components/master-ib/pages/DashboardPage'
import ClientsPage from '@/components/master-ib/pages/ClientsPage'
import CommissionsPage from '@/components/master-ib/pages/CommissionsPage'
import ReferralPage from '@/components/master-ib/pages/ReferralPage'
import PaymentsPage from '@/components/master-ib/pages/PaymentsPage'
import ReportsPage from '@/components/master-ib/pages/ReportsPage'
import NotificationsPage from '@/components/master-ib/pages/NotificationsPage'
import ProfilePage from '@/components/master-ib/pages/ProfilePage'
import CommandPalette from '@/components/master-ib/CommandPalette'
import { Skeleton } from '@/components/master-ib/shared'
import { NOTIFICATIONS } from '@/components/master-ib/mock-data'

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}

export default function MasterIBPortal() {
  const [active, setActive] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const unread = NOTIFICATIONS.filter((n) => !n.read).length

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [active])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const changeTab = (id: string) => {
    setActive(id)
    if (id !== 'clients') setSearch('')
  }

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <DashboardPage />
      case 'clients': return <ClientsPage globalSearch={search} />
      case 'commissions': return <CommissionsPage />
      case 'referral': return <ReferralPage />
      case 'payments': return <PaymentsPage />
      case 'reports': return <ReportsPage />
      case 'notifications': return <NotificationsPage />
      case 'profile': return <ProfilePage />
      default: return <DashboardPage />
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-4 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 blur-3xl" aria-hidden />

      <IBSidebar active={active} onChange={changeTab} open={sidebarOpen} setOpen={setSidebarOpen} unread={unread} />

      <main className="relative z-10 lg:ml-80">
        <div className="mx-auto max-w-7xl">
          <IBTopbar
            active={active}
            search={search}
            onSearch={(v) => { setSearch(v); if (v && active !== 'clients') setActive('clients') }}
            unread={unread}
            onBell={() => changeTab('notifications')}
          />
          <div className="pb-12">
            {loading ? <LoadingState /> : renderPage()}
          </div>
        </div>
      </main>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(id) => { changeTab(id); setPaletteOpen(false) }}
        items={IB_NAV}
      />
    </div>
  )
}
