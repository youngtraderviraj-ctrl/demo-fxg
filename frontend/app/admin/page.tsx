'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { analyticsAPI, clientsAPI, mt5API } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/client')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const [statsRes, clientsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        clientsAPI.getAll({ limit: 10 })
      ])

      setStats(statsRes.data)
      setClients(clientsRes.data.data)
    } catch (error: any) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      toast.loading('Syncing MT5 accounts...')
      await mt5API.sync()
      toast.success('MT5 sync completed!')
      loadData()
    } catch (error) {
      toast.error('Sync failed')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--text-primary)]/40 border-t-transparent" />
          <p className="mt-4 text-soft">Loading...</p>
        </div>
      </div>
    )
  }

  const statCards = stats
    ? [
        { label: 'Total Clients', value: stats.total_clients, sub: `${stats.active_clients} active` },
        { label: 'Weekly Profit', value: `$${stats.total_weekly_profit.toFixed(2)}`, sub: 'This week' },
        { label: 'Fees Due', value: `$${stats.total_fees_due.toFixed(2)}`, sub: `${stats.pending_invoices} pending` },
        { label: 'Collection Rate', value: `${stats.collection_rate}%`, sub: `$${stats.total_collected.toFixed(2)} collected` },
      ]
    : []

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 blur-3xl" aria-hidden />

      <div className="relative z-10 space-y-8">
        <section className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-soft">FXG / Control</p>
              <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)]">Admin Command Deck</h1>
              <p className="mt-3 max-w-2xl text-soft">Monitor performance, sync MT5 accounts, and keep clients aligned with a single touch.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSync}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-lg"
              >
                Sync MT5
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-[color:var(--text-primary)]"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {statCards.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="glass-card rounded-2xl border-none p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-soft">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{card.value}</p>
                <p className="text-sm text-soft">{card.sub}</p>
              </div>
            ))}
          </section>
        )}

        <section className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-soft">Clients</p>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">Recent Clients</h2>
            </div>
            <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-soft">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20 bg-white/30">
                <tr>
                  {['Name', 'Email', 'Status', 'Profit Split'].map((label) => (
                    <th key={label} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15 bg-white/15">
                {clients.map((client) => (
                  <tr key={client.id} className="transition hover:bg-white/25">
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{client.name}</td>
                    <td className="px-6 py-4 text-soft">{client.email || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-soft">{client.profit_split_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Add Client', desc: 'Create a new client account' },
            { title: 'Generate Invoices', desc: 'Create weekly invoices' },
            { title: 'Send Reports', desc: 'Broadcast to all clients' },
          ].map((action) => (
            <button
              key={action.title}
              className="glass-card rounded-3xl border-none p-6 text-left transition hover:translate-y-[-2px]"
            >
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{action.title}</h3>
              <p className="mt-2 text-sm text-soft">{action.desc}</p>
            </button>
          ))}
        </section>
      </div>
    </div>
  )
}
