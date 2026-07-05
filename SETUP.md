# Quick Setup Guide

## Step-by-Step Setup

### 1. Supabase Setup (5 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready
3. Go to **Project Settings** → **API**
4. Copy these values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

5. Go to **SQL Editor** and run the migration:
   - Open `backend/migrations/001_initial_schema.sql`
   - Copy all content
   - Paste in SQL Editor and click "Run"

### 2. Telegram Bot Setup (2 minutes)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### 3. Backend Setup (3 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate encryption key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copy the output

# Create .env file
cp .env.example .env
```

Edit `.env` and fill in:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=any-random-string-here-make-it-long
TELEGRAM_BOT_TOKEN=your-bot-token
ENCRYPTION_KEY=the-key-you-generated-above
```

### 4. Frontend Setup (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Create Admin User (1 minute)

Open Supabase SQL Editor and run:

```sql
-- First, hash your password using bcrypt
-- You can use: https://bcrypt-generator.com/
-- Or run: python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('your-password'))"

INSERT INTO users (email, password_hash, role, is_active)
VALUES (
  'admin@fxgalpha.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ztpql6LrS3NG',  -- This is 'admin123'
  'admin',
  true
);
```

**Default credentials:**
- Email: `admin@fxgalpha.com`
- Password: `admin123`

⚠️ **Change this immediately after first login!**

### 6. Run the Application (1 minute)

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Worker:**
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

### 7. Access the Application

Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

Login with:
- Email: `admin@fxgalpha.com`
- Password: `admin123`

---

## Adding Your First Client

1. Login to admin dashboard
2. Go to **Clients** → **Add Client**
3. Fill in the form:
   - Name: Client name
   - Email: Client email
   - Telegram Chat ID: Get from Telegram (send message to bot, check logs)
   - MT5 Login: MT5 account number
   - MT5 Password: MT5 password
   - MT5 Server: Server name (e.g., "MetaQuotes-Demo")
   - Profit Split %: Your share (e.g., 40 for 40%)
   - Wallet Address: Client's TRON wallet (optional)

4. Click **Save**

---

## Testing MT5 Integration

1. Make sure you have MT5 installed on your system
2. Add a client with valid MT5 credentials
3. Go to **MT5** → **Sync Now**
4. Check the results

---

## Testing Telegram

1. Get your Telegram Chat ID:
   - Send a message to your bot
   - Check backend logs for the chat ID
   - Or use: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

2. Update client with Telegram Chat ID
3. Go to **Telegram** → **Send Message**
4. Select client and send a test message

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Kill the process if needed
kill -9 <PID>

# Or use a different port
uvicorn main:app --reload --port 8001
```

### Frontend won't start
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Database connection error
- Check Supabase URL and keys
- Verify project is active in Supabase dashboard
- Check internet connection

### MT5 connection failed
- Ensure MT5 terminal is installed
- Check credentials are correct
- Try logging in manually to MT5 first
- Check server name is exact

### Telegram bot not responding
- Verify bot token is correct
- Check bot is not blocked
- Ensure chat ID is correct
- Check backend logs for errors

---

## Next Steps

1. **Change admin password** in Settings
2. **Add your wallet address** in Settings
3. **Configure Telegram bot token** in Settings
4. **Add clients** and their MT5 accounts
5. **Test MT5 sync** to verify integration
6. **Send test Telegram message**
7. **Generate test invoice**

---

## Production Deployment

When ready for production, see [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Server setup
- SSL certificates
- Domain configuration
- Nginx setup
- Systemd services
- Monitoring
- Backups

---

## Getting Help

- Check [README.md](./README.md) for detailed documentation
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [API.md](./API.md) for API reference
- Read [DATABASE.md](./DATABASE.md) for database schema

For support:
- Email: support@fxgalpha.com
- GitHub Issues: Create an issue with detailed error logs
