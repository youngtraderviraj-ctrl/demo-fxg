import MetaTrader5 as mt5
import json
import requests
import threading
import time
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional

# =========================
# CONFIG
# =========================
BOT_TOKEN = "8828020135:AAHiNdeOs1t31WyzdoOtB3IXt57K_dxm23E"
ADMIN_IDS = [6575545803, 7760036118]
DB_PATH = "client_data.db"
SYNC_INTERVAL_MINUTES = 10  # Sync every 10 minutes
bot_running = True
report_running = False
sync_running = False

# =========================
# LOAD CLIENTS
# =========================
with open("clients.json", "r") as f:
    clients = json.load(f)["clients"]

# =========================
# WEEK RANGE
# =========================
today = datetime.now()
current_monday = (
    today - timedelta(days=today.weekday())
).replace(hour=0, minute=0, second=0, microsecond=0)
week_start = current_monday - timedelta(days=7)
week_end = week_start + timedelta(days=5, hours=23, minutes=59, seconds=59)

# =========================
# DATABASE SETUP
# =========================
def init_database():
    """Initialize SQLite database for caching client data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create clients table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            mt5_login TEXT,
            mt5_password TEXT,
            mt5_server TEXT,
            telegram_chat_id TEXT,
            profit_split INTEGER DEFAULT 40,
            status TEXT DEFAULT 'active',
            last_sync TIMESTAMP,
            balance REAL,
            equity REAL,
            weekly_profit REAL,
            weekly_deals INTEGER,
            weekly_share REAL
        )
    """)
    
    # Create sync_log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT,
            sync_time TIMESTAMP,
            balance REAL,
            equity REAL,
            weekly_profit REAL,
            status TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)

def sync_client_to_db(client: Dict[str, Any]) -> bool:
    """Sync single client data from MT5 to database"""
    try:
        # Initialize MT5
        if not mt5.initialize():
            print(f"❌ MT5 init failed for {client['name']}")
            return False
        
        # Login to client account
        if not mt5.login(
            client["mt5_login"],
            password=client["mt5_password"],
            server=client["mt5_server"]
        ):
            print(f"❌ Login failed: {client['name']}")
            mt5.shutdown()
            return False
        
        # Get account info
        acc = mt5.account_info()
        if not acc:
            print(f"❌ No account info: {client['name']}")
            mt5.shutdown()
            return False
        
        balance = acc.balance
        equity = acc.equity
        
        # Calculate weekly profit
        deals = mt5.history_deals_get(week_start, week_end)
        weekly_profit = 0.0
        weekly_deals = 0
        
        if deals:
            for d in deals:
                try:
                    t = datetime.utcfromtimestamp(d.time)
                    if week_start <= t < week_end:
                        weekly_profit += d.profit + d.swap + d.commission
                        weekly_deals += 1
                except:
                    continue
        
        # Calculate share
        split = client.get("profit_split", 40)
        weekly_share = (weekly_profit * split / 100) if weekly_profit > 0 else 0
        
        # Update database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        current_time = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT OR REPLACE INTO clients 
            (id, name, email, mt5_login, mt5_password, mt5_server, telegram_chat_id, 
             profit_split, status, last_sync, balance, equity, weekly_profit, weekly_deals, weekly_share)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            client["id"],
            client["name"],
            client.get("email", ""),
            client["mt5_login"],
            client["mt5_password"],
            client["mt5_server"],
            client["telegram_chat_id"],
            split,
            client.get("status", "active"),
            current_time,
            balance,
            equity,
            weekly_profit,
            weekly_deals,
            weekly_share
        ))
        
        # Log sync
        cursor.execute("""
            INSERT INTO sync_log (client_id, sync_time, balance, equity, weekly_profit, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (client["id"], current_time, balance, equity, weekly_profit, "success"))
        
        conn.commit()
        conn.close()
        
        mt5.shutdown()
        
        print(f"✅ Synced: {client['name']} - Balance: ${balance:.2f}")
        return True
        
    except Exception as e:
        print(f"❌ Error syncing {client['name']}: {e}")
        
        # Log failed sync
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sync_log (client_id, sync_time, balance, equity, weekly_profit, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (client["id"], datetime.now().isoformat(), 0, 0, 0, f"failed: {str(e)}"))
            conn.commit()
            conn.close()
        except:
            pass
        
        return False

def get_client_from_db(client_id: str) -> Optional[Dict[str, Any]]:
    """Get client data from database cache"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, telegram_chat_id, profit_split, status, 
                   last_sync, balance, equity, weekly_profit, weekly_deals, weekly_share
            FROM clients WHERE id = ?
        """, (client_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "telegram_chat_id": row[3],
                "profit_split": row[4],
                "status": row[5],
                "last_sync": row[6],
                "balance": row[7],
                "equity": row[8],
                "weekly_profit": row[9],
                "weekly_deals": row[10],
                "weekly_share": row[11]
            }
        return None
    except Exception as e:
        print(f"❌ Error reading from DB: {e}")
        return None

def get_all_clients_from_db() -> list:
    """Get all clients from database cache"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, name, email, telegram_chat_id, profit_split, status, 
                   last_sync, balance, equity, weekly_profit, weekly_deals, weekly_share
            FROM clients
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        clients_data = []
        for row in rows:
            clients_data.append({
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "telegram_chat_id": row[3],
                "profit_split": row[4],
                "status": row[5],
                "last_sync": row[6],
                "balance": row[7],
                "equity": row[8],
                "weekly_profit": row[9],
                "weekly_deals": row[10],
                "weekly_share": row[11]
            })
        
        return clients_data
    except Exception as e:
        print(f"❌ Error reading all clients from DB: {e}")
        return []

def populate_clients_from_json():
    """Initial population of clients from JSON to database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for client in clients:
        cursor.execute("""
            INSERT OR IGNORE INTO clients 
            (id, name, email, mt5_login, mt5_password, mt5_server, telegram_chat_id, profit_split, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            client["id"],
            client["name"],
            client.get("email", ""),
            client["mt5_login"],
            client["mt5_password"],
            client["mt5_server"],
            client["telegram_chat_id"],
            client.get("profit_split", 40),
            client.get("status", "active")
        ))
    
    conn.commit()
    conn.close()
    print(f"✅ Populated {len(clients)} clients to database")

# =========================
# BACKGROUND SYNC
# =========================
def background_sync():
    """Background thread to sync all clients periodically"""
    global sync_running
    
    while bot_running:
        try:
            if not sync_running:
                sync_running = True
                print(f"\n[{datetime.now().isoformat()}] Starting sync cycle...")
                
                success_count = 0
                for client in clients:
                    if sync_client_to_db(client):
                        success_count += 1
                    time.sleep(1)  # Small delay between clients
                
                print(f"✅ Sync cycle complete: {success_count}/{len(clients)} clients")
                sync_running = False
            
            # Wait for next sync cycle
            time.sleep(SYNC_INTERVAL_MINUTES * 60)
            
        except Exception as e:
            print(f"❌ Sync error: {e}")
            sync_running = False
            time.sleep(60)  # Wait 1 minute before retry

# =========================
# TELEGRAM
# =========================
def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    requests.post(url, data={"chat_id": chat_id, "text": text})

def is_admin(chat_id):
    return chat_id in ADMIN_IDS

# =========================
# REPORT GENERATION (FROM CACHE)
# =========================
def build_message(r):
    return f"""
Dear {r['name']},

Thank you for trusting FXG Alpha Bot. Please find your weekly P&L details below:

📅 Period:
{week_start.strftime('%d-%m-%Y')} to {week_end.strftime('%d-%m-%Y')}

💰 Your Investment:
${r['balance']:.2f}

📈 Your Profits:
${r['weekly_profit']:.2f}

🤝 Our Profit Split:
${r['weekly_share']:.2f}

🔁 Total Trades:
{r['weekly_deals']}

📊 Last Sync:
{r['last_sync']}

⚠️ Important Note:
This report is generated from cached data synced from MT5.

Regards,
FXG Alpha Bot Team
"""

def run_reports_from_cache():
    """Generate reports from database cache (no MT5 connection needed)"""
    global report_running
    
    if report_running:
        print("Reports already running.")
        return
    
    report_running = True
    
    try:
        print("Generating reports from database cache...")
        clients_data = get_all_clients_from_db()
        
        if not clients_data:
            print("❌ No clients in database cache")
            return
        
        success_count = 0
        for client_data in clients_data:
            try:
                send_message(client_data["telegram_chat_id"], build_message(client_data))
                print(f"✅ SENT: {client_data['name']}")
                success_count += 1
                time.sleep(0.5)  # Small delay to avoid Telegram rate limits
            except Exception as e:
                print(f"❌ Failed to send to {client_data['name']}: {e}")
        
        print(f"✅ Reports sent: {success_count}/{len(clients_data)}")
        
    finally:
        report_running = False

# =========================
# ADMIN PANEL
# =========================
def admin_panel():
    global bot_running
    
    try:
        updates = requests.get(
            f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
        ).json()
        
        if updates.get("result"):
            offset = updates["result"][-1]["update_id"] + 1
        else:
            offset = None
    except:
        offset = None
    
    while bot_running:
        try:
            updates = requests.get(
                f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?offset={offset}"
            ).json()
            
            if "result" in updates:
                for u in updates["result"]:
                    offset = u["update_id"] + 1
                    
                    if "message" not in u:
                        continue
                    
                    msg = u["message"]
                    chat_id = msg["chat"]["id"]
                    text = msg.get("text", "")
                    
                    if not is_admin(chat_id):
                        continue
                    
                    if text == "/status":
                        clients_data = get_all_clients_from_db()
                        last_sync = clients_data[0]["last_sync"] if clients_data else "Never"
                        send_message(chat_id, f"""
✅ Bot Status:
👥 Clients: {len(clients_data)}
🔄 Sync Interval: {SYNC_INTERVAL_MINUTES} min
📊 Last Sync: {last_sync}
🔄 Sync Running: {'Yes' if sync_running else 'No'}
📊 Report Running: {'Yes' if report_running else 'No'}
                        """)
                    
                    elif text == "/run":
                        send_message(chat_id, "🚀 Generating reports from cache...")
                        run_reports_from_cache()
                        send_message(chat_id, "✅ Done")
                    
                    elif text == "/sync":
                        send_message(chat_id, "🔄 Forcing immediate sync...")
                        success_count = 0
                        for client in clients:
                            if sync_client_to_db(client):
                                success_count += 1
                            time.sleep(1)
                        send_message(chat_id, f"✅ Synced {success_count}/{len(clients)} clients")
                    
                    elif text == "/clients":
                        clients_data = get_all_clients_from_db()
                        client_list = "\n".join([f"• {c['name']}: ${c['balance']:.2f}" for c in clients_data[:10]])
                        if len(clients_data) > 10:
                            client_list += f"\n... and {len(clients_data) - 10} more"
                        send_message(chat_id, f"👥 Clients:\n{client_list}")
                    
                    elif text.startswith("/client"):
                        try:
                            name = text.split(" ", 1)[1].lower()
                            clients_data = get_all_clients_from_db()
                            for c in clients_data:
                                if c["name"].lower() == name:
                                    send_message(chat_id, build_message(c))
                                    break
                        except:
                            send_message(chat_id, "❌ Usage: /client name")
                    
                    elif text == "/stop":
                        bot_running = False
                        send_message(chat_id, "🛑 Bot stopped")
                    
                    elif text == "/stats":
                        conn = get_db_connection()
                        cursor = conn.cursor()
                        cursor.execute("SELECT COUNT(*) FROM sync_log WHERE status = 'success'")
                        success_syncs = cursor.fetchone()[0]
                        cursor.execute("SELECT COUNT(*) FROM sync_log WHERE status LIKE 'failed%'")
                        failed_syncs = cursor.fetchone()[0]
                        conn.close()
                        send_message(chat_id, f"""
📊 Sync Statistics:
✅ Successful: {success_syncs}
❌ Failed: {failed_syncs}
📅 Week Range: {week_start.strftime('%d-%m-%Y')} to {week_end.strftime('%d-%m-%Y')}
                        """)
        
        except Exception as e:
            print("Admin panel error:", e)
        
        time.sleep(2)

# =========================
# START
# =========================
if __name__ == "__main__":
    try:
        # Initialize database
        init_database()
        
        # Populate clients from JSON
        populate_clients_from_json()
        
        # Start background sync thread
        threading.Thread(target=background_sync, daemon=True).start()
        
        # Start admin panel
        threading.Thread(target=admin_panel, daemon=True).start()
        
        print("FXG Alpha Bot Started (Database Cache Mode)")
        print(f"Sync interval: {SYNC_INTERVAL_MINUTES} minutes")
        print(f"Monitoring {len(clients)} clients")
        print("Admin panel running...")
        
        while bot_running:
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\nStopping bot...")
    finally:
        print("Bot stopped")
