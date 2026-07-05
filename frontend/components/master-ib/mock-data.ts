// Mock data for the Master IB Portal (testing/demo only)

export type ClientStatus = 'active' | 'inactive' | 'pending'
export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface IBClient {
  id: string
  name: string
  email: string
  avatarColor: string
  account: string
  broker: string
  status: ClientStatus
  equity: number
  profit: number
  weeklyProfit: number
  monthlyProfit: number
  performanceFee: number
  lastActive: string
  paymentStatus: PaymentStatus
  registered: string
  telegram: string
  wallet: string
}

export interface CommissionRow {
  id: string
  date: string
  client: string
  amount: number
  status: 'paid' | 'pending'
  txId: string
}

export interface Withdrawal {
  id: string
  date: string
  amount: number
  method: string
  wallet: string
  status: 'completed' | 'pending' | 'processing'
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'payment' | 'client' | 'commission' | 'system'
  read: boolean
}

const FIRST = [
  'James', 'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella',
  'Lucas', 'Mia', 'Aiden', 'Charlotte', 'Elijah', 'Amelia', 'Kai', 'Aria', 'Leo', 'Layla',
  'Arjun', 'Priya', 'Wei', 'Yuki', 'Omar', 'Fatima', 'Diego', 'Sofia', 'Hana', 'Ravi',
  'Chloe', 'Nathan', 'Grace', 'Julian', 'Zoe', 'Marcus', 'Nina', 'Felix', 'Ivy', 'Oscar',
]
const LAST = [
  'Anderson', 'Martinez', 'Thompson', 'Nakamura', 'Khan', 'Silva', 'Kumar', 'Chen', 'Rossi', 'Novak',
  'Fischer', 'Costa', 'Reyes', 'Haddad', 'Petrov', 'Okafor', 'Larsen', 'Moreau', 'Bianchi', 'Sato',
]
const BROKERS = ['FXG Prime', 'AlphaMarkets', 'GlobalFX', 'PrimeXBT', 'TradeCore']
const COLORS = ['#0a68ff', '#12b76a', '#7c3aed', '#f79009', '#ef4444', '#06b6d4', '#ec4899', '#3b82f6']

// Deterministic pseudo-random so SSR and client match
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function daysAgo(n: number): string {
  const d = new Date(2026, 6, 5)
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function relative(n: number): string {
  if (n === 0) return 'Just now'
  if (n < 60) return `${n} min ago`
  if (n < 1440) return `${Math.floor(n / 60)}h ago`
  return `${Math.floor(n / 1440)}d ago`
}

export const generateClients = (): IBClient[] => {
  const rand = seeded(42)
  const clients: IBClient[] = []
  for (let i = 0; i < 40; i++) {
    const first = FIRST[i % FIRST.length]
    const last = LAST[Math.floor(rand() * LAST.length)]
    const name = `${first} ${last}`
    const statusRoll = rand()
    const status: ClientStatus = statusRoll > 0.78 ? 'inactive' : statusRoll > 0.68 ? 'pending' : 'active'
    const equity = Math.round((5000 + rand() * 145000) / 10) * 10
    const profit = Math.round((rand() * 24000 - 4000) / 10) * 10
    const weeklyProfit = Math.round((rand() * 4200 - 500) / 10) * 10
    const monthlyProfit = Math.round((rand() * 14000 - 1500) / 10) * 10
    const performanceFee = Math.max(0, Math.round(monthlyProfit * 0.2))
    const payRoll = rand()
    const paymentStatus: PaymentStatus = payRoll > 0.8 ? 'overdue' : payRoll > 0.55 ? 'pending' : 'paid'
    clients.push({
      id: `CL-${(1000 + i).toString()}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
      avatarColor: COLORS[i % COLORS.length],
      account: `${Math.floor(2000000 + rand() * 7999999)}`,
      broker: BROKERS[Math.floor(rand() * BROKERS.length)],
      status,
      equity,
      profit,
      weeklyProfit,
      monthlyProfit,
      performanceFee,
      lastActive: relative(Math.floor(rand() * 3000)),
      paymentStatus,
      registered: daysAgo(Math.floor(rand() * 400)),
      telegram: `@${first.toLowerCase()}_${last.toLowerCase()}`,
      wallet: `0x${Math.floor(rand() * 1e16).toString(16).padStart(12, '0')}...${Math.floor(rand() * 1e4).toString(16)}`,
    })
  }
  return clients
}

export const CLIENTS = generateClients()

export const ibProfile = {
  name: 'Alexander Voss',
  title: 'Master Introducing Broker',
  email: 'alex.voss@masterib.io',
  telegram: '@alex_voss_ib',
  wallet: '0x8f2a...c41d',
  referralCode: 'MIB-ALX-2026',
  referralLink: 'https://fxgalpha.io/r/MIB-ALX-2026',
  avatarColor: '#0a68ff',
}

export const dashboardStats = {
  totalClients: CLIENTS.length,
  activeClients: CLIENTS.filter((c) => c.status === 'active').length,
  weekCommission: 8420.5,
  monthCommission: 34290.75,
  lifetimeCommission: 412680.0,
  pendingPayout: 6240.25,
}

export const commissionSummary = {
  today: 1240.5,
  weekly: 8420.5,
  monthly: 34290.75,
  pending: 6240.25,
  paid: 28050.5,
  lifetime: 412680.0,
}

export const commissionGrowth = [
  { month: 'Jan', commission: 21400, clients: 22 },
  { month: 'Feb', commission: 24800, clients: 26 },
  { month: 'Mar', commission: 27600, clients: 29 },
  { month: 'Apr', commission: 29900, clients: 32 },
  { month: 'May', commission: 31500, clients: 36 },
  { month: 'Jun', commission: 34290, clients: 40 },
]

export const monthlyEarnings = [
  { month: 'Jan', earnings: 21400 },
  { month: 'Feb', earnings: 24800 },
  { month: 'Mar', earnings: 27600 },
  { month: 'Apr', earnings: 29900 },
  { month: 'May', earnings: 31500 },
  { month: 'Jun', earnings: 34290 },
]

export const clientGrowth = [
  { month: 'Jan', total: 22, active: 18 },
  { month: 'Feb', total: 26, active: 21 },
  { month: 'Mar', total: 29, active: 24 },
  { month: 'Apr', total: 32, active: 27 },
  { month: 'May', total: 36, active: 30 },
  { month: 'Jun', total: 40, active: 33 },
]

export const tradingVolume = [
  { day: 'Mon', volume: 1.2 },
  { day: 'Tue', volume: 1.8 },
  { day: 'Wed', volume: 1.5 },
  { day: 'Thu', volume: 2.1 },
  { day: 'Fri', volume: 2.6 },
  { day: 'Sat', volume: 0.9 },
  { day: 'Sun', volume: 0.6 },
]

export const referralTimeline = [
  { week: 'W1', clicks: 120, signups: 8 },
  { week: 'W2', clicks: 180, signups: 12 },
  { week: 'W3', clicks: 150, signups: 9 },
  { week: 'W4', clicks: 240, signups: 18 },
  { week: 'W5', clicks: 210, signups: 14 },
  { week: 'W6', clicks: 300, signups: 22 },
]

export const referralStats = {
  clicks: 1200,
  registrations: 83,
  activeClients: 40,
  conversionRate: 6.9,
}

export const generateCommissionHistory = (): CommissionRow[] => {
  const rand = seeded(7)
  const rows: CommissionRow[] = []
  for (let i = 0; i < 24; i++) {
    const c = CLIENTS[Math.floor(rand() * CLIENTS.length)]
    rows.push({
      id: `TXN-${9000 + i}`,
      date: daysAgo(i * 2),
      client: c.name,
      amount: Math.round((80 + rand() * 1200) / 5) * 5,
      status: rand() > 0.4 ? 'paid' : 'pending',
      txId: `0x${Math.floor(rand() * 1e14).toString(16)}`,
    })
  }
  return rows
}

export const COMMISSION_HISTORY = generateCommissionHistory()

export const WITHDRAWALS: Withdrawal[] = [
  { id: 'WD-2041', date: daysAgo(2), amount: 5000, method: 'USDT (TRC20)', wallet: '0x8f2a...c41d', status: 'processing' },
  { id: 'WD-2038', date: daysAgo(9), amount: 8200, method: 'USDT (TRC20)', wallet: '0x8f2a...c41d', status: 'completed' },
  { id: 'WD-2035', date: daysAgo(18), amount: 6500, method: 'Bank Transfer', wallet: 'IBAN ****3421', status: 'completed' },
  { id: 'WD-2030', date: daysAgo(31), amount: 4300, method: 'USDT (TRC20)', wallet: '0x8f2a...c41d', status: 'completed' },
  { id: 'WD-2027', date: daysAgo(44), amount: 7100, method: 'USDT (TRC20)', wallet: '0x8f2a...c41d', status: 'completed' },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Commission received', message: '$1,240.50 credited from client trades', time: relative(4), type: 'commission', read: false },
  { id: 'n2', title: 'New client joined', message: 'Priya Kumar registered via your referral link', time: relative(48), type: 'client', read: false },
  { id: 'n3', title: 'Withdrawal processing', message: 'Your $5,000 withdrawal is being processed', time: relative(180), type: 'payment', read: false },
  { id: 'n4', title: 'Payout completed', message: '$8,200 withdrawal completed successfully', time: relative(1300), type: 'payment', read: true },
  { id: 'n5', title: 'New client joined', message: 'Diego Silva registered via your referral link', time: relative(2600), type: 'client', read: true },
  { id: 'n6', title: 'System update', message: 'Reporting dashboard v2 is now live', time: relative(4300), type: 'system', read: true },
]

export const paymentHistory = [
  { date: daysAgo(3), amount: 480, status: 'paid' as const },
  { date: daysAgo(17), amount: 520, status: 'paid' as const },
  { date: daysAgo(31), amount: 610, status: 'paid' as const },
  { date: daysAgo(45), amount: 390, status: 'pending' as const },
]

export const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const currencyExact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
