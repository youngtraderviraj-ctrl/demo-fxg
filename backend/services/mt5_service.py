import MetaTrader5 as mt5
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from database import get_supabase
from utils.encryption import decrypt_password


class MT5Service:
    def __init__(self):
        self.supabase = get_supabase()
    
    def initialize_mt5(self) -> bool:
        if not mt5.initialize():
            print(f"MT5 initialization failed: {mt5.last_error()}")
            return False
        return True
    
    def login_to_account(self, login: str, password: str, server: str) -> bool:
        try:
            decrypted_password = decrypt_password(password)
            if not mt5.login(int(login), password=decrypted_password, server=server):
                print(f"Login failed for {login}: {mt5.last_error()}")
                return False
            return True
        except Exception as e:
            print(f"Login error: {e}")
            return False
    
    def get_account_info(self) -> Optional[Dict[str, Any]]:
        account = mt5.account_info()
        if not account:
            return None
        
        return {
            "balance": account.balance,
            "equity": account.equity,
            "margin": account.margin,
            "free_margin": account.free_margin,
            "margin_level": account.margin_level if account.margin > 0 else 0,
            "profit": account.profit
        }
    
    def calculate_weekly_profit(self, week_start: datetime, week_end: datetime) -> Dict[str, Any]:
        deals = mt5.history_deals_get(week_start, week_end)
        
        total_profit = 0.0
        total_deals = 0
        winning_deals = 0
        losing_deals = 0
        
        if deals:
            for deal in deals:
                try:
                    deal_time = datetime.utcfromtimestamp(deal.time)
                    if week_start <= deal_time < week_end:
                        profit = deal.profit + deal.swap + deal.commission
                        total_profit += profit
                        total_deals += 1
                        
                        if profit > 0:
                            winning_deals += 1
                        elif profit < 0:
                            losing_deals += 1
                except Exception as e:
                    print(f"Error processing deal: {e}")
                    continue
        
        return {
            "gross_profit": total_profit,
            "total_deals": total_deals,
            "winning_deals": winning_deals,
            "losing_deals": losing_deals
        }
    
    def sync_client_account(self, client_id: str, client_data: dict) -> bool:
        try:
            if not self.initialize_mt5():
                return False
            
            if not self.login_to_account(
                client_data["mt5_login"],
                client_data["mt5_password"],
                client_data["mt5_server"]
            ):
                mt5.shutdown()
                return False
            
            account_info = self.get_account_info()
            if not account_info:
                mt5.shutdown()
                return False
            
            today = datetime.now()
            current_monday = (today - timedelta(days=today.weekday())).replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            week_start = current_monday - timedelta(days=7)
            week_end = week_start + timedelta(days=5, hours=23, minutes=59, seconds=59)
            
            weekly_profit = self.calculate_weekly_profit(week_start, week_end)
            
            mt5_account_data = {
                "client_id": client_id,
                "login": client_data["mt5_login"],
                "server": client_data["mt5_server"],
                "balance": account_info["balance"],
                "equity": account_info["equity"],
                "margin": account_info["margin"],
                "free_margin": account_info["free_margin"],
                "margin_level": account_info["margin_level"],
                "profit": account_info["profit"],
                "last_sync": datetime.now().isoformat(),
                "sync_status": "success",
                "sync_error": None,
                "updated_at": datetime.now().isoformat()
            }
            
            existing = self.supabase.table("mt5_accounts").select("id").eq("client_id", client_id).execute()
            
            if existing.data:
                self.supabase.table("mt5_accounts").update(mt5_account_data).eq("client_id", client_id).execute()
            else:
                self.supabase.table("mt5_accounts").insert(mt5_account_data).execute()
            
            if weekly_profit["gross_profit"] > 0:
                profit_split = client_data.get("profit_split_percentage", 40)
                admin_share = (weekly_profit["gross_profit"] * profit_split / 100)
                client_share = weekly_profit["gross_profit"] - admin_share
                
                profit_history_data = {
                    "client_id": client_id,
                    "period_type": "weekly",
                    "period_start": week_start.date().isoformat(),
                    "period_end": week_end.date().isoformat(),
                    "gross_profit": weekly_profit["gross_profit"],
                    "total_deals": weekly_profit["total_deals"],
                    "winning_deals": weekly_profit["winning_deals"],
                    "losing_deals": weekly_profit["losing_deals"],
                    "profit_split_percentage": profit_split,
                    "client_share": client_share,
                    "admin_share": admin_share,
                    "balance_start": account_info["balance"] - weekly_profit["gross_profit"],
                    "balance_end": account_info["balance"]
                }
                
                existing_profit = self.supabase.table("profit_history").select("id").eq(
                    "client_id", client_id
                ).eq("period_type", "weekly").eq("period_start", week_start.date().isoformat()).execute()
                
                if not existing_profit.data:
                    self.supabase.table("profit_history").insert(profit_history_data).execute()
            
            mt5.shutdown()
            print(f"✅ Synced client {client_data.get('name', client_id)}")
            return True
            
        except Exception as e:
            print(f"❌ Error syncing client {client_id}: {e}")
            
            try:
                self.supabase.table("mt5_accounts").update({
                    "sync_status": "failed",
                    "sync_error": str(e),
                    "updated_at": datetime.now().isoformat()
                }).eq("client_id", client_id).execute()
            except:
                pass
            
            mt5.shutdown()
            return False
    
    def sync_all_clients(self) -> Dict[str, Any]:
        clients = self.supabase.table("clients").select("*").eq("status", "active").execute()
        
        success_count = 0
        failed_count = 0
        results = []
        
        for client in clients.data:
            if client.get("mt5_login") and client.get("mt5_password") and client.get("mt5_server"):
                if self.sync_client_account(client["id"], client):
                    success_count += 1
                    results.append({
                        "client_id": client["id"],
                        "client_name": client["name"],
                        "status": "success"
                    })
                else:
                    failed_count += 1
                    results.append({
                        "client_id": client["id"],
                        "client_name": client["name"],
                        "status": "failed"
                    })
        
        return {
            "synced": success_count,
            "failed": failed_count,
            "results": results
        }
