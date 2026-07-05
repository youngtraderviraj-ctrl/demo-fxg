'use client'

import { Send, MessageSquare, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function Telegram() {
  const messageHistory = [
    { id: 1, type: 'broadcast', subject: 'Weekly Reports', recipients: 38, sent: '1 hour ago', status: 'sent' },
    { id: 2, type: 'individual', subject: 'Payment Reminder', recipients: 1, sent: '2 hours ago', status: 'sent' },
    { id: 3, type: 'broadcast', subject: 'System Maintenance', recipients: 45, sent: '1 day ago', status: 'sent' },
    { id: 4, type: 'individual', subject: 'Account Update', recipients: 1, sent: '2 days ago', status: 'sent' },
  ]

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-soft">Comms</p>
            <h2 className="text-3xl font-bold text-[color:var(--text-primary)]">Telegram Messaging</h2>
            <p className="text-soft mt-1">Send messages and manage communications</p>
          </div>
          <Button className="gap-2 rounded-full">
            <Send size={16} />
            Send Message
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Sent', value: '1,234', Icon: MessageSquare },
          { label: 'Active Recipients', value: '38', Icon: Users },
          { label: 'Delivery Rate', value: '98.5%', Icon: CheckCircle },
        ].map((stat) => {
          const Icon = stat.Icon
          return (
            <Card key={stat.label} className="glass-card border-none">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-soft">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[color:var(--text-primary)]">{stat.value}</p>
                </div>
                <Icon className="h-10 w-10 text-[color:var(--text-primary)]" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Compose Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-soft">Message Type</label>
              <select className="w-full rounded-2xl border border-white/20 bg-white/40 px-4 py-2 text-[color:var(--text-primary)] focus:outline-none">
                <option>Broadcast to All</option>
                <option>Individual Client</option>
                <option>Active Clients Only</option>
                <option>Pending Payments</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-soft">Subject</label>
              <input
                type="text"
                placeholder="Enter message subject..."
                className="w-full rounded-2xl border border-white/20 bg-white/40 px-4 py-2 text-[color:var(--text-primary)] placeholder:text-soft focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-soft">Message</label>
              <textarea
                rows={6}
                placeholder="Type your message here..."
                className="w-full rounded-2xl border border-white/20 bg-white/40 px-4 py-2 text-[color:var(--text-primary)] placeholder:text-soft focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button className="gap-2 rounded-full">
                <Send size={16} />
                Send Now
              </Button>
              <Button variant="outline" className="rounded-full">Save as Template</Button>
              <Button variant="outline" className="rounded-full">Preview</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-[color:var(--text-primary)]">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messageHistory.map((message) => (
              <div
                key={message.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/20 bg-white/20 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-[color:var(--text-primary)]">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-[color:var(--text-primary)]">{message.subject}</p>
                    <p className="text-sm text-soft">
                      {message.type === 'broadcast' ? 'Broadcast' : 'Individual'} • {message.recipients} recipient{message.recipients > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-soft">{message.sent}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/40 px-2 py-1 text-xs font-semibold text-[color:var(--text-primary)]">
                    <CheckCircle size={12} />
                    {message.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
