'use client'

import { useState } from 'react'
import { Wallet, UserPlus, DollarSign, Settings, Check } from 'lucide-react'
import { NOTIFICATIONS, NotificationItem } from '../mock-data'
import { EmptyState } from '../shared'

const iconMap = {
  payment: Wallet,
  client: UserPlus,
  commission: DollarSign,
  system: Settings,
}

const toneMap = {
  payment: 'text-sky-500 bg-sky-500/15',
  client: 'text-emerald-500 bg-emerald-500/15',
  commission: 'text-violet-500 bg-violet-500/15',
  system: 'text-amber-500 bg-amber-500/15',
}

const TABS = ['all', 'unread', 'payment', 'client', 'commission'] as const

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS)
  const [tab, setTab] = useState<(typeof TABS)[number]>('all')

  const filtered = items.filter((n) => {
    if (tab === 'all') return true
    if (tab === 'unread') return !n.read
    return n.type === tab
  })

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  const toggle = (id: string) => setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-soft">Activity</p>
            <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Notifications</h1>
            <p className="text-sm text-soft">{items.filter((n) => !n.read).length} unread notifications</p>
          </div>
          <button onClick={markAll} className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">
            <Check className="h-4 w-4" /> Mark all read
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                tab === t ? 'bg-accent text-white shadow' : 'text-soft hover:text-[color:var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="All caught up" description="You have no notifications in this category right now." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = iconMap[n.type]
            return (
              <button
                key={n.id}
                onClick={() => toggle(n.id)}
                className={`glass-card flex w-full items-start gap-4 rounded-2xl p-4 text-left transition hover:bg-white/20 ${
                  n.read ? 'opacity-70' : ''
                }`}
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${toneMap[n.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[color:var(--text-primary)]">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </div>
                  <p className="text-sm text-soft">{n.message}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-soft">{n.time}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
