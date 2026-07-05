import time
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from services.mt5_service import MT5Service
from services.telegram_service import TelegramService
from services.billing_service import BillingService
from database import get_supabase

scheduler = BlockingScheduler()
mt5_service = MT5Service()
telegram_service = TelegramService()
billing_service = BillingService()
supabase = get_supabase()


def sync_mt5_accounts():
    print(f"[{datetime.now()}] Starting MT5 sync...")
    try:
        result = mt5_service.sync_all_clients()
        print(f"✅ MT5 Sync complete: {result['synced']} synced, {result['failed']} failed")
    except Exception as e:
        print(f"❌ MT5 Sync error: {e}")


def send_weekly_reports():
    print(f"[{datetime.now()}] Sending weekly reports...")
    try:
        clients = supabase.table("clients").select("id, name").eq("status", "active").execute()
        
        sent_count = 0
        failed_count = 0
        
        for client in clients.data:
            try:
                if telegram_service.send_weekly_report(client["id"]):
                    sent_count += 1
                    print(f"✅ Sent report to {client['name']}")
                else:
                    failed_count += 1
                    print(f"❌ Failed to send report to {client['name']}")
                
                time.sleep(1)
            except Exception as e:
                failed_count += 1
                print(f"❌ Error sending report to {client['name']}: {e}")
        
        print(f"✅ Weekly reports complete: {sent_count} sent, {failed_count} failed")
    except Exception as e:
        print(f"❌ Weekly reports error: {e}")


def generate_weekly_invoices():
    print(f"[{datetime.now()}] Generating weekly invoices...")
    try:
        result = billing_service.generate_weekly_invoices()
        print(f"✅ Generated {result['generated']} invoices, total: ${result['total_amount']:.2f}")
        
        for invoice in result["invoices"]:
            print(f"  - {invoice['client_name']}: {invoice['invoice_number']} - ${invoice['amount']:.2f}")
    except Exception as e:
        print(f"❌ Invoice generation error: {e}")


def send_payment_reminders():
    print(f"[{datetime.now()}] Checking payment reminders...")
    try:
        reminders = billing_service.get_pending_reminders(days_before=3)
        
        sent_count = 0
        for invoice in reminders:
            try:
                if telegram_service.send_payment_reminder(invoice["id"]):
                    sent_count += 1
                    print(f"✅ Sent reminder for invoice {invoice['invoice_number']}")
                time.sleep(1)
            except Exception as e:
                print(f"❌ Error sending reminder: {e}")
        
        print(f"✅ Payment reminders complete: {sent_count} sent")
    except Exception as e:
        print(f"❌ Payment reminders error: {e}")


def check_overdue_invoices():
    print(f"[{datetime.now()}] Checking overdue invoices...")
    try:
        overdue = billing_service.check_overdue_invoices()
        print(f"✅ Marked {len(overdue)} invoices as overdue")
    except Exception as e:
        print(f"❌ Overdue check error: {e}")


scheduler.add_job(
    sync_mt5_accounts,
    CronTrigger(minute="*/10"),
    id="sync_mt5",
    name="Sync MT5 Accounts",
    replace_existing=True
)

scheduler.add_job(
    send_weekly_reports,
    CronTrigger(day_of_week="mon", hour=9, minute=0),
    id="weekly_reports",
    name="Send Weekly Reports",
    replace_existing=True
)

scheduler.add_job(
    generate_weekly_invoices,
    CronTrigger(day_of_week="mon", hour=0, minute=0),
    id="generate_invoices",
    name="Generate Weekly Invoices",
    replace_existing=True
)

scheduler.add_job(
    send_payment_reminders,
    CronTrigger(hour=10, minute=0),
    id="payment_reminders",
    name="Send Payment Reminders",
    replace_existing=True
)

scheduler.add_job(
    check_overdue_invoices,
    CronTrigger(hour=0, minute=30),
    id="check_overdue",
    name="Check Overdue Invoices",
    replace_existing=True
)


if __name__ == "__main__":
    print("FXG Alpha Background Worker Started")
    print("=" * 50)
    print("Scheduled Jobs:")
    print("  - MT5 Sync: Every 10 minutes")
    print("  - Weekly Reports: Monday 9:00 AM")
    print("  - Generate Invoices: Monday 12:00 AM")
    print("  - Payment Reminders: Daily 10:00 AM")
    print("  - Check Overdue: Daily 12:30 AM")
    print("=" * 50)
    
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("\nShutting down worker...")
        scheduler.shutdown()
