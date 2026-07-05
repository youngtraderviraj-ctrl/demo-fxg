# FXG Alpha Master Dashboard

A comprehensive SaaS platform for managing trading fund clients with MT5 integration, automated billing, Telegram notifications, and crypto payment processing.

## Features

### Admin Dashboard
- **Client Management**: Full CRUD operations, bulk import/export, status management
- **Billing System**: Automated weekly invoice generation, payment tracking
- **Analytics**: Revenue dashboard, performance metrics, collection rates
- **Telegram Control**: Broadcast messages, scheduled reports, custom templates
- **MT5 Integration**: Automated profit calculation and account synchronization

### Client Portal
- **Dashboard**: Real-time account metrics, profit charts
- **Billing**: View invoices, payment history, crypto payment
- **Performance**: Detailed analytics, trade history
- **Profile**: Update contact info, wallet management

### Background Services
- MT5 profit sync (every 10 minutes)
- Weekly invoice generation (Monday 00:00 UTC)
- Payment reminders (3 days before due)
- Telegram automation

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- Supabase (PostgreSQL)
- MetaTrader 5
- Telegram Bot API
- APScheduler

### Frontend
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- shadcn/ui
- React Query
- Recharts

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account
- Telegram Bot Token

### 1. Clone Repository

```bash
git clone <repository-url>
cd alphamasterdashboard
```

### 2. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the migration script:

```bash
cd backend/migrations
# Copy the SQL from 001_initial_schema.sql and run it in Supabase SQL Editor
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
ENCRYPTION_KEY=your-encryption-key
```

**Generate Encryption Key:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Required Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Background Worker:**
```bash
cd backend
source venv/bin/activate
python worker.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 7. Create Admin User

```bash
cd backend
python scripts/create_admin.py
```

Or manually insert into Supabase:

```sql
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
  'admin@fxgalpha.com',
  '$2b$12$...',  -- Use bcrypt to hash 'your-password'
  'admin',
  true
);
```

## Project Structure

```
alphamasterdashboard/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── database.py             # Supabase connection
│   ├── models.py               # Pydantic models
│   ├── auth.py                 # Authentication
│   ├── worker.py               # Background jobs
│   ├── services/
│   │   ├── mt5_service.py      # MT5 integration
│   │   ├── telegram_service.py # Telegram bot
│   │   └── billing_service.py  # Billing logic
│   ├── utils/
│   │   └── encryption.py       # Password encryption
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── client/             # Client portal pages
│   │   └── login/              # Login page
│   ├── components/             # Reusable components
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Utilities
│   ├── package.json
│   └── tailwind.config.ts
├── ARCHITECTURE.md             # Architecture documentation
├── DATABASE.md                 # Database schema
├── API.md                      # API documentation
├── DEPLOYMENT.md               # Deployment guide
└── README.md
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design
- **[DATABASE.md](./DATABASE.md)**: Complete database schema
- **[API.md](./API.md)**: API endpoints and usage
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide

## Key Features Explained

### MT5 Integration

The system automatically syncs with MetaTrader 5 accounts:
- Connects to MT5 accounts using encrypted credentials
- Fetches real-time balance, equity, and profit data
- Calculates weekly profits from historical deals
- Stores data in Supabase for fast access

### Automated Billing

Weekly invoice generation:
- Runs every Monday at 00:00 UTC
- Calculates profit share based on client's percentage
- Generates unique invoice numbers
- Sends Telegram notifications

### Telegram Automation

Automated messaging system:
- Weekly performance reports (Monday 9:00 AM)
- Invoice notifications
- Payment reminders (3 days before due)
- Custom broadcasts

### Payment Processing

TRON blockchain integration:
- Monitors TRC20 USDT transactions
- Automatic payment matching to invoices
- Real-time payment verification
- Receipt generation

## Development

### Adding New Features

1. **Backend**: Add routes in `main.py` or create new service files
2. **Frontend**: Create new pages in `app/` directory
3. **Database**: Add migrations in `backend/migrations/`

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style

- Backend: Follow PEP 8
- Frontend: ESLint + Prettier
- Use type hints (Python) and TypeScript

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

**Quick Deploy:**

```bash
# Build frontend
cd frontend
npm run build

# Run with Docker
docker-compose up -d
```

## Troubleshooting

### Backend Issues

**MT5 Connection Failed:**
- Ensure MT5 terminal is installed
- Check MT5 credentials are correct
- Verify MT5 server is accessible

**Database Connection Error:**
- Verify Supabase credentials
- Check network connectivity
- Ensure RLS policies are configured

### Frontend Issues

**API Connection Failed:**
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running
- Check CORS settings

**Build Errors:**
- Delete `node_modules` and `.next`
- Run `npm install` again
- Check Node.js version (18+)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - © 2026 FXG Alpha Bot. All Rights Reserved.

## Support

For issues or questions:
- Email: support@fxgalpha.com
- Documentation: https://docs.fxgalpha.com
- GitHub Issues: https://github.com/yourusername/alphamasterdashboard/issues

## Roadmap

### Phase 1 (Current)
- ✅ Client management
- ✅ MT5 integration
- ✅ Automated billing
- ✅ Telegram notifications

### Phase 2 (Planned)
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Advanced analytics with ML
- [ ] Mobile app (React Native)
- [ ] Multi-currency support

### Phase 3 (Future)
- [ ] White-label solution
- [ ] API for third-party integrations
- [ ] Referral system
- [ ] KYC/document management

## Acknowledgments

- MetaTrader 5 for trading platform
- Supabase for database and auth
- Telegram for messaging API
- shadcn/ui for UI components
