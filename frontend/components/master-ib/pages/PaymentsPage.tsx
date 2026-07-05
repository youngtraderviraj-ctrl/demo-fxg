'use client'

import { Wallet, Clock, CheckCircle2, ArrowDownToLine, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { WITHDRAWALS, commissionSummary, ibProfile, currency, currencyExact } from '../mock-data'
import { StatCard, StatusBadge } from '../shared'

export default function PaymentsPage() {
  const pending = WITHDRAWALS.filter((w) => w.status !== 'completed')
  const completed = WITHDRAWALS.filter((w) => w.status === 'completed')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-soft">Cashflow</p>
            <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Payments</h1>
            <p className="text-sm text-soft">Manage withdrawals and track payout history.</p>
          </div>
          <button
            onClick={() => toast.success('Withdrawal requested (demo)')}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            <ArrowDownToLine className="h-4 w-4" /> Request Withdrawal
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Available Balance" value={commissionSummary.paid} prefix="$" decimals={0} icon={Wallet} delay={0} />
        <StatCard title="Pending Withdrawals" value={pending.reduce((s, w) => s + w.amount, 0)} prefix="$" decimals={0} icon={Clock} delay={80} />
        <StatCard title="Completed" value={completed.reduce((s, w) => s + w.amount, 0)} prefix="$" decimals={0} icon={CheckCircle2} delay={160} />
      </div>

      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-soft">Payout Wallet</p>
            <p className="mt-1 font-mono text-sm text-[color:var(--text-primary)]">{ibProfile.wallet}</p>
          </div>
          <button
            onClick={() => toast.success('Wallet copied')}
            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="glass-card rounded-3xl p-5">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">Pending Withdrawals</h2>
          <div className="space-y-3">
            {pending.map((w) => (
              <div key={w.id} className="rounded-2xl border border-white/20 bg-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">{currencyExact(w.amount)}</p>
                    <p className="text-xs text-soft">{w.method} · {w.date}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {['Requested', 'Approved', 'Processing', 'Completed'].map((step, i) => {
                    const activeIdx = w.status === 'processing' ? 2 : 1
                    const done = i <= activeIdx
                    return (
                      <div key={step} className="flex flex-1 items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${done ? 'bg-accent' : 'bg-white/30'}`} />
                        <span className={`text-[11px] ${done ? 'text-[color:var(--text-primary)]' : 'text-soft'}`}>{step}</span>
                        {i < 3 && <div className={`h-0.5 flex-1 ${i < activeIdx ? 'bg-accent' : 'bg-white/20'}`} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="border-b border-white/15 px-5 py-4">
          <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-white/20">
              <tr>
                {['ID', 'Date', 'Amount', 'Method', 'Wallet', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-soft">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/15">
              {WITHDRAWALS.map((w) => (
                <tr key={w.id} className="transition hover:bg-white/20">
                  <td className="px-5 py-3 font-mono text-xs text-soft">{w.id}</td>
                  <td className="px-5 py-3 text-sm text-soft">{w.date}</td>
                  <td className="px-5 py-3 text-sm font-bold text-[color:var(--text-primary)]">{currency(w.amount)}</td>
                  <td className="px-5 py-3 text-sm text-[color:var(--text-primary)]">{w.method}</td>
                  <td className="px-5 py-3 font-mono text-xs text-soft">{w.wallet}</td>
                  <td className="px-5 py-3"><StatusBadge status={w.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
