'use client'

import { useState } from 'react'
import { Copy, Check, QrCode, Send, MessageCircle, MousePointerClick, UserPlus, Users, Percent } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { toast } from 'sonner'
import { ibProfile, referralStats, referralTimeline } from '../mock-data'
import { AnimatedCounter } from '../shared'

const tooltipStyle = { borderRadius: 14, border: 'none', backgroundColor: 'rgba(10,18,36,0.92)', color: '#fff', fontSize: 12 }

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ibProfile.referralLink).catch(() => {})
    }
    setCopied(true)
    toast.success('Referral link copied')
    setTimeout(() => setCopied(false), 1800)
  }

  const stats = [
    { label: 'Clicks', value: referralStats.clicks, icon: MousePointerClick, suffix: '' },
    { label: 'Registrations', value: referralStats.registrations, icon: UserPlus, suffix: '' },
    { label: 'Active Clients', value: referralStats.activeClients, icon: Users, suffix: '' },
    { label: 'Conversion Rate', value: referralStats.conversionRate, icon: Percent, suffix: '%' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-soft">Growth</p>
        <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Referral Center</h1>
        <p className="text-sm text-soft">Share your link and grow your client network.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card relative overflow-hidden rounded-3xl p-6 lg:col-span-2">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-3xl" aria-hidden />
          <p className="text-xs uppercase tracking-[0.3em] text-soft">Your Referral Code</p>
          <p className="mt-2 text-3xl font-bold gradient-text">{ibProfile.referralCode}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border border-white/30 bg-white/20 px-4 py-3">
              <span className="truncate text-sm text-[color:var(--text-primary)]">{ibProfile.referralLink}</span>
            </div>
            <button
              onClick={copy}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => toast.success('QR generated (demo)')} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">
              <QrCode className="h-4 w-4" /> QR Code
            </button>
            <button onClick={() => toast.success('Shared via Telegram (demo)')} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">
              <Send className="h-4 w-4 text-sky-500" /> Telegram
            </button>
            <button onClick={() => toast.success('Shared via WhatsApp (demo)')} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30">
              <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp
            </button>
          </div>
        </div>

        <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-6">
          <div className="grid grid-cols-6 grid-rows-6 gap-1 rounded-2xl bg-white p-3 shadow-lg">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className={`h-3 w-3 rounded-[2px] ${(i * 7 + 3) % 3 === 0 ? 'bg-[#0a1224]' : 'bg-transparent'}`} />
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold text-[color:var(--text-primary)]">Scan to join</p>
          <p className="text-xs text-soft">{ibProfile.referralCode}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card hover-lift rounded-2xl p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-soft">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.suffix === '%' ? 1 : 0} />
              </p>
            </div>
          )
        })}
      </div>

      <div className="glass-card rounded-3xl p-5">
        <h3 className="mb-4 text-base font-semibold text-[color:var(--text-primary)]">Referral Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={referralTimeline} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12b76a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#12b76a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,169,204,0.2)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="week" stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} fontSize={12} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="clicks" stroke="var(--accent)" strokeWidth={3} fill="url(#clicks)" />
              <Area type="monotone" dataKey="signups" stroke="#12b76a" strokeWidth={3} fill="url(#signups)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
