# MT5 Profit Split Bot - Data Sync System

A file watcher system that monitors `clients.json` and automatically syncs client data to a Supabase database via REST API. This enables real-time data synchronization between your MT5 trading bot and downstream applications (websites, mobile apps, or other bots).

## Architecture

```
clients.json → Python Watcher → Supabase REST API → Supabase Database → Website/Mobile App/Other Bots
```

## Features

- **Real-time File Monitoring**: Watches `clients.json` for changes using Python's watchdog library
- **Automatic Sync**: Automatically syncs client data to Supabase when file changes
- **Debouncing**: Prevents rapid successive syncs for file save events
- **Error Handling**: Robust error handling with logging
- **Supabase Integration**: Uses Supabase REST API for database operations

## Setup

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `schema.sql`
3. Get your project URL and API key from Settings → API
4. Choose either:
   - **anon key**: For public access (use RLS policies)
   - **service_role key**: For full admin access (use with caution)

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```

### 3. Python Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 4. Run the Watcher

```bash
python watcher.py
```

The watcher will:
- Start monitoring `clients.json` in the current directory
- Perform an initial sync on startup
- Sync data to Supabase whenever the file changes

## clients.json Format

```json
{
  "clients": [
    {
      "id": "client_001",
      "name": "John Doe",
      "email": "john@example.com",
      "mt5_account": "12345678",
      "profit_split_percentage": 80,
      "status": "active",
      "balance": 10000.00,
      "equity": 10500.00,
      "last_updated": "2026-07-03T03:55:00Z"
    }
  ],
  "metadata": {
    "version": "1.0",
    "last_sync": "2026-07-03T03:55:00Z"
  }
}
```

## Database Schema

The Supabase database should have a `clients` table with the following structure:
- `id`: text (primary key)
- `name`: text
- `email`: text
- `mt5_account`: text
- `profit_split_percentage`: integer
- `status`: text
- `balance`: numeric
- `equity`: numeric
- `last_updated`: timestamp with time zone

See `schema.sql` for the complete SQL schema.

## Usage with Downstream Applications

Once data is in Supabase, your downstream applications can:

1. **Website**: Use Supabase JavaScript client to fetch and display client data
2. **Mobile App**: Use Supabase Flutter/React Native SDKs
3. **Other Bots**: Query Supabase REST API or use PostgreSQL replication

Example API call to fetch clients:
```bash
curl https://your-project.supabase.co/rest/v1/clients \
  -H "apikey: YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
```

## Development

### Adding New Fields

1. Update `clients.json` structure
2. Update Supabase schema via SQL Editor
3. The watcher will automatically sync new fields

### Custom Watch Path

Set the `WATCH_PATH` environment variable to monitor a different directory:
```env
WATCH_PATH=/path/to/your/directory
```

## Troubleshooting

- **Sync not working**: Check that SUPABASE_URL and SUPABASE_KEY are correct
- **Permission errors**: Ensure your API key has write permissions
- **File not detected**: Verify the watcher is running in the correct directory

## License

MIT
