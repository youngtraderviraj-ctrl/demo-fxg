'use client'

import { useEffect, useRef, useState } from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Inbox } from 'lucide-react'

type Tone = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'neutral'

const toneStyles: Record<Tone, string> = {
  green: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  red: 'bg-rose-500/15 text-rose-500 border-rose-500/25',
  yellow: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
  blue: 'bg-sky-500/15 text-sky-500 border-sky-500/25',
  purple: 'bg-violet-500/15 text-violet-500 border-violet-500/25',
  neutral: 'chip-muted',
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    active: 'green',
    inactive: 'red',
    pending: 'yellow',
    paid: 'blue',
    overdue: 'red',
    completed: 'green',
    processing: 'yellow',
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Badge tone={map[status] ?? 'neutral'}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  )
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const duration = 900
          const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setDisplay(value * eased)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

export interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  change?: string
  trend?: 'up' | 'down'
  icon: LucideIcon
  delay?: number
}

export function StatCard({ title, value, prefix, suffix, decimals, change, trend, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <div
      className="glass-card hover-lift rounded-2xl p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-lg">
          <Icon className="h-5 w-5" />
        </div>
        {change && (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend === 'down' ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'
            }`}
          >
            {trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-soft">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </h3>
    </div>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.35em] text-soft">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/10 p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 text-soft">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-soft">{description}</p>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`relative overflow-hidden rounded-xl bg-white/20 ${className}`}>
    <div className="shimmer absolute inset-0" />
  </div>
}

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}
