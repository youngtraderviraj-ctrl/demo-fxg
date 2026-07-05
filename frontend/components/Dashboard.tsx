'use client'

import { TrendingUp, TrendingDown, Users, DollarSign, FileText, Activity, Zap, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Clients',
      value: '45',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Weekly Profit',
      value: '$12,500.50',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Fees Due',
      value: '$4,200.00',
      change: '-3.1%',
      trend: 'down',
      icon: DollarSign,
      color: 'bg-orange-500',
    },
    {
      title: 'Collection Rate',
      value: '66.4%',
      change: '+5.4%',
      trend: 'up',
      icon: Activity,
      color: 'bg-purple-500',
    },
  ]

  const recentClients = [
    { name: 'John Doe', email: 'john@example.com', status: 'active', profit: 1250.50, split: 40 },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'active', profit: 2100.75, split: 45 },
    { name: 'Mike Johnson', email: 'mike@example.com', status: 'active', profit: 890.25, split: 40 },
    { name: 'Sarah Williams', email: 'sarah@example.com', status: 'suspended', profit: 0, split: 35 },
    { name: 'David Brown', email: 'david@example.com', status: 'active', profit: 1560.00, split: 40 },
  ]

  const recentActivity = [
    { action: 'MT5 Sync Completed', description: '45 accounts synced', time: '2 min ago', type: 'success' },
    { action: 'Invoice Generated', description: 'INV-2026-0045 for $450', time: '15 min ago', type: 'info' },
    { action: 'Payment Received', description: '$450 from John Doe', time: '1 hour ago', type: 'success' },
    { action: 'Client Added', description: 'Sarah Williams joined', time: '2 hours ago', type: 'info' },
    { action: 'Report Sent', description: 'Weekly reports to 38 clients', time: '3 hours ago', type: 'success' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className={`${stat.color} flex h-full items-center justify-center p-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 p-6">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                      <span
                        className={`flex items-center text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.trend === 'up' ? (
                          <TrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                          <TrendingDown className="mr-1 h-4 w-4" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-blue-600 mb-2" />
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-400 mt-1">Using Recharts library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Client Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-center">
                <Activity className="mx-auto h-12 w-12 text-green-600 mb-2" />
                <p className="text-gray-600">Performance metrics chart</p>
                <p className="text-sm text-gray-400 mt-1">Win rate, drawdown, etc.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Clients */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performers</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${client.profit.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{client.split}% split</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      client.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
          <Users className="h-6 w-6" />
          <span>Add Client</span>
        </Button>
        <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
          <FileText className="h-6 w-6" />
          <span>Generate Invoices</span>
        </Button>
        <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
          <TrendingUp className="h-6 w-6" />
          <span>Sync MT5</span>
        </Button>
        <Button className="h-24 flex-col gap-2 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
          <Activity className="h-6 w-6" />
          <span>View Reports</span>
        </Button>
      </div>
    </div>
  )
}
