'use client'

import { RefreshCw, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function MT5Sync() {
  const syncHistory = [
    { id: 1, time: '2 min ago', accounts: 45, success: 45, failed: 0, duration: '2.3s', status: 'success' },
    { id: 2, time: '12 min ago', accounts: 45, success: 44, failed: 1, duration: '3.1s', status: 'partial' },
    { id: 3, time: '22 min ago', accounts: 45, success: 45, failed: 0, duration: '2.8s', status: 'success' },
    { id: 4, time: '32 min ago', accounts: 45, success: 45, failed: 0, duration: '2.5s', status: 'success' },
  ]

  const accounts = [
    { client: 'John Doe', mt5: '12345678', balance: 10000, equity: 10500, profit: 500, margin: 1000, status: 'synced' },
    { client: 'Jane Smith', mt5: '87654321', balance: 15000, equity: 15800, profit: 800, margin: 1500, status: 'synced' },
    { client: 'Mike Johnson', mt5: '11223344', balance: 8000, equity: 8450, profit: 450, margin: 800, status: 'synced' },
    { client: 'David Brown', mt5: '55667788', balance: 12000, equity: 12800, profit: 800, margin: 1200, status: 'synced' },
    { client: 'Emily Davis', mt5: '99887766', balance: 20000, equity: 21500, profit: 1500, margin: 2000, status: 'synced' },
  ]

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-soft">Infrastructure</p>
            <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">MT5 Synchronization</h2>
            <p className="text-soft mt-1">Monitor and sync MT5 accounts</p>
          </div>
          <Button className="gap-2 rounded-full">
            <RefreshCw size={16} />
            Sync All Accounts
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Last Sync', value: '2 min ago', Icon: CheckCircle },
          { label: 'Total Accounts', value: '45', Icon: TrendingUp },
          { label: 'Success Rate', value: '100%', Icon: CheckCircle },
          { label: 'Avg Duration', value: '2.6s', Icon: Clock },
        ].map((stat, idx) => {
          const Icon = stat.Icon
          return (
            <Card key={idx} className="glass-card border-none">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
                </div>
                <Icon className="h-10 w-10 text-[color:var(--text-primary)]" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncHistory.map((sync) => (
              <div
                key={sync.id}
                className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/20 bg-white/20 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-[color:var(--text-primary)]">
                    {sync.status === 'success' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--text-primary)]">Sync completed</p>
                    <p className="text-sm text-soft">{sync.time}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-soft">
                  <div>
                    <p>Accounts</p>
                    <p className="font-semibold text-[color:var(--text-primary)]">{sync.accounts}</p>
                  </div>
                  <div>
                    <p>Success</p>
                    <p className="font-semibold text-accent">{sync.success}</p>
                  </div>
                  <div>
                    <p>Failed</p>
                    <p className="font-semibold text-red-400">{sync.failed}</p>
                  </div>
                  <div>
                    <p>Duration</p>
                    <p className="font-semibold text-[color:var(--text-primary)]">{sync.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Account Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20 bg-white/30">
                <tr>
                  {['Client', 'MT5 Account', 'Balance', 'Equity', 'Profit', 'Margin', 'Status'].map((label) => (
                    <th key={label} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/15 bg-white/15">
                {accounts.map((account, index) => (
                  <tr key={index} className="transition hover:bg-white/25">
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">{account.client}</td>
                    <td className="px-6 py-4 font-mono text-sm text-[color:var(--text-primary)]">{account.mt5}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">${account.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">${account.equity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-accent">+${account.profit}</td>
                    <td className="px-6 py-4 text-[color:var(--text-primary)]">${account.margin.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                        <CheckCircle size={12} />
                        {account.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
