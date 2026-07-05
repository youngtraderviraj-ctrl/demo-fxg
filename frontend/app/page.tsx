'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/DashboardNew'
import Clients from '@/components/Clients'
import Invoices from '@/components/Invoices'
import MT5Sync from '@/components/MT5Sync'
import Telegram from '@/components/Telegram'
import { useTheme } from '@/context/ThemeContext'

const commandStats = [
  {
    label: 'Assets Managed',
    value: '$38.4M',
    delta: '+4.2% this week',
  },
  {
    label: 'Live Accounts',
    value: '45',
    delta: '100% connectivity',
  },
  {
    label: 'Collections',
    value: '$8.3M',
    delta: 'On track',
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme, toggleTheme } = useTheme()

  const pageTitle = useMemo(() => {
    const map: Record<string, string> = {
      dashboard: 'Alpha Command Center',
      clients: 'Client Intelligence',
      invoices: 'Billing & Collections',
      mt5: 'MT5 Synchronization',
      telegram: 'Telegram Broadcasts',
      analytics: 'Performance Analytics',
      payments: 'Payments',
      notifications: 'Notifications',
      settings: 'Controls & Settings',
    }

    return map[activeTab] ?? 'Alpha Command Center'
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'analytics':
        return <Dashboard />
      case 'clients':
        return <Clients />
      case 'invoices':
      case 'payments':
        return <Invoices />
      case 'mt5':
        return <MT5Sync />
      case 'telegram':
      case 'notifications':
        return <Telegram />
      case 'settings':
        return (
          <div className="glass-card rounded-3xl p-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent shadow-2xl">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-semibold text-[color:var(--text-primary)]">Controls Coming Soon</h2>
            <p className="mt-4 text-soft">
              Advanced configuration tools are almost ready. Automation, compliance and reporting will land here.
            </p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 blur-3xl" aria-hidden />

      <div className="relative z-10 flex min-h-[calc(100vh-48px)] gap-6">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 lg:ml-80 xl:ml-[22rem]">
          <div className="mx-auto max-w-6xl space-y-8 pb-12">
            <section className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-white/20 to-white/0 blur-3xl" aria-hidden />
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-soft">FXG / Alpha Suite</p>
                  <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)] sm:text-5xl">
                    {pageTitle}
                  </h1>
                  <p className="mt-3 max-w-2xl text-base text-soft">
                    Air-light gradients, instant telemetry and perfect contrast. Monitor funds, accounts and communications with a single glance.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/10"
                  >
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                  <button className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-xl transition hover:opacity-90">
                    Launch Action
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {commandStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/40 bg-white/30 p-4 text-[color:var(--text-primary)] shadow-inner shadow-white/20">
                    <p className="text-xs uppercase tracking-[0.3em] text-soft">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-soft">{stat.delta}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent shadow-2xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-soft">Signal Clarity</p>
                    <p className="text-2xl font-semibold text-[color:var(--text-primary)]">0.2s latency</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-soft">Synchronized feeds from MT5 and Telegram stay polished even during peak volatility.</p>
              </div>
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[color:var(--text-primary)] shadow-inner">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-soft">Compliance Shield</p>
                    <p className="text-2xl font-semibold text-[color:var(--text-primary)]">24/7</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-soft">Unified audit logs for every sync, invoice and client notice, styled for clarity.</p>
              </div>
            </section>

            <section className="glass-card rounded-3xl p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-soft">Live Module</p>
                  <h2 className="text-2xl font-semibold text-[color:var(--text-primary)]">{pageTitle}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['dashboard', 'clients', 'invoices', 'mt5', 'telegram'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                        activeTab === tab ? 'bg-accent text-white shadow-lg' : 'chip-muted text-soft'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {renderContent()}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

