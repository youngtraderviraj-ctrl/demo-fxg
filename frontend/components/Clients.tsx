'use client'

import { useState } from 'react'
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const clients = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', mt5: '12345678', status: 'active', profit: 1250.50, split: 40, balance: 10000, equity: 10500 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', mt5: '87654321', status: 'active', profit: 2100.75, split: 45, balance: 15000, equity: 15800 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', mt5: '11223344', status: 'active', profit: 890.25, split: 40, balance: 8000, equity: 8450 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1234567893', mt5: '44332211', status: 'suspended', profit: 0, split: 35, balance: 5000, equity: 5000 },
    { id: 5, name: 'David Brown', email: 'david@example.com', phone: '+1234567894', mt5: '55667788', status: 'active', profit: 1560.00, split: 40, balance: 12000, equity: 12800 },
    { id: 6, name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567895', mt5: '99887766', status: 'active', profit: 3200.50, split: 50, balance: 20000, equity: 21500 },
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-soft">Operations</p>
          <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">Clients</h2>
          <p className="mt-1 text-soft">Manage your trading clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-full">
            <Upload size={16} />
            Import
          </Button>
          <Button variant="outline" className="gap-2 rounded-full">
            <Download size={16} />
            Export
          </Button>
          <Button className="gap-2 rounded-full">
            <Plus size={16} />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Clients', value: clients.length },
          { label: 'Active', value: clients.filter(c => c.status === 'active').length },
          { label: 'Suspended', value: clients.filter(c => c.status === 'suspended').length },
          { label: 'Total Balance', value: `$${clients.reduce((sum, c) => sum + c.balance, 0).toLocaleString()}` },
        ].map((stat, idx) => (
          <Card key={stat.label} className="surface-card">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/40 py-2 pl-10 pr-4 text-[color:var(--text-primary)] placeholder:text-soft focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-2xl border border-white/20 bg-white/40 px-4 py-2 text-[color:var(--text-primary)] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline" className="gap-2 rounded-full">
                <Filter size={16} />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20 bg-white/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    MT5 Account
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Equity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Profit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Split
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 bg-white/20">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="transition-colors hover:bg-white/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white font-semibold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[color:var(--text-primary)]">{client.name}</p>
                          <p className="text-sm text-soft">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-[color:var(--text-primary)]">{client.mt5}</p>
                      <p className="text-xs text-soft">{client.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[color:var(--text-primary)]">${client.balance.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[color:var(--text-primary)]">${client.equity.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-accent">${client.profit.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="chip-muted rounded-full px-3 py-1 text-sm font-semibold">
                        {client.split}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-full border border-white/30 p-2 text-[color:var(--text-primary)] hover:bg-white/20">
                          <Eye size={16} />
                        </button>
                        <button className="rounded-full border border-white/30 p-2 text-[color:var(--text-primary)] hover:bg-white/20">
                          <Edit size={16} />
                        </button>
                        <button className="rounded-full border border-white/30 p-2 text-[color:var(--text-primary)] hover:bg-white/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
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
