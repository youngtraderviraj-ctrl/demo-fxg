'use client'

import { useState } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { toast } from 'sonner'
import { commissionGrowth, monthlyEarnings, clientGrowth, tradingVolume, currency } from '../mock-data'

const tooltipStyle = { borderRadius: 14, border: 'none', backgroundColor: 'rgba(10,18,36,0.92)', color: '#fff', fontSize: 12 }
const RANGES = ['7D', '30D', '90D', 'YTD', 'All'] as const

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold text-[color:var(--text-primary)]">{title}</h3>
      <div className="h-60">{children}</div>
    </div>
  )
}

export default function ReportsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>('90D')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-soft">Analytics</p>
            <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Reports</h1>
            <p className="text-sm text-soft">Deep dive into revenue, commissions and client growth.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    range === r ? 'bg-accent text-white shadow' : 'text-soft hover:text-[color:var(--text-primary)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button onClick={() => toast.success('PDF exported (demo)')} className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">
              <FileText className="h-4 w-4" /> PDF
            </button>
            <button onClick={() => toast.success('CSV exported (demo)')} className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={commissionGrowth} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
              <Area type="monotone" dataKey="commission" stroke="var(--accent)" strokeWidth={3} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Commission by Month">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyEarnings} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barSize={26}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} cursor={{ fill: 'rgba(148,169,204,0.1)' }} />
              <Bar dataKey="earnings" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Client Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clientGrowth} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="active" stroke="#12b76a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Trading Volume">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradingVolume} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barSize={22}>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={30} unit="M" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v}M`} cursor={{ fill: 'rgba(148,169,204,0.1)' }} />
              <Bar dataKey="volume" fill="#12b76a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Monthly Comparison">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={commissionGrowth} margin={{ top: 10, right: 8, left: -12, bottom: 0 }} barSize={18}>
            <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={44} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,169,204,0.1)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="commission" name="Commission" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="clients" name="Clients" fill="#f79009" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  )
}
