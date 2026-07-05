import requests
from typing import Optional, List, Dict, Any
from datetime import datetime
from config import settings
from database import get_supabase


class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.supabase = get_supabase()
    
    def send_message(
        self,
        chat_id: str,
        text: str,
        parse_mode: str = "HTML",
        disable_web_page_preview: bool = False
    ) -> Dict[str, Any]:
        url = f"{self.base_url}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_photo(self, chat_id: str, photo_url: str, caption: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/sendPhoto"
        payload = {
            "chat_id": chat_id,
            "photo": photo_url
        }
        if caption:
            payload["caption"] = caption
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_to_client(
        self,
        client_id: str,
        message: str,
        subject: Optional[str] = None,
        media_url: Optional[str] = None,
        media_type: Optional[str] = None
    ) -> bool:
        client = self.supabase.table("clients").select("telegram_chat_id, name").eq("id", client_id).execute()
        
        if not client.data or not client.data[0].get("telegram_chat_id"):
            print(f"No Telegram chat ID for client {client_id}")
            return False
        
        chat_id = client.data[0]["telegram_chat_id"]
        
        if media_url and media_type == "photo":
            result = self.send_photo(chat_id, media_url, message)
        else:
            result = self.send_message(chat_id, message)
        
        log_data = {
            "client_id": client_id,
            "message_type": "individual",
            "subject": subject,
            "message_text": message,
            "media_url": media_url,
            "media_type": media_type,
            "sent_at": datetime.now().isoformat(),
            "status": "sent" if result["success"] else "failed",
            "error_message": result.get("error"),
            "telegram_message_id": result.get("data", {}).get("result", {}).get("message_id")
        }
        
        self.supabase.table("telegram_logs").insert(log_data).execute()
        
        return result["success"]
    
    def broadcast_message(
        self,
        message: str,
        client_ids: Optional[List[str]] = None,
        filter_status: Optional[str] = None,
        subject: Optional[str] = None
    ) -> Dict[str, Any]:
        query = self.supabase.table("clients").select("id, telegram_chat_id, name")
        
        if client_ids:
            query = query.in_("id", client_ids)
        elif filter_status:
            query = query.eq("status", filter_status)
        
        clients = query.execute()
        
        sent_count = 0
        failed_count = 0
        
        for client in clients.data:
            if client.get("telegram_chat_id"):
                if self.send_to_client(client["id"], message, subject):
                    sent_count += 1
                else:
                    failed_count += 1
        
        return {
            "sent": sent_count,
            "failed": failed_count,
            "total": len(clients.data)
        }
    
    def send_weekly_report(self, client_id: str) -> bool:
        client = self.supabase.table("clients").select("*").eq("id", client_id).execute()
        
        if not client.data:
            return False
        
        client_data = client.data[0]
        
        mt5_account = self.supabase.table("mt5_accounts").select("*").eq("client_id", client_id).execute()
        
        if not mt5_account.data:
            return False
        
        account_data = mt5_account.data[0]
        
        from datetime import timedelta
        today = datetime.now()
        current_monday = (today - timedelta(days=today.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        week_start = current_monday - timedelta(days=7)
        week_end = week_start + timedelta(days=5, hours=23, minutes=59, seconds=59)
        
        profit_history = self.supabase.table("profit_history").select("*").eq(
            "client_id", client_id
        ).eq("period_type", "weekly").eq("period_start", week_start.date().isoformat()).execute()
        
        if profit_history.data:
            profit_data = profit_history.data[0]
        else:
            profit_data = {
                "gross_profit": 0,
                "total_deals": 0,
                "admin_share": 0
            }
        
        message = f"""
<b>📊 Weekly Performance Report</b>

Dear {client_data['name']},

Thank you for trusting FXG Alpha Bot. Here's your weekly P&L summary:

📅 <b>Period:</b>
{week_start.strftime('%d-%m-%Y')} to {week_end.strftime('%d-%m-%Y')}

💰 <b>Your Investment:</b>
${account_data['balance']:.2f}

📈 <b>Weekly Profit:</b>
${profit_data['gross_profit']:.2f}

🤝 <b>Performance Fee ({client_data['profit_split_percentage']}%):</b>
${profit_data['admin_share']:.2f}

🔁 <b>Total Trades:</b>
{profit_data['total_deals']}

📊 <b>Current Equity:</b>
${account_data['equity']:.2f}

⏰ <b>Last Updated:</b>
{account_data.get('last_sync', 'N/A')}

<i>This report is automatically generated from your MT5 account.</i>

Best regards,
<b>FXG Alpha Bot Team</b>
"""
        
        return self.send_to_client(
            client_id,
            message,
            subject="Weekly Performance Report"
        )
    
    def send_invoice_notification(self, invoice_id: str) -> bool:
        invoice = self.supabase.table("invoices").select("*, clients(*)").eq("id", invoice_id).execute()
        
        if not invoice.data:
            return False
        
        invoice_data = invoice.data[0]
        client_data = invoice_data["clients"]
        
        message = f"""
<b>💳 New Invoice</b>

Dear {client_data['name']},

A new invoice has been generated for your account.

<b>Invoice Details:</b>
📄 Invoice #: {invoice_data['invoice_number']}
💵 Amount: ${invoice_data['amount']:.2f} {invoice_data['currency']}
📅 Period: {invoice_data['period_start']} to {invoice_data['period_end']}
⏰ Due Date: {invoice_data['due_date']}

<b>Payment Address:</b>
<code>{client_data.get('wallet_address', 'Not set')}</code>

Please make the payment before the due date to avoid service interruption.

Best regards,
<b>FXG Alpha Bot Team</b>
"""
        
        return self.send_to_client(
            invoice_data['client_id'],
            message,
            subject="New Invoice"
        )
    
    def send_payment_reminder(self, invoice_id: str) -> bool:
        invoice = self.supabase.table("invoices").select("*, clients(*)").eq("id", invoice_id).execute()
        
        if not invoice.data:
            return False
        
        invoice_data = invoice.data[0]
        client_data = invoice_data["clients"]
        
        days_until_due = (datetime.fromisoformat(invoice_data['due_date']) - datetime.now()).days
        
        message = f"""
<b>⚠️ Payment Reminder</b>

Dear {client_data['name']},

This is a friendly reminder about your pending invoice.

<b>Invoice Details:</b>
📄 Invoice #: {invoice_data['invoice_number']}
💵 Amount: ${invoice_data['amount']:.2f} {invoice_data['currency']}
⏰ Due in: {days_until_due} days ({invoice_data['due_date']})

<b>Payment Address:</b>
<code>{client_data.get('wallet_address', 'Not set')}</code>

Please make the payment to avoid service interruption.

Best regards,
<b>FXG Alpha Bot Team</b>
"""
        
        return self.send_to_client(
            invoice_data['client_id'],
            message,
            subject="Payment Reminder"
        )
