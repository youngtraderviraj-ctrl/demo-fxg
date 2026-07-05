'use client'

import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Zap, ArrowUpRight, Sparkles } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, Line, CartesianGrid, XAxis, Tooltip, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Clients',
      value: '45',
      change: '+12%',
      trend: 'up',
      icon: Users,
      gradient: 'from-[#f0f6ff] to-[#cddfff]',
    },
    {
      title: 'Weekly Profit',
      value: '$12,500',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-[#e3efff] to-[#b7d4ff]',
    },
    {
      title: 'Fees Due',
      value: '$4,200',
      change: '-3.1%',
      trend: 'down',
      icon: DollarSign,
      gradient: 'from-[#d8e8ff] to-[#b3cffc]',
    },
    {
      title: 'Collection Rate',
      value: '66.4%',
      change: '+5.4%',
      trend: 'up',
      icon: Activity,
      gradient: 'from-[#dfeeff] to-[#bed8ff]',
    },
  ]

  const recentClients = [
    { name: 'John Doe', email: 'john@example.com', profit: 1250.50, split: 40, trend: 'up' },
    { name: 'Jane Smith', email: 'jane@example.com', profit: 2100.75, split: 45, trend: 'up' },
    { name: 'Mike Johnson', email: 'mike@example.com', profit: 890.25, split: 40, trend: 'up' },
    { name: 'David Brown', email: 'david@example.com', profit: 1560.00, split: 40, trend: 'up' },
  ]

  const recentActivity = [
    { action: 'MT5 Sync Completed', description: '45 accounts synced', time: '2 min ago', type: 'success' },
    { action: 'Invoice Generated', description: 'INV-2026-0045 for $450', time: '15 min ago', type: 'info' },
    { action: 'Payment Received', description: '$450 from John Doe', time: '1 hour ago', type: 'success' },
    { action: 'Report Sent', description: 'Weekly reports to 38 clients', time: '3 hours ago', type: 'success' },
  ]

  const revenueTrend = [
    { month: 'Jan', revenue: 32, fees: 12 },
    { month: 'Feb', revenue: 38, fees: 14 },
    { month: 'Mar', revenue: 41, fees: 16 },
    { month: 'Apr', revenue: 45, fees: 17 },
    { month: 'May', revenue: 48, fees: 18 },
    { month: 'Jun', revenue: 52, fees: 20 },
  ]

  const performanceTrend = [
    { client: 'Jane', rate: 78, growth: 24 },
    { client: 'David', rate: 72, growth: 18 },
    { client: 'Emily', rate: 84, growth: 28 },
    { client: 'Michael', rate: 69, growth: 16 },
    { client: 'Sara', rate: 76, growth: 22 },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold gradient-text">Welcome back, Admin!</h1>
            <p className="text-soft">Here's what's happening with your trading fund today</p>
          </div>
          <div className="hidden md:block">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent text-white shadow-xl animate-float">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-inner`}>
                  <Icon className="h-6 w-6 text-[color:var(--text-primary)]" />
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-white/40 text-[color:var(--text-primary)]`}
                >
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="mb-1 text-sm font-medium text-soft">{stat.title}</p>
              <h3 className="text-3xl font-bold text-[color:var(--text-primary)]">{stat.value}</h3>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Revenue Overview</h3>
            <button className="rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-soft">
              View All
            </button>
          </div>
          <div className="h-64 rounded-2xl bg-gradient-to-br from-white/40 to-transparent p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="90%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
                <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: 'rgba(255,255,255,0.85)' }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="fees" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass-card rounded-2xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Client Performance</h3>
            <button className="rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-soft">
              Details
            </button>
          </div>
          <div className="h-64 rounded-2xl bg-gradient-to-br from-white/40 to-transparent p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceTrend} barSize={18}>
                <CartesianGrid stroke="rgba(255,255,255,0.25)" vertical={false} strokeDasharray="2 6" />
                <XAxis dataKey="client" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: 'rgba(255,255,255,0.85)' }} />
                <Bar dataKey="rate" fill="var(--accent)" radius={[10, 10, 4, 4]} />
                <Line type="monotone" dataKey="growth" stroke="#0a1224" strokeWidth={2} dot={{ r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Clients & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Performers */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[color:var(--text-primary)]">Top Performers</h3>
            <button className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentClients.map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-white/40 bg-white/30 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-white font-bold text-lg shadow-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--text-primary)]">{client.name}</p>
                    <p className="text-sm text-soft">{client.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">${client.profit.toFixed(2)}</p>
                  <p className="text-sm text-soft">{client.split}% split</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="mb-6 text-xl font-bold text-[color:var(--text-primary)]">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/40"
                >
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">{activity.action}</p>
                  <p className="text-xs text-soft">{activity.description}</p>
                  <p className="mt-1 text-xs text-soft">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Add Client', icon: Users },
          { label: 'Generate Invoices', icon: DollarSign },
          { label: 'Sync MT5', icon: TrendingUp },
          { label: 'View Reports', icon: Activity },
        ].map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              className="glass-card rounded-2xl p-6 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-accent text-white shadow-lg group-hover:scale-110 transition-transform">
                <Icon className="h-8 w-8" />
              </div>
              <p className="text-center font-semibold text-[color:var(--text-primary)]">{action.label}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
