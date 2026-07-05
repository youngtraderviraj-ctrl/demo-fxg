'use client'

import { X, Mail, Send, Wallet, TrendingUp, Calendar, Percent } from 'lucide-react'
import { IBClient, paymentHistory, currencyExact } from './mock-data'
import { Avatar, StatusBadge, Badge } from './shared'

interface Props {
  client: IBClient | null
  onClose: () => void
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/15 py-2.5 last:border-0">
      <span className="text-sm text-soft">{label}</span>
      <span className="text-sm font-semibold text-[color:var(--text-primary)]">{value}</span>
    </div>
  )
}

export default function ClientDrawer({ client, onClose }: Props) {
  const open = !!client

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform overflow-y-auto transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="min-h-full bg-[var(--app-bg)] p-6">
          {client && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={client.name} color={client.avatarColor} size={52} />
                  <div>
                    <h2 className="text-xl font-bold text-[color:var(--text-primary)]">{client.name}</h2>
                    <p className="text-sm text-soft">{client.id}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-[color:var(--text-primary)] transition hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusBadge status={client.status} />
                <StatusBadge status={client.paymentStatus} />
                <Badge tone="purple">{client.broker}</Badge>
              </div>

              <div className="glass-card rounded-2xl p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-soft">Personal Details</p>
                <Row label={<span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>} value={client.email} />
                <Row label={<span className="flex items-center gap-2"><Send className="h-4 w-4" /> Telegram</span>} value={client.telegram} />
                <Row label={<span className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Wallet</span>} value={<span className="font-mono text-xs">{client.wallet}</span>} />
                <Row label={<span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Registered</span>} value={client.registered} />
              </div>

              <div className="glass-card rounded-2xl p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-soft">Trading Performance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/20 bg-white/20 p-3">
                    <p className="text-xs text-soft">Current Equity</p>
                    <p className="mt-1 text-lg font-bold text-[color:var(--text-primary)]">{currencyExact(client.equity)}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/20 p-3">
                    <p className="text-xs text-soft">Total Profit</p>
                    <p className={`mt-1 text-lg font-bold ${client.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{currencyExact(client.profit)}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/20 p-3">
                    <p className="text-xs text-soft">Weekly Profit</p>
                    <p className={`mt-1 text-lg font-bold ${client.weeklyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{currencyExact(client.weeklyProfit)}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/20 p-3">
                    <p className="text-xs text-soft">Monthly Profit</p>
                    <p className={`mt-1 text-lg font-bold ${client.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{currencyExact(client.monthlyProfit)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-accent"><Percent className="h-4 w-4" /> Performance Fee (20%)</span>
                  <span className="text-lg font-bold text-accent">{currencyExact(client.performanceFee)}</span>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-soft">Payment History</p>
                  <TrendingUp className="h-4 w-4 text-soft" />
                </div>
                {paymentHistory.map((p, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/15 py-2.5 last:border-0">
                    <span className="text-sm text-soft">{p.date}</span>
                    <span className="text-sm font-semibold text-[color:var(--text-primary)]">{currencyExact(p.amount)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">Send Invoice</button>
                <button className="flex-1 rounded-xl border border-white/30 bg-white/20 py-2.5 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">Message</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
