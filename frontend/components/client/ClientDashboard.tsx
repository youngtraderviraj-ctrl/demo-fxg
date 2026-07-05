'use client'

import { TrendingUp, Activity, DollarSign, Shield, BarChart3, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, XAxis, Tooltip } from 'recharts'

export default function ClientDashboard() {
  const accountData = {
    balance: 15000.0,
    equity: 15800.5,
    profit: 800.5,
    margin: 1500.0,
    freeMargin: 14300.5,
    marginLevel: 1053.37,
  }

  const weeklyPerformance = [
    { week: 'Week 1', profit: 450.25, trades: 12, winRate: 75 },
    { week: 'Week 2', profit: 680.5, trades: 15, winRate: 80 },
    { week: 'Week 3', profit: 320.75, trades: 10, winRate: 70 },
    { week: 'Week 4', profit: 890.3, trades: 18, winRate: 83 },
  ]

  const equityHistory = [
    { label: 'Mon', balance: 14500, equity: 14920 },
    { label: 'Tue', balance: 14680, equity: 15010 },
    { label: 'Wed', balance: 14720, equity: 15080 },
    { label: 'Thu', balance: 14860, equity: 15520 },
    { label: 'Fri', balance: 15000, equity: 15800 },
  ]

  const recentTrades = [
    { id: 1, pair: 'EUR/USD', type: 'Buy', volume: 0.5, openPrice: 1.0850, closePrice: 1.0875, profit: 125.0, date: '2 hours ago' },
    { id: 2, pair: 'GBP/USD', type: 'Sell', volume: 0.3, openPrice: 1.2650, closePrice: 1.2630, profit: 60.0, date: '5 hours ago' },
    { id: 3, pair: 'USD/JPY', type: 'Buy', volume: 0.4, openPrice: 149.5, closePrice: 149.8, profit: 120.0, date: '1 day ago' },
    { id: 4, pair: 'AUD/USD', type: 'Sell', volume: 0.6, openPrice: 0.6750, closePrice: 0.6780, profit: -180.0, date: '1 day ago' },
  ]

  const quickStats = [
    { label: 'Total Trades', value: '55', icon: BarChart3 },
    { label: 'Win Rate', value: '77%', icon: TrendingUp },
    { label: 'Total Profit', value: '$2,341', icon: Activity },
    { label: 'Your Share', value: '$1,053', icon: DollarSign },
  ]

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-3xl p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-soft">Client portal</p>
            <h1 className="mt-3 text-4xl font-semibold text-[color:var(--text-primary)]">Welcome back, Jane!</h1>
            <p className="mt-3 max-w-2xl text-soft">Your managed account is fully synced. Monitor capital, payouts, and signals from a single glass dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-[color:var(--text-primary)]">Download statement</button>
            <button className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-lg">Request payout</button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Managed Balance', value: `$${accountData.balance.toLocaleString()}` },
            { label: 'Weekly Profit', value: '+$3,215' },
            { label: 'Next Payout', value: 'Jul 08, 2026' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/30 bg-white/30 p-4 text-[color:var(--text-primary)] shadow-inner shadow-white/30">
              <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[ 
          { title: 'Balance', value: `$${accountData.balance.toLocaleString()}`, sub: 'Current balance', icon: DollarSign },
          { title: 'Equity', value: `$${accountData.equity.toLocaleString()}`, sub: `+${accountData.profit.toFixed(2)} today`, icon: Wallet },
          { title: 'Margin Level', value: `${accountData.marginLevel.toFixed(0)}%`, sub: 'Healthy', icon: Activity },
          { title: 'Free Margin', value: `$${accountData.freeMargin.toLocaleString()}`, sub: 'Available capital', icon: Shield },
        ].map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title} className="glass-card border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-soft">{metric.title}</p>
                    <p className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">{metric.value}</p>
                    <p className="text-sm text-soft">{metric.sub}</p>
                  </div>
                  <div className="rounded-2xl bg-white/60 p-3 text-[color:var(--text-primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly performance</span>
              <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-soft">Live</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPerformance} margin={{ left: -10, right: 0 }}>
                <defs>
                  <linearGradient id="clientProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                <XAxis dataKey="week" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }} />
                <Area type="monotone" dataKey="profit" stroke="var(--accent)" strokeWidth={3} fill="url(#clientProfit)" />
                <Line type="monotone" dataKey="winRate" stroke="#0a1224" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle>Equity & balance drift</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityHistory} margin={{ left: -10, right: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.25)" strokeDasharray="2 6" />
                <XAxis dataKey="label" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }} />
                <Line type="monotone" dataKey="balance" stroke="#0f172a" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="equity" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Recent trades</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20 bg-white/30">
                <tr>
                  {[ 'Pair', 'Type', 'Volume', 'Open', 'Close', 'P/L', 'Time' ].map((label) => (
                    <th key={label} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15 bg-white/15">
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="transition hover:bg-white/25">
                    <td className="px-6 py-4 font-semibold text-[color:var(--text-primary)]">{trade.pair}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trade.type === 'Buy' ? 'bg-white/60 text-[color:var(--text-primary)]' : 'bg-black/20 text-white'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{trade.volume}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{trade.openPrice}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{trade.closePrice}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${trade.profit >= 0 ? 'text-accent' : 'text-red-500'}`}>
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-soft">{trade.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="glass-card border-none text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-[color:var(--text-primary)]">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-soft">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
