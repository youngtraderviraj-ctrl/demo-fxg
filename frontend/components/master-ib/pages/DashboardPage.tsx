'use client'

import {
  Users, UserCheck, Wallet, CalendarDays, Trophy, Clock,
  Link2, Share2, Download, ArrowUpRight, Activity,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts'
import { toast } from 'sonner'
import {
  dashboardStats, commissionGrowth, monthlyEarnings, clientGrowth, tradingVolume,
  CLIENTS, COMMISSION_HISTORY, currency, currencyExact,
} from '../mock-data'
import { StatCard, SectionHeader, Avatar, StatusBadge, Badge } from '../shared'

const tooltipStyle = { borderRadius: 14, border: 'none', backgroundColor: 'rgba(10,18,36,0.92)', color: '#fff', fontSize: 12 }

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
        <Badge tone="blue">Live</Badge>
      </div>
      <div className="h-56">{children}</div>
    </div>
  )
}

const quickActions = [
  { label: 'Generate Referral Link', icon: Link2 },
  { label: 'Share Referral Link', icon: Share2 },
  { label: 'Request Withdrawal', icon: Wallet },
  { label: 'Download Report', icon: Download },
]

export default function DashboardPage() {
  const latestClients = [...CLIENTS].slice(-4).reverse()
  const latestPayments = COMMISSION_HISTORY.slice(0, 4)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl" aria-hidden />
        <p className="text-xs uppercase tracking-[0.35em] text-soft">Master IB / Overview</p>
        <h1 className="mt-2 text-3xl font-bold gradient-text sm:text-4xl">Welcome back, Alexander</h1>
        <p className="mt-2 max-w-xl text-soft">Your network is performing well. Here is a snapshot of clients, commissions and payouts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Clients" value={dashboardStats.totalClients} icon={Users} change="+12%" trend="up" delay={0} />
        <StatCard title="Active Clients" value={dashboardStats.activeClients} icon={UserCheck} change="+6%" trend="up" delay={60} />
        <StatCard title="This Week" value={dashboardStats.weekCommission} prefix="$" decimals={0} icon={CalendarDays} change="+8.2%" trend="up" delay={120} />
        <StatCard title="This Month" value={dashboardStats.monthCommission} prefix="$" decimals={0} icon={Wallet} change="+14%" trend="up" delay={180} />
        <StatCard title="Lifetime" value={dashboardStats.lifetimeCommission} prefix="$" decimals={0} icon={Trophy} change="+2.4%" trend="up" delay={240} />
        <StatCard title="Pending Payout" value={dashboardStats.pendingPayout} prefix="$" decimals={0} icon={Clock} change="-3.1%" trend="down" delay={300} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Commission Growth">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commissionGrowth} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
              <Area type="monotone" dataKey="commission" stroke="var(--accent)" strokeWidth={3} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Earnings">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyEarnings} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barSize={26}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} cursor={{ fill: 'rgba(148,169,204,0.1)' }} />
              <Bar dataKey="earnings" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Client Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientGrowth} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="active" stroke="#12b76a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trading Volume (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradingVolume} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barSize={22}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={30} unit="M" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} cursor={{ fill: 'rgba(148,169,204,0.1)' }} />
              <Bar dataKey="volume" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <SectionHeader
            eyebrow="Network"
            title="Latest Joined Clients"
            action={<button className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">View all <ArrowUpRight className="h-4 w-4" /></button>}
          />
          <div className="space-y-3">
            {latestClients.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/20 p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} color={c.avatarColor} />
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">{c.name}</p>
                    <p className="text-xs text-soft">{c.broker} · {c.registered}</p>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <SectionHeader eyebrow="Money" title="Latest Payments" />
          <div className="space-y-3">
            {latestPayments.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/30 text-accent">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{p.client}</p>
                  <p className="text-xs text-soft">{p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[color:var(--text-primary)]">{currencyExact(p.amount)}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon
          return (
            <button
              key={a.label}
              onClick={() => toast.success(`${a.label} (demo)`)}
              className="glass-card hover-lift group flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white shadow-lg transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">{a.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
