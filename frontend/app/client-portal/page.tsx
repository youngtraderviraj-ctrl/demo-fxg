'use client'

import { useState } from 'react'
import ClientSidebar from '@/components/client/ClientSidebar'
import ClientDashboard from '@/components/client/ClientDashboard'
import ClientInvoices from '@/components/client/ClientInvoices'
import ClientProfile from '@/components/client/ClientProfile'

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboard />
      case 'invoices':
        return <ClientInvoices />
      case 'performance':
        return <ClientDashboard />
      case 'profile':
        return <ClientProfile />
      default:
        return <ClientDashboard />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70 blur-3xl" aria-hidden />

      <div className="relative z-10 flex min-h-[calc(100vh-48px)] gap-6">
        <ClientSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 lg:ml-80 xl:ml-[22rem]">
          <div className="mx-auto max-w-6xl space-y-8 pb-12">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
