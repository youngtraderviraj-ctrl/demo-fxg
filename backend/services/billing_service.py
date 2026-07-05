from datetime import datetime, timedelta
from typing import Dict, Any, List
from database import get_supabase


class BillingService:
    def __init__(self):
        self.supabase = get_supabase()
    
    def generate_invoice_number(self) -> str:
        year = datetime.now().year
        
        result = self.supabase.table("invoices").select("invoice_number").like(
            "invoice_number", f"INV-{year}-%"
        ).order("invoice_number", desc=True).limit(1).execute()
        
        if result.data:
            last_number = int(result.data[0]["invoice_number"].split("-")[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        
        return f"INV-{year}-{str(new_number).zfill(4)}"
    
    def create_invoice(
        self,
        client_id: str,
        amount: float,
        period_start: str,
        period_end: str,
        due_days: int = 7,
        notes: str = None
    ) -> Dict[str, Any]:
        invoice_number = self.generate_invoice_number()
        due_date = (datetime.now() + timedelta(days=due_days)).date().isoformat()
        
        invoice_data = {
            "client_id": client_id,
            "invoice_number": invoice_number,
            "amount": amount,
            "currency": "USDT",
            "period_start": period_start,
            "period_end": period_end,
            "due_date": due_date,
            "status": "pending",
            "notes": notes
        }
        
        result = self.supabase.table("invoices").insert(invoice_data).execute()
        
        return result.data[0] if result.data else None
    
    def generate_weekly_invoices(self) -> Dict[str, Any]:
        today = datetime.now()
        current_monday = (today - timedelta(days=today.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        week_start = current_monday - timedelta(days=7)
        week_end = week_start + timedelta(days=5, hours=23, minutes=59, seconds=59)
        
        profit_history = self.supabase.table("profit_history").select(
            "*, clients(id, name, email)"
        ).eq("period_type", "weekly").eq(
            "period_start", week_start.date().isoformat()
        ).gt("admin_share", 0).execute()
        
        generated_count = 0
        total_amount = 0
        invoices = []
        
        for profit in profit_history.data:
            existing = self.supabase.table("invoices").select("id").eq(
                "client_id", profit["client_id"]
            ).eq("period_start", week_start.date().isoformat()).execute()
            
            if not existing.data:
                invoice = self.create_invoice(
                    client_id=profit["client_id"],
                    amount=profit["admin_share"],
                    period_start=week_start.date().isoformat(),
                    period_end=week_end.date().isoformat(),
                    notes=f"Performance fee for week {week_start.strftime('%d-%m-%Y')} to {week_end.strftime('%d-%m-%Y')}"
                )
                
                if invoice:
                    generated_count += 1
                    total_amount += profit["admin_share"]
                    invoices.append({
                        "client_name": profit["clients"]["name"],
                        "invoice_number": invoice["invoice_number"],
                        "amount": profit["admin_share"]
                    })
        
        return {
            "generated": generated_count,
            "total_amount": total_amount,
            "invoices": invoices
        }
    
    def mark_invoice_paid(
        self,
        invoice_id: str,
        transaction_hash: str = None,
        payment_date: datetime = None
    ) -> bool:
        if not payment_date:
            payment_date = datetime.now()
        
        update_data = {
            "status": "paid",
            "payment_date": payment_date.isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        if transaction_hash:
            update_data["metadata"] = {"transaction_hash": transaction_hash}
        
        result = self.supabase.table("invoices").update(update_data).eq("id", invoice_id).execute()
        
        return bool(result.data)
    
    def check_overdue_invoices(self) -> List[Dict[str, Any]]:
        today = datetime.now().date().isoformat()
        
        result = self.supabase.table("invoices").select("*").eq(
            "status", "pending"
        ).lt("due_date", today).execute()
        
        overdue_invoices = []
        
        for invoice in result.data:
            self.supabase.table("invoices").update({
                "status": "overdue"
            }).eq("id", invoice["id"]).execute()
            
            overdue_invoices.append(invoice)
        
        return overdue_invoices
    
    def get_pending_reminders(self, days_before: int = 3) -> List[Dict[str, Any]]:
        reminder_date = (datetime.now() + timedelta(days=days_before)).date().isoformat()
        
        result = self.supabase.table("invoices").select(
            "*, clients(*)"
        ).eq("status", "pending").eq("due_date", reminder_date).execute()
        
        return result.data
