'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { CLIENTS, IBClient, ClientStatus, currency } from '../mock-data'
import { Avatar, StatusBadge, EmptyState } from '../shared'
import ClientDrawer from '../ClientDrawer'

const PAGE_SIZE = 8
const FILTERS: { id: ClientStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'inactive', label: 'Inactive' },
]

export default function ClientsPage({ globalSearch }: { globalSearch: string }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<IBClient | null>(null)

  const search = (globalSearch || query).toLowerCase()

  const filtered = useMemo(() => {
    return CLIENTS.filter((c) => {
      const matchQuery = !search || c.name.toLowerCase().includes(search) || c.account.includes(search) || c.email.toLowerCase().includes(search)
      const matchFilter = filter === 'all' || c.status === filter
      return matchQuery && matchFilter
    })
  }, [search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-soft">Network</p>
            <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">My Clients</h1>
            <p className="text-sm text-soft">{filtered.length} clients in your network</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search name / account"
                className="w-56 rounded-full border border-white/30 bg-white/20 py-2 pl-10 pr-4 text-sm text-[color:var(--text-primary)] placeholder:text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1">
              <SlidersHorizontal className="ml-2 h-4 w-4 text-soft" />
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setPage(1) }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f.id ? 'bg-accent text-white shadow' : 'text-soft hover:text-[color:var(--text-primary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-3xl">
        {rows.length === 0 ? (
          <div className="p-6"><EmptyState title="No clients found" description="Try adjusting your search or filters to find clients in your network." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="sticky top-0 bg-white/30 backdrop-blur">
                <tr>
                  {['Client', 'Account', 'Broker', 'Status', 'Equity', 'Profit', 'Last Active', 'Payment', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-soft">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15">
                {rows.map((c) => (
                  <tr key={c.id} className="cursor-pointer transition hover:bg-white/20" onClick={() => setSelected(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} color={c.avatarColor} size={36} />
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--text-primary)]">{c.name}</p>
                          <p className="text-xs text-soft">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-soft">{c.account}</td>
                    <td className="px-4 py-3 text-sm text-[color:var(--text-primary)]">{c.broker}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-sm font-semibold text-[color:var(--text-primary)]">{currency(c.equity)}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${c.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{currency(c.profit)}</td>
                    <td className="px-4 py-3 text-sm text-soft">{c.lastActive}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(c) }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20 text-soft transition hover:text-accent"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/15 px-4 py-3">
            <p className="text-xs text-soft">Showing {(current - 1) * PAGE_SIZE + 1}-{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20 text-soft transition hover:bg-white/30 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-[color:var(--text-primary)]">{current} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-white/20 text-soft transition hover:bg-white/30 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ClientDrawer client={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
