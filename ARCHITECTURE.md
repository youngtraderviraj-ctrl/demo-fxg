# FXG Alpha Master Dashboard - Architecture Documentation

## Overview

A comprehensive SaaS platform for managing trading fund clients with MT5 integration, automated billing, Telegram notifications, and crypto payment processing.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├──────────────────────┬──────────────────────────────────────┤
│  Admin Dashboard     │     Client Portal                     │
│  (Next.js)           │     (Next.js)                         │
│  - Client Management │     - Performance Dashboard           │
│  - Billing           │     - Invoice Viewing                 │
│  - Analytics         │     - Payment History                 │
│  - Telegram Control  │     - Profile Management              │
└──────────────────────┴──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (FastAPI)                      │
│  - Authentication (JWT)                                      │
│  - Rate Limiting                                             │
│  - Request Validation                                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Client     │    │   Billing    │    │  Telegram    │
│   Service    │    │   Service    │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  MT5 Service │    │   Payment    │    │  Analytics   │
│              │    │   Service    │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  - User Management                                           │
│  - Client Data                                               │
│  - Transaction History                                       │
│  - Real-time Subscriptions                                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Background   │    │   Telegram   │    │   Payment    │
│   Workers    │    │     Bot      │    │   Watcher    │
│ (APScheduler)│    │              │    │   (TRON)     │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy + Supabase Client
- **Authentication**: JWT with refresh tokens
- **Background Jobs**: APScheduler
- **API Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod

### External Integrations
- **Trading Platform**: MetaTrader 5 (MT5)
- **Messaging**: Telegram Bot API
- **Blockchain**: TRON (TRC20 USDT)
- **Payment Monitoring**: TronScan API

### DevOps
- **Containerization**: Docker
- **Web Server**: Nginx
- **SSL**: Let's Encrypt
- **Deployment**: AWS EC2 / DigitalOcean
- **CI/CD**: GitHub Actions

## Core Features

### 1. Admin Dashboard

#### Client Management
- CRUD operations for clients
- Bulk import/export (CSV)
- Client search and filtering
- Status management (active/suspended/inactive)
- MT5 account linking
- Telegram ID assignment
- Custom profit split percentages
- Client notes and tags

#### Billing Management
- Automated weekly invoice generation
- Manual invoice creation/editing
- Payment status tracking
- Payment history
- Invoice templates
- PDF generation
- Email notifications

#### Analytics & Reporting
- Revenue dashboard
- Client performance metrics
- Payment collection rates
- Profit distribution charts
- Monthly/weekly reports
- Export capabilities

#### Telegram Control
- Broadcast messages
- Individual messaging
- Message templates
- Scheduled messages
- Media support
- Message history

### 2. Client Portal

#### Dashboard
- Real-time account metrics
- Current balance & equity
- Daily/weekly/monthly profit
- Performance charts
- Recent transactions

#### Billing
- View invoices
- Payment status
- Payment history
- Download invoices
- Pay now (crypto)

#### Performance Analytics
- Profit/loss charts
- Win rate statistics
- Drawdown analysis
- Trade history
- Monthly performance

#### Profile Management
- Update contact info
- Change password
- Telegram linking
- Wallet management
- Notification preferences

### 3. Background Services

#### MT5 Profit Calculation
- Scheduled profit sync (every 10 minutes)
- Historical deal analysis
- Weekly profit calculation
- Account balance tracking
- Error handling and retry logic

#### Billing Engine
- Weekly invoice generation (Monday 00:00 UTC)
- Due date calculation
- Automatic reminders (3 days before due)
- Overdue notifications
- Payment reconciliation

#### Payment Watcher
- TRON blockchain monitoring
- TRC20 USDT transaction detection
- Automatic payment matching
- Invoice status updates
- Receipt generation

#### Telegram Automation
- Scheduled weekly reports
- Payment reminders
- Invoice notifications
- Custom broadcasts
- Template management

## Database Schema

### Core Tables

#### users
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- role (ENUM: admin, client)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### clients
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- name (TEXT)
- email (TEXT)
- telegram_chat_id (TEXT)
- mt5_login (TEXT)
- mt5_password (TEXT, ENCRYPTED)
- mt5_server (TEXT)
- profit_split_percentage (INTEGER)
- wallet_address (TEXT)
- status (ENUM: active, suspended, inactive)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### mt5_accounts
- id (UUID, PK)
- client_id (UUID, FK → clients.id)
- login (TEXT)
- server (TEXT)
- balance (DECIMAL)
- equity (DECIMAL)
- margin (DECIMAL)
- free_margin (DECIMAL)
- last_sync (TIMESTAMP)
- created_at (TIMESTAMP)

#### profit_history
- id (UUID, PK)
- client_id (UUID, FK → clients.id)
- period_start (DATE)
- period_end (DATE)
- gross_profit (DECIMAL)
- total_deals (INTEGER)
- profit_split_percentage (INTEGER)
- client_share (DECIMAL)
- admin_share (DECIMAL)
- created_at (TIMESTAMP)

#### invoices
- id (UUID, PK)
- client_id (UUID, FK → clients.id)
- invoice_number (TEXT, UNIQUE)
- amount (DECIMAL)
- period_start (DATE)
- period_end (DATE)
- due_date (DATE)
- status (ENUM: pending, paid, overdue, cancelled)
- payment_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### transactions
- id (UUID, PK)
- invoice_id (UUID, FK → invoices.id)
- client_id (UUID, FK → clients.id)
- transaction_hash (TEXT)
- amount (DECIMAL)
- currency (TEXT)
- wallet_from (TEXT)
- wallet_to (TEXT)
- status (ENUM: pending, confirmed, failed)
- confirmed_at (TIMESTAMP)
- created_at (TIMESTAMP)

#### telegram_logs
- id (UUID, PK)
- client_id (UUID, FK → clients.id, NULLABLE)
- message_type (ENUM: broadcast, individual, automated)
- message_text (TEXT)
- media_url (TEXT)
- sent_at (TIMESTAMP)
- status (ENUM: sent, failed)
- error_message (TEXT)

#### schedules
- id (UUID, PK)
- name (TEXT)
- schedule_type (ENUM: weekly_report, payment_reminder, custom)
- cron_expression (TEXT)
- is_active (BOOLEAN)
- last_run (TIMESTAMP)
- next_run (TIMESTAMP)
- created_at (TIMESTAMP)

#### settings
- id (UUID, PK)
- key (TEXT, UNIQUE)
- value (JSONB)
- description (TEXT)
- updated_at (TIMESTAMP)

### Indexes
- clients.telegram_chat_id
- clients.status
- invoices.status
- invoices.due_date
- transactions.transaction_hash
- profit_history.client_id, period_start

### Row Level Security (RLS)
- Admins: Full access to all tables
- Clients: Read-only access to their own data
- Public: No access (authentication required)

## API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/change-password

### Clients (Admin)
- GET /api/admin/clients
- POST /api/admin/clients
- GET /api/admin/clients/{id}
- PUT /api/admin/clients/{id}
- DELETE /api/admin/clients/{id}
- POST /api/admin/clients/import
- GET /api/admin/clients/export

### Billing (Admin)
- GET /api/admin/invoices
- POST /api/admin/invoices
- GET /api/admin/invoices/{id}
- PUT /api/admin/invoices/{id}
- DELETE /api/admin/invoices/{id}
- POST /api/admin/invoices/{id}/mark-paid
- GET /api/admin/invoices/{id}/pdf

### Analytics (Admin)
- GET /api/admin/analytics/dashboard
- GET /api/admin/analytics/revenue
- GET /api/admin/analytics/clients
- GET /api/admin/analytics/payments

### Telegram (Admin)
- POST /api/admin/telegram/send
- POST /api/admin/telegram/broadcast
- GET /api/admin/telegram/templates
- POST /api/admin/telegram/templates
- GET /api/admin/telegram/history

### Client Portal
- GET /api/client/dashboard
- GET /api/client/invoices
- GET /api/client/invoices/{id}
- GET /api/client/transactions
- GET /api/client/performance
- GET /api/client/profile
- PUT /api/client/profile

### MT5 Integration
- POST /api/mt5/sync
- GET /api/mt5/accounts/{id}
- GET /api/mt5/profit-history

### Payments
- POST /api/payments/verify
- GET /api/payments/status/{transaction_hash}

## Security Considerations

### Authentication
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- Secure HTTP-only cookies
- CSRF protection

### Data Protection
- MT5 passwords encrypted at rest (Fernet)
- Sensitive data encrypted in Supabase
- Environment variables for secrets
- No hardcoded credentials

### API Security
- Rate limiting (100 req/min per IP)
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- XSS protection
- CORS configuration

### Infrastructure
- HTTPS only (TLS 1.3)
- Firewall rules
- Regular security updates
- Database backups (daily)
- Audit logging

## Deployment Architecture

### Production Setup
```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │ (Reverse Proxy, SSL)
└─────────────┘
    │
    ├─────────────────┐
    ▼                 ▼
┌─────────────┐  ┌─────────────┐
│  Frontend   │  │   Backend   │
│  (Next.js)  │  │  (FastAPI)  │
│  Port 3000  │  │  Port 8000  │
└─────────────┘  └─────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Supabase   │
              │ (PostgreSQL)│
              └─────────────┘
```

### Environment Variables

#### Backend (.env)
```
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=15
REFRESH_TOKEN_EXPIRY_DAYS=7
TELEGRAM_BOT_TOKEN=
TRON_API_KEY=
ADMIN_WALLET_ADDRESS=
ENCRYPTION_KEY=
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Development Workflow

### Local Development
1. Clone repository
2. Set up Supabase project
3. Run migrations
4. Configure environment variables
5. Start backend: `uvicorn main:app --reload`
6. Start frontend: `npm run dev`
7. Access admin: http://localhost:3000/admin
8. Access client: http://localhost:3000/client

### Testing
- Unit tests: pytest
- Integration tests: pytest + TestClient
- E2E tests: Playwright
- API tests: Postman/Thunder Client

### Deployment
1. Build Docker images
2. Push to registry
3. Deploy to EC2/DigitalOcean
4. Configure Nginx
5. Set up SSL certificates
6. Run migrations
7. Start services
8. Monitor logs

## Monitoring & Maintenance

### Logging
- Application logs (structured JSON)
- Error tracking (Sentry)
- Access logs (Nginx)
- Database logs (Supabase)

### Monitoring
- Uptime monitoring (UptimeRobot)
- Performance metrics (Grafana)
- Error rates
- API response times
- Database performance

### Backups
- Database: Daily automated backups
- Files: Weekly backups
- Retention: 30 days
- Disaster recovery plan

## Scalability Considerations

### Current Capacity
- 100-500 clients
- Single server deployment
- Vertical scaling

### Future Scaling
- Horizontal scaling (load balancer)
- Database read replicas
- Caching layer (Redis)
- CDN for static assets
- Microservices architecture
- Message queue (RabbitMQ/Celery)

## Future Enhancements

### Phase 10+
- Multi-currency support
- Multiple MT5 accounts per client
- Referral system
- KYC/document management
- Support ticket system
- Mobile app (React Native)
- White-label solution
- API for third-party integrations
- Advanced analytics (ML-based)
- Automated trading signals

## License & Credits

Developed for FXG Alpha Bot
© 2026 All Rights Reserved
