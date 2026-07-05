'use client'

import { Mail, Send, Wallet, Lock, ShieldCheck, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { ibProfile } from '../mock-data'
import { Avatar, Badge } from '../shared'

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.2em] text-soft">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5">
        <Icon className="h-4 w-4 text-soft" />
        <input
          defaultValue={value}
          className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] focus:outline-none"
        />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-soft">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-[color:var(--text-primary)]">Profile</h1>
        <p className="text-sm text-soft">Manage your personal details and security.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card flex flex-col items-center rounded-3xl p-6 text-center">
          <div className="relative">
            <Avatar name={ibProfile.name} color={ibProfile.avatarColor} size={96} />
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-bold text-[color:var(--text-primary)]">{ibProfile.name}</h2>
          <p className="text-sm text-soft">{ibProfile.title}</p>
          <div className="mt-3 flex gap-2">
            <Badge tone="purple">Master IB</Badge>
            <Badge tone="green">Verified</Badge>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-[color:var(--text-primary)]">Personal Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={ibProfile.name} icon={Mail} />
            <Field label="Email" value={ibProfile.email} icon={Mail} />
            <Field label="Telegram" value={ibProfile.telegram} icon={Send} />
            <Field label="Wallet Address" value={ibProfile.wallet} icon={Wallet} />
          </div>
          <button
            onClick={() => toast.success('Profile saved (demo)')}
            className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Change Password</h3>
          </div>
          <div className="space-y-3">
            {['Current Password', 'New Password', 'Confirm Password'].map((p) => (
              <input
                key={p}
                type="password"
                placeholder={p}
                className="w-full rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-[color:var(--text-primary)] placeholder:text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            ))}
          </div>
          <button
            onClick={() => toast.success('Password updated (demo)')}
            className="mt-4 rounded-xl border border-white/30 bg-white/20 px-5 py-2.5 text-sm font-semibold text-[color:var(--text-primary)] transition hover:bg-white/30"
          >
            Update Password
          </button>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">Two-Factor Authentication</h3>
          </div>
          <p className="text-sm text-soft">Add an extra layer of security to your account with 2FA.</p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/20 bg-white/20 p-4">
            <div>
              <p className="font-semibold text-[color:var(--text-primary)]">Authenticator App</p>
              <p className="text-xs text-soft">Not configured</p>
            </div>
            <button
              onClick={() => toast.success('2FA setup (demo)')}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
