import MetaTrader5 as mt5
import json
import requests
import threading
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache

# =========================
# CONFIG
# =========================
BOT_TOKEN = "8828020135:AAHiNdeOs1t31WyzdoOtB3IXt57K_dxm23E"
ADMIN_IDS = [6575545803, 7760036118]
MAX_WORKERS = 10  # Process 10 clients simultaneously
bot_running = True
report_running = False
mt5_initialized = False  # Global MT5 initialization state

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
# MT5 CONNECTION POOL
# =========================
mt5_lock = threading.Lock()

def ensure_mt5_initialized():
    """Ensure MT5 is initialized (thread-safe)"""
    global mt5_initialized
    with mt5_lock:
        if not mt5_initialized:
            if not mt5.initialize():
                print("❌ MT5 init failed")
                return False
            mt5_initialized = True
    return True

def get_account_info_cached(client_id):
    """Cache account info to reduce MT5 calls"""
    # In production, use Redis or database cache
    # For now, this is a placeholder for caching logic
    return None

# =========================
# TELEGRAM
# =========================
def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    requests.post(url, data={"chat_id": chat_id, "text": text})

def is_admin(chat_id):
    return chat_id in ADMIN_IDS

# =========================
# OPTIMIZED SINGLE CLIENT
# =========================
def run_single_client_optimized(client):
    """
    Optimized version: 
    - Reuses global MT5 initialization
    - Only logs in/out per client, no full shutdown
    - Thread-safe with locks
    """
    if not ensure_mt5_initialized():
        return None

    with mt5_lock:  # Prevent concurrent logins
        try:
            # Login to client account
            if not mt5.login(
                client["mt5_login"],
                password=client["mt5_password"],
                server=client["mt5_server"]
            ):
                print(f"❌ Login failed: {client['name']}")
                return None

            # Get account info
            acc = mt5.account_info()
            if not acc:
                print(f"❌ No account info: {client['name']}")
                return None

            balance = acc.balance
            
            # Calculate profit
            deals = mt5.history_deals_get(week_start, week_end)
            profit = 0.0
            deal_count = 0
            
            if deals:
                for d in deals:
                    try:
                        t = datetime.utcfromtimestamp(d.time)
                        if week_start <= t < week_end:
                            profit += d.profit + d.swap + d.commission
                            deal_count += 1
                    except:
                        continue

            # Calculate split
            split = client.get("profit_split", 40)
            share = (profit * split / 100) if profit > 0 else 0

            return {
                "name": client["name"],
                "balance": balance,
                "profit": profit,
                "deals": deal_count,
                "share": share
            }

        except Exception as e:
            print(f"❌ Error processing {client['name']}: {e}")
            return None

# =========================
# PARALLEL REPORTS
# =========================
def run_reports_parallel():
    """Process multiple clients in parallel"""
    global report_running

    if report_running:
        print("Reports already running.")
        return

    report_running = True

    try:
        print(f"Processing {len(clients)} clients with {MAX_WORKERS} workers...")
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Submit all client tasks
            future_to_client = {
                executor.submit(run_single_client_optimized, client): client
                for client in clients
            }

            # Process results as they complete
            for future in as_completed(future_to_client):
                client = future_to_client[future]
                try:
                    result = future.result()
                    if result:
                        send_message(client["telegram_chat_id"], build_message(result))
                        print(f"✅ SENT: {client['name']}")
                    else:
                        print(f"❌ FAILED: {client['name']}")
                except Exception as e:
                    print(f"❌ Exception for {client['name']}: {e}")

    finally:
        report_running = False

# =========================
# MESSAGE TEMPLATE
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
${r['profit']:.2f}

🤝 Our Profit Split:
${r['share']:.2f}

🔁 Total Trades:
{r['deals']}

⚠️ Important Note:
This report is generated from MT5 trading activity.

Regards,
FXG Alpha Bot Team
"""

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
                        send_message(chat_id, f"✅ Bot running\n👥 Clients: {len(clients)}\n⚡ Workers: {MAX_WORKERS}")

                    elif text == "/run":
                        send_message(chat_id, "🚀 Running parallel reports...")
                        run_reports_parallel()
                        send_message(chat_id, "✅ Done")

                    elif text == "/clients":
                        send_message(chat_id, f"👥 Clients: {len(clients)}")

                    elif text.startswith("/client"):
                        try:
                            name = text.split(" ", 1)[1].lower()
                            for c in clients:
                                if c["name"].lower() == name:
                                    result = run_single_client_optimized(c)
                                    if result:
                                        send_message(chat_id, build_message(result))
                        except:
                            send_message(chat_id, "❌ Usage: /client name")

                    elif text == "/stop":
                        bot_running = False
                        send_message(chat_id, "🛑 Bot stopped")

        except Exception as e:
            print("Admin panel error:", e)

        time.sleep(2)

# =========================
# CLEANUP
# =========================
def cleanup():
    """Cleanup MT5 connection on exit"""
    global mt5_initialized
    if mt5_initialized:
        mt5.shutdown()
        mt5_initialized = False

# =========================
# START
# =========================
if __name__ == "__main__":
    try:
        # Initialize MT5 once globally
        if not ensure_mt5_initialized():
            print("Failed to initialize MT5")
            exit(1)

        threading.Thread(target=admin_panel, daemon=True).start()

        print("FXG Alpha Bot Started (Optimized)")
        print(f"Processing {len(clients)} clients with {MAX_WORKERS} parallel workers")
        print("Admin panel running...")
        print("Sending weekly reports...")
        run_reports_parallel()
        print("Waiting for admin commands...")

        while bot_running:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping bot...")
    finally:
        cleanup()
        print("Cleanup complete")
