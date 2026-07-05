-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
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

-- Create clients table
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

-- Create mt5_accounts table
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

-- Create profit_history table
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

-- Create invoices table
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

-- Create transactions table
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

-- Create telegram_logs table
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

-- Create schedules table
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

-- Create settings table
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

-- Create notes table
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Create function to generate invoice number
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

-- Enable Row Level Security
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

-- RLS Policies for clients table
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

CREATE POLICY "Clients can view their own data"
ON clients FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- RLS Policies for invoices table
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

CREATE POLICY "Clients can view their own invoices"
ON invoices FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

-- RLS Policies for mt5_accounts table
CREATE POLICY "Admins have full access to mt5_accounts"
ON mt5_accounts FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Clients can view their own mt5_accounts"
ON mt5_accounts FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

-- RLS Policies for profit_history table
CREATE POLICY "Admins have full access to profit_history"
ON profit_history FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Clients can view their own profit_history"
ON profit_history FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

-- RLS Policies for transactions table
CREATE POLICY "Admins have full access to transactions"
ON transactions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Clients can view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

-- Insert default settings
INSERT INTO settings (key, value, category, description, is_public) VALUES
('default_profit_split', '40', 'billing', 'Default profit split percentage', false),
('invoice_due_days', '7', 'billing', 'Days until invoice is due', false),
('reminder_days_before', '3', 'billing', 'Days before due to send reminder', false),
('admin_wallet_address', '""', 'payments', 'Admin TRON wallet address', false),
('telegram_bot_token', '""', 'telegram', 'Telegram bot token', false);

-- Insert default schedules
INSERT INTO schedules (name, description, schedule_type, cron_expression, is_active) VALUES
('Weekly Profit Sync', 'Sync MT5 profits every Monday', 'profit_sync', '0 0 * * 1', true),
('Weekly Reports', 'Send weekly reports to clients', 'weekly_report', '0 9 * * 1', true),
('Payment Reminders', 'Send payment reminders', 'payment_reminder', '0 10 * * *', true);
