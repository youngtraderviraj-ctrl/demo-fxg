'use client'

import { FileText, Download, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

export default function ClientInvoices() {
  const invoices = [
    { id: 1, number: 'INV-2026-0045', amount: 945.34, period: 'Jun 24 - Jun 30', dueDate: 'Jul 07, 2026', status: 'pending', profit: 2100.75 },
    { id: 2, number: 'INV-2026-0038', amount: 850.20, period: 'Jun 17 - Jun 23', dueDate: 'Jun 30, 2026', status: 'paid', profit: 1889.33, paidDate: 'Jun 28, 2026' },
    { id: 3, number: 'INV-2026-0031', amount: 720.50, period: 'Jun 10 - Jun 16', dueDate: 'Jun 23, 2026', status: 'paid', profit: 1601.11, paidDate: 'Jun 21, 2026' },
    { id: 4, number: 'INV-2026-0024', amount: 680.00, period: 'Jun 03 - Jun 09', dueDate: 'Jun 16, 2026', status: 'paid', profit: 1511.11, paidDate: 'Jun 14, 2026' },
  ]

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-soft">Billing</p>
        <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">My Invoices</h2>
        <p className="mt-1 text-soft">View and manage your billing invoices</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {[
          { label: 'Total Invoiced', value: `$${stats.total.toFixed(2)}`, detail: `${invoices.length} invoices` },
          { label: 'Paid', value: `$${stats.paid.toFixed(2)}`, detail: `${invoices.filter(i => i.status === 'paid').length} invoices` },
          { label: 'Pending', value: `$${stats.pending.toFixed(2)}`, detail: `${invoices.filter(i => i.status === 'pending').length} invoice` },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card border-none">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-soft">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="glass-card border-none">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white/60 p-3 text-[color:var(--text-primary)]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-lg font-semibold text-[color:var(--text-primary)]">
                        {invoice.number}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/40 px-3 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-soft">Period: {invoice.period}</p>
                    <p className="text-sm text-soft">
                      Due Date: {invoice.dueDate}
                      {invoice.paidDate && (
                        <span className="ml-2 text-accent">• Paid on {invoice.paidDate}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-soft">Weekly Profit</p>
                    <p className="text-lg font-semibold text-accent">
                      ${invoice.profit.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-soft">Performance Fee (45%)</p>
                    <p className="text-2xl font-bold text-[color:var(--text-primary)]">${invoice.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 rounded-full">
                      <Download size={14} />
                      PDF
                    </Button>
                    {invoice.status === 'pending' && (
                      <Button size="sm" className="gap-2 rounded-full">
                        <CreditCard size={14} />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[color:var(--text-primary)]">TRON Wallet Address (TRC20 USDT)</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white/70 px-4 py-3 font-mono text-sm text-[color:var(--text-primary)]">
                  TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
                </code>
                <Button variant="outline" size="sm" className="rounded-full">Copy</Button>
              </div>
            </div>
            <div className="rounded-lg bg-white/70 p-4">
              <p className="text-sm text-[color:var(--text-primary)]/70">
                <strong>Note:</strong> Please send the exact invoice amount in USDT (TRC20) to the wallet address above. 
                Payment will be automatically verified within 5-10 minutes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
