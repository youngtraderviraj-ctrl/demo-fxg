'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CalendarDays, CalendarRange, Clock, CheckCircle2, Trophy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { COMMISSION_HISTORY, commissionSummary, currencyExact } from '../mock-data'
import { StatCard, StatusBadge } from '../shared'

const FILTERS = ['all', 'paid', 'pending'] as const

export default function CommissionsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')

  const rows = useMemo(
    () => COMMISSION_HISTORY.filter((r) => filter === 'all' || r.status === filter),
    [filter]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-soft">Earnings</p>
        <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Commissions</h1>
        <p className="text-sm text-soft">Track your commission earnings across all timeframes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Today" value={commissionSummary.today} prefix="$" decimals={0} icon={CalendarClock} delay={0} />
        <StatCard title="Weekly" value={commissionSummary.weekly} prefix="$" decimals={0} icon={CalendarDays} delay={60} />
        <StatCard title="Monthly" value={commissionSummary.monthly} prefix="$" decimals={0} icon={CalendarRange} delay={120} />
        <StatCard title="Pending" value={commissionSummary.pending} prefix="$" decimals={0} icon={Clock} delay={180} />
        <StatCard title="Paid" value={commissionSummary.paid} prefix="$" decimals={0} icon={CheckCircle2} delay={240} />
        <StatCard title="Lifetime" value={commissionSummary.lifetime} prefix="$" decimals={0} icon={Trophy} delay={300} />
      </div>

      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-soft">History</p>
            <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Commission History</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filter === f ? 'bg-accent text-white shadow' : 'text-soft hover:text-[color:var(--text-primary)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => toast.success('CSV exported (demo)')}
              className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead className="bg-white/20">
              <tr>
                {['Date', 'Client', 'Amount', 'Status', 'Transaction ID'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15">
              {rows.map((r) => (
                <tr key={r.id} className="transition hover:bg-white/20">
                  <td className="px-5 py-3 text-sm text-soft">{r.date}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-[color:var(--text-primary)]">{r.client}</td>
                  <td className="px-5 py-3 text-sm font-bold text-accent">{currencyExact(r.amount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-soft">{r.txId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
