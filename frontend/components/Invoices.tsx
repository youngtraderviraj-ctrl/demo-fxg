'use client'

import { useState } from 'react'
import { FileText, Plus, Download, Send, Check, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function Invoices() {
  const invoices = [
    { id: 1, number: 'INV-2026-0045', client: 'John Doe', amount: 500.20, period: 'Jun 24 - Jun 30', dueDate: 'Jul 07', status: 'paid', paidDate: 'Jul 05' },
    { id: 2, number: 'INV-2026-0044', client: 'Jane Smith', amount: 945.34, period: 'Jun 24 - Jun 30', dueDate: 'Jul 07', status: 'pending', paidDate: null },
    { id: 3, number: 'INV-2026-0043', client: 'Mike Johnson', amount: 356.10, period: 'Jun 24 - Jun 30', dueDate: 'Jul 07', status: 'pending', paidDate: null },
    { id: 4, number: 'INV-2026-0042', client: 'David Brown', amount: 624.00, period: 'Jun 17 - Jun 23', dueDate: 'Jun 30', status: 'overdue', paidDate: null },
    { id: 5, number: 'INV-2026-0041', client: 'Emily Davis', amount: 1600.25, period: 'Jun 17 - Jun 23', dueDate: 'Jun 30', status: 'paid', paidDate: 'Jun 28' },
  ]

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-soft">Finance</p>
          <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">Invoices</h2>
          <p className="mt-1 text-soft">Manage billing and invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-full">
            <Download size={16} />
            Export
          </Button>
          <Button className="gap-2 rounded-full">
            <Plus size={16} />
            Generate Weekly
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Invoiced', value: `$${stats.total.toFixed(2)}`, detail: `${invoices.length} invoices` },
          { label: 'Paid', value: `$${stats.paid.toFixed(2)}`, detail: `${invoices.filter(i => i.status === 'paid').length} invoices` },
          { label: 'Pending', value: `$${stats.pending.toFixed(2)}`, detail: `${invoices.filter(i => i.status === 'pending').length} invoices` },
          { label: 'Overdue', value: `$${stats.overdue.toFixed(2)}`, detail: `${invoices.filter(i => i.status === 'overdue').length} invoices` },
        ].map((stat) => (
          <Card key={stat.label} className="surface-card">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-soft">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/20 bg-white/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.4em] text-soft">
                    Due Date
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-white/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <span className="font-mono text-sm font-medium text-[color:var(--text-primary)]">
                          {invoice.number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[color:var(--text-primary)]">{invoice.client}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-soft">{invoice.period}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[color:var(--text-primary)]">${invoice.amount.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-soft">{invoice.dueDate}</p>
                      {invoice.paidDate && (
                        <p className="text-xs text-accent">Paid: {invoice.paidDate}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]"
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1 rounded-full">
                          <Download size={14} />
                          PDF
                        </Button>
                        {invoice.status !== 'paid' && (
                          <Button variant="outline" size="sm" className="gap-1 rounded-full">
                            <Send size={14} />
                            Remind
                          </Button>
                        )}
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
