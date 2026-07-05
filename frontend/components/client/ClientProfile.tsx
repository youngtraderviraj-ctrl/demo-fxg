'use client'

import { User, Mail, Phone, Wallet, TrendingUp, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'

export default function ClientProfile() {
  const profile = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (234) 567-8901',
    mt5Account: '87654321',
    mt5Server: 'MetaQuotes-Demo',
    profitSplit: 45,
    walletAddress: 'TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
    status: 'active',
    joinedDate: 'Jan 15, 2026',
    telegramId: '@janesmith',
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.4em] text-soft">Identity</p>
        <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">My Profile</h2>
        <p className="mt-1 text-soft">Manage your account information</p>
      </div>

      <Card className="glass-card border-none">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 lg:flex-row">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-accent text-5xl font-bold text-white shadow-xl">
              JS
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-[color:var(--text-primary)]">{profile.name}</h3>
              <p className="mt-1 text-soft">{profile.email}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="rounded-full bg-white/50 px-4 py-1 text-sm font-semibold text-[color:var(--text-primary)]">
                  {profile.status}
                </span>
                <span className="rounded-full bg-white/30 px-4 py-1 text-sm font-semibold text-[color:var(--text-primary)]">
                  Member since {profile.joinedDate}
                </span>
              </div>
            </div>
            <Button className="rounded-full">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[color:var(--text-primary)]">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Email', value: profile.email, Icon: Mail },
              { label: 'Phone', value: profile.phone, Icon: Phone },
              { label: 'Telegram', value: profile.telegramId, Icon: Shield },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/30 p-4">
                <Icon className="h-5 w-5 text-[color:var(--text-primary)]/70" />
                <div>
                  <p className="text-sm text-soft">{label}</p>
                  <p className="font-medium text-[color:var(--text-primary)]">{value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[color:var(--text-primary)]">
              <TrendingUp className="h-5 w-5" />
              Trading Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/20 bg-white/30 p-4">
              <p className="text-sm text-soft">MT5 Account</p>
              <p className="mt-1 font-mono text-lg font-semibold text-[color:var(--text-primary)]">
                {profile.mt5Account}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/30 p-4">
              <p className="text-sm text-soft">MT5 Server</p>
              <p className="mt-1 font-medium text-[color:var(--text-primary)]">{profile.mt5Server}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/30 p-4">
              <p className="text-sm text-soft">Profit Split</p>
              <p className="mt-1 text-2xl font-bold text-accent">{profile.profitSplit}%</p>
              <p className="text-xs text-soft">Performance fee on profits</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[color:var(--text-primary)]">
            <Wallet className="h-5 w-5" />
            Payment Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[color:var(--text-primary)]">TRON Wallet Address (TRC20)</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white/70 px-4 py-3 font-mono text-sm text-[color:var(--text-primary)]">
                {profile.walletAddress}
              </code>
              <Button variant="outline" size="sm" className="rounded-full">Copy</Button>
              <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
            </div>
          </div>
          <div className="rounded-lg bg-white/70 p-4">
            <p className="text-sm text-[color:var(--text-primary)]/70">
              <strong>Important:</strong> This wallet address is used for receiving your profit share and making invoice payments. 
              Make sure it's correct to avoid payment issues.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
              { label: 'Total Trades', value: '156' },
              { label: 'Win Rate', value: '77%' },
              { label: 'Total Profit', value: '$5,234' },
              { label: 'Your Share', value: '$2,355' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-[color:var(--text-primary)]">{stat.value}</p>
                <p className="mt-1 text-sm text-soft">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/30 p-4">
            <div>
              <p className="font-medium text-[color:var(--text-primary)]">Password</p>
              <p className="text-sm text-soft">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" className="rounded-full">Change Password</Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/30 p-4">
            <div>
              <p className="font-medium text-[color:var(--text-primary)]">Two-Factor Authentication</p>
              <p className="text-sm text-soft">Add an extra layer of security</p>
            </div>
            <Button variant="outline" className="rounded-full">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
