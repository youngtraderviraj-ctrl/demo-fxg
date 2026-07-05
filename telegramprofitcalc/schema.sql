-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    mt5_account TEXT UNIQUE,
    profit_split_percentage INTEGER DEFAULT 50,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    balance NUMERIC DEFAULT 0,
    equity NUMERIC DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on mt5_account for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_mt5_account ON clients(mt5_account);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Enable Row Level Security (optional - for production use)
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access (if using RLS)
-- CREATE POLICY "Allow public read access" ON clients
--     FOR SELECT USING (true);

-- Create a policy to allow insert/update via service key (if using RLS)
-- CREATE POLICY "Allow service key write access" ON clients
--     FOR ALL USING (auth.role() = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- INSERT INTO clients (id, name, email, mt5_account, profit_split_percentage, status, balance, equity, last_updated)
-- VALUES 
--     ('client_001', 'John Doe', 'john@example.com', '12345678', 80, 'active', 10000.00, 10500.00, NOW()),
--     ('client_002', 'Jane Smith', 'jane@example.com', '87654321', 70, 'active', 15000.00, 14800.00, NOW());
