'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clientPortalAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function ClientDashboard() {
  const router = useRouter()
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'client') {
      router.push('/admin')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const response = await clientPortalAPI.getDashboard()
      setDashboard(response.data)
    } catch (error: any) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
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

  const { client, account, recent_invoices } = dashboard || {}

  const accountCards = account
    ? [
        { label: 'Balance', value: `$${(account.balance ?? 0).toFixed(2)}`, sub: 'Current balance' },
        { label: 'Equity', value: `$${(account.equity ?? 0).toFixed(2)}`, sub: 'Current equity' },
        { label: 'Profit', value: `$${(account.profit ?? 0).toFixed(2)}`, sub: 'Floating P/L' },
        { label: 'Margin Level', value: `${(account.margin_level ?? 0).toFixed(0)}%`, sub: 'Current margin' },
      ]
    : []

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 blur-3xl" aria-hidden />

      <div className="relative z-10 space-y-8">
        <section className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-soft">FXG / Client</p>
              <h1 className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">Welcome, {client?.name}</h1>
              <p className="mt-2 text-soft">Stay synced with your performance, invoices, and payouts.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-[color:var(--text-primary)]"
            >
              Logout
            </button>
          </div>
        </section>

        {accountCards.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accountCards.map((card) => (
              <div key={card.label} className="glass-card rounded-2xl border-none p-6">
                <p className="text-xs uppercase tracking-[0.4em] text-soft">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">{card.value}</p>
                <p className="text-sm text-soft">{card.sub}</p>
              </div>
            ))}
          </section>
        )}

        <section className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-soft">Invoices</p>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">Recent Invoices</h2>
            </div>
            <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-soft">Download all</button>
          </div>
          <div className="overflow-x-auto">
            {recent_invoices && recent_invoices.length > 0 ? (
              <table className="w-full">
                <thead className="border-b border-white/20 bg-white/30">
                  <tr>
                    {['Invoice #', 'Amount', 'Period', 'Due Date', 'Status'].map((label) => (
                      <th key={label} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/15 bg-white/15">
                  {recent_invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="transition hover:bg-white/25">
                      <td className="px-6 py-4 text-[color:var(--text-primary)]">{invoice.invoice_number}</td>
                      <td className="px-6 py-4 text-[color:var(--text-primary)]">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-soft">
                        {invoice.period_start} to {invoice.period_end}
                      </td>
                      <td className="px-6 py-4 text-soft">{invoice.due_date}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-soft">No invoices yet</p>
              </div>
            )}
          </div>
        </section>

        {client && (
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.4em] text-soft">Account</p>
              <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">Account Information</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Email', value: client.email || 'Not set' },
                { label: 'Phone', value: client.phone || 'Not set' },
                { label: 'Profit Split', value: `${client.profit_split_percentage}%` },
                { label: 'Status', value: client.status },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/20 bg-white/30 p-4">
                  <p className="text-sm text-soft">{item.label}</p>
                  <p className="text-lg font-medium text-[color:var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
