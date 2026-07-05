'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
}

interface Props {
  open: boolean
  onClose: () => void
  onNavigate: (id: string) => void
  items: NavItem[]
}

export default function CommandPalette({ open, onClose, onNavigate, items }: Props) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const results = useMemo(
    () => items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)) }
      if (e.key === 'Enter' && results[cursor]) onNavigate(results[cursor].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, results, cursor, onClose, onNavigate])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[15vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-card w-full max-w-lg overflow-hidden rounded-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/15 px-4 py-3">
          <Search className="h-4 w-4 text-soft" />
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0) }}
            placeholder="Search pages and actions..."
            className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder:text-soft focus:outline-none"
          />
          <kbd className="rounded-md border border-white/30 bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold text-soft">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-soft">No results found</p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon
              return (
                <button
                  key={r.id}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => onNavigate(r.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    cursor === i ? 'bg-accent text-white' : 'text-[color:var(--text-primary)] hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 font-medium">{r.label}</span>
                  {cursor === i && <CornerDownLeft className="h-4 w-4 opacity-80" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
