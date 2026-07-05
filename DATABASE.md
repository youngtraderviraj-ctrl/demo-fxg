# Database Schema Documentation

## Overview

This document describes the complete database schema for the FXG Alpha Master Dashboard using Supabase (PostgreSQL).

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    users    │────────▶│   clients   │
└─────────────┘         └─────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────┐ ┌──────────┐
        │ mt5_accounts │ │ invoices │ │  notes   │
        └──────────────┘ └──────────┘ └──────────┘
                │             │
                │             ▼
                │      ┌──────────────┐
                │      │ transactions │
                │      └──────────────┘
                ▼
        ┌───────────────┐
        │profit_history │
        └───────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────┐
│telegram_logs │  │  schedules   │  │ settings │
└──────────────┘  └──────────────┘  └──────────┘
```

## Tables

### 1. users

Stores authentication and user information for both admins and clients.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `email`: User email (unique, used for login)
- `password_hash`: Bcrypt hashed password
- `role`: User role (admin or client)
- `is_active`: Account status
- `last_login`: Last login timestamp
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

### 2. clients

Stores client information and MT5 account details.

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    telegram_chat_id TEXT,
    mt5_login TEXT,
    mt5_password TEXT,
    mt5_server TEXT,
    profit_split_percentage INTEGER DEFAULT 40 CHECK (profit_split_percentage >= 0 AND profit_split_percentage <= 100),
    wallet_address TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_telegram_chat_id ON clients(telegram_chat_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_mt5_login ON clients(mt5_login);
```

**Columns:**
- `id`: Unique identifier
- `user_id`: Reference to users table
- `name`: Client full name
- `email`: Client email
- `phone`: Client phone number
- `telegram_chat_id`: Telegram chat ID for notifications
- `mt5_login`: MT5 account login
- `mt5_password`: Encrypted MT5 password
- `mt5_server`: MT5 server name
- `profit_split_percentage`: Admin's profit share (0-100%)
- `wallet_address`: TRON wallet address for payments
- `status`: Client status (active/suspended/inactive)
- `notes`: Admin notes about client
- `tags`: Array of tags for categorization

---

### 3. mt5_accounts

Stores real-time MT5 account data synced from MetaTrader 5.

```sql
CREATE TABLE mt5_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    login TEXT NOT NULL,
    server TEXT NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0,
    equity DECIMAL(15, 2) DEFAULT 0,
    margin DECIMAL(15, 2) DEFAULT 0,
    free_margin DECIMAL(15, 2) DEFAULT 0,
    margin_level DECIMAL(10, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'failed')),
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mt5_accounts_client_id ON mt5_accounts(client_id);
CREATE INDEX idx_mt5_accounts_last_sync ON mt5_accounts(last_sync);
```

**Columns:**
- `id`: Unique identifier
- `client_id`: Reference to clients table
- `login`: MT5 account number
- `server`: MT5 server
- `balance`: Account balance
- `equity`: Current equity
- `margin`: Used margin
- `free_margin`: Available margin
- `margin_level`: Margin level percentage
- `profit`: Current floating profit/loss
- `last_sync`: Last successful sync timestamp
- `sync_status`: Status of last sync attempt
- `sync_error`: Error message if sync failed

---

### 4. profit_history

Stores historical profit data for each client by period.

```sql
CREATE TABLE profit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_profit DECIMAL(15, 2) NOT NULL,
    total_deals INTEGER DEFAULT 0,
    winning_deals INTEGER DEFAULT 0,
    losing_deals INTEGER DEFAULT 0,
    profit_split_percentage INTEGER NOT NULL,
    client_share DECIMAL(15, 2) NOT NULL,
    admin_share DECIMAL(15, 2) NOT NULL,
    balance_start DECIMAL(15, 2),
    balance_end DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profit_history_client_id ON profit_history(client_id);
CREATE INDEX idx_profit_history_period ON profit_history(period_start, period_end);
CREATE UNIQUE INDEX idx_profit_history_unique ON profit_history(client_id, period_type, period_start);
```

**Columns:**
- `id`: Unique identifier
- `client_id`: Reference to clients table
- `period_type`: Type of period (daily/weekly/monthly)
- `period_start`: Period start date
- `period_end`: Period end date
- `gross_profit`: Total profit before split
- `total_deals`: Number of closed deals
- `winning_deals`: Number of profitable deals
- `losing_deals`: Number of losing deals
- `profit_split_percentage`: Profit split percentage used
- `client_share`: Client's portion of profit
- `admin_share`: Admin's portion of profit
- `balance_start`: Balance at period start
- `balance_end`: Balance at period end

---

### 5. invoices

Stores billing invoices for clients.

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USDT',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

**Columns:**
- `id`: Unique identifier
- `client_id`: Reference to clients table
- `invoice_number`: Unique invoice number (e.g., INV-2026-001)
- `amount`: Invoice amount
- `currency`: Payment currency (default USDT)
- `period_start`: Billing period start
- `period_end`: Billing period end
- `due_date`: Payment due date
- `status`: Invoice status
- `payment_date`: Date payment was received
- `notes`: Additional notes
- `metadata`: Additional data (JSON)

---

### 6. transactions

Stores payment transactions from blockchain.

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    transaction_hash TEXT UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USDT',
    wallet_from TEXT NOT NULL,
    wallet_to TEXT NOT NULL,
    blockchain TEXT DEFAULT 'TRON',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmations INTEGER DEFAULT 0,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    block_number BIGINT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX idx_transactions_wallet_to ON transactions(wallet_to);
CREATE INDEX idx_transactions_status ON transactions(status);
```

**Columns:**
- `id`: Unique identifier
- `invoice_id`: Reference to invoices table (nullable)
- `client_id`: Reference to clients table
- `transaction_hash`: Blockchain transaction hash
- `amount`: Transaction amount
- `currency`: Transaction currency
- `wallet_from`: Sender wallet address
- `wallet_to`: Receiver wallet address
- `blockchain`: Blockchain network
- `status`: Transaction status
- `confirmations`: Number of confirmations
- `confirmed_at`: Confirmation timestamp
- `block_number`: Block number
- `metadata`: Additional transaction data

---

### 7. telegram_logs

Stores history of Telegram messages sent.

```sql
CREATE TABLE telegram_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('broadcast', 'individual', 'automated', 'reminder')),
    subject TEXT,
    message_text TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    telegram_message_id TEXT,
    metadata JSONB
);

CREATE INDEX idx_telegram_logs_client_id ON telegram_logs(client_id);
CREATE INDEX idx_telegram_logs_sent_at ON telegram_logs(sent_at);
CREATE INDEX idx_telegram_logs_message_type ON telegram_logs(message_type);
```

**Columns:**
- `id`: Unique identifier
- `client_id`: Reference to clients table (null for broadcasts)
- `message_type`: Type of message
- `subject`: Message subject/title
- `message_text`: Message content
- `media_url`: URL of attached media
- `media_type`: Type of media (photo/video/document)
- `sent_at`: Timestamp when sent
- `status`: Delivery status
- `error_message`: Error if failed
- `telegram_message_id`: Telegram's message ID
- `metadata`: Additional data

---

### 8. schedules

Stores scheduled tasks and their execution status.

```sql
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('weekly_report', 'payment_reminder', 'profit_sync', 'custom')),
    cron_expression TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    run_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_schedules_is_active ON schedules(is_active);
CREATE INDEX idx_schedules_next_run ON schedules(next_run);
```

**Columns:**
- `id`: Unique identifier
- `name`: Schedule name
- `description`: Schedule description
- `schedule_type`: Type of scheduled task
- `cron_expression`: Cron expression for scheduling
- `is_active`: Whether schedule is active
- `last_run`: Last execution timestamp
- `next_run`: Next scheduled execution
- `run_count`: Total successful runs
- `failure_count`: Total failed runs
- `config`: Additional configuration (JSON)

---

### 9. settings

Stores application-wide settings.

```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
```

**Columns:**
- `id`: Unique identifier
- `key`: Setting key (unique)
- `value`: Setting value (JSON)
- `category`: Setting category
- `description`: Setting description
- `is_public`: Whether setting is publicly accessible
- `updated_by`: User who last updated
- `updated_at`: Last update timestamp

**Example Settings:**
- `default_profit_split`: Default profit split percentage
- `admin_wallet_address`: Admin's TRON wallet
- `telegram_bot_token`: Telegram bot token
- `invoice_due_days`: Days until invoice is due
- `reminder_days_before`: Days before due to send reminder

---

### 10. notes

Stores notes about clients.

```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    note_text TEXT NOT NULL,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_client_id ON notes(client_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
```

---

## Functions & Triggers

### Auto-update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mt5_accounts_updated_at BEFORE UPDATE ON mt5_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Generate invoice number

```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq INTEGER;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
    INTO seq
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year || '-%';
    
    RETURN 'INV-' || year || '-' || LPAD(seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE mt5_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

### Policies for clients table

```sql
-- Admins can do everything
CREATE POLICY "Admins have full access to clients"
ON clients FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Clients can only view their own data
CREATE POLICY "Clients can view their own data"
ON clients FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);
```

### Policies for invoices table

```sql
-- Admins can do everything
CREATE POLICY "Admins have full access to invoices"
ON invoices FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Clients can view their own invoices
CREATE POLICY "Clients can view their own invoices"
ON invoices FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);
```

---

## Sample Data

```sql
-- Insert admin user
INSERT INTO users (email, password_hash, role)
VALUES ('admin@fxgalpha.com', '$2b$12$...', 'admin');

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
('default_profit_split', '40', 'billing', 'Default profit split percentage'),
('invoice_due_days', '7', 'billing', 'Days until invoice is due'),
('reminder_days_before', '3', 'billing', 'Days before due to send reminder'),
('admin_wallet_address', '""', 'payments', 'Admin TRON wallet address'),
('telegram_bot_token', '""', 'telegram', 'Telegram bot token');

-- Insert default schedules
INSERT INTO schedules (name, description, schedule_type, cron_expression, is_active) VALUES
('Weekly Profit Sync', 'Sync MT5 profits every Monday', 'profit_sync', '0 0 * * 1', true),
('Weekly Reports', 'Send weekly reports to clients', 'weekly_report', '0 9 * * 1', true),
('Payment Reminders', 'Send payment reminders', 'payment_reminder', '0 10 * * *', true);
```

---

## Backup & Maintenance

### Recommended Backup Strategy
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Location**: Supabase automatic backups + external storage

### Maintenance Tasks
- Vacuum database weekly
- Analyze tables weekly
- Archive old profit_history (>1 year)
- Archive old telegram_logs (>6 months)
- Monitor table sizes and indexes

---

## Migration Files

All migrations are stored in `/backend/migrations/` and can be applied using Supabase CLI or SQL scripts.
