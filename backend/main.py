from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta

from config import settings
from database import get_supabase
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_current_admin,
    decode_token
)
from models import (
    UserLogin,
    UserCreate,
    TokenResponse,
    User,
    ClientCreate,
    ClientUpdate,
    Client,
    InvoiceCreate,
    InvoiceUpdate,
    ChangePasswordRequest,
    DashboardStats,
    PaginationParams
)
from services.mt5_service import MT5Service
from services.telegram_service import TelegramService
from services.billing_service import BillingService
from utils.encryption import encrypt_password

app = FastAPI(
    title="FXG Alpha Master Dashboard API",
    description="API for managing trading fund clients with MT5 integration",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase()
mt5_service = MT5Service()
telegram_service = TelegramService()
billing_service = BillingService()


@app.get("/")
async def root():
    return {
        "message": "FXG Alpha Master Dashboard API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    result = supabase.table("users").select("*").eq("email", credentials.email).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user_data = result.data[0]
    
    if not verify_password(credentials.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user_data["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    supabase.table("users").update({
        "last_login": datetime.now().isoformat()
    }).eq("id", user_data["id"]).execute()
    
    access_token = create_access_token(data={"sub": user_data["id"]})
    refresh_token = create_refresh_token(data={"sub": user_data["id"]})
    
    user = User(**user_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,
        user=user
    )


@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    user_id = payload.get("sub")
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_EXPIRY_MINUTES * 60
    }


@app.post("/api/auth/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user)
):
    result = supabase.table("users").select("password_hash").eq("id", str(current_user.id)).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(request.current_password, result.data[0]["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = get_password_hash(request.new_password)
    supabase.table("users").update({"password_hash": new_hash}).eq("id", str(current_user.id)).execute()
    
    return {"message": "Password changed successfully"}


@app.get("/api/admin/clients")
async def get_clients(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    query = supabase.table("clients").select("*", count="exact")
    
    if status:
        query = query.eq("status", status)
    
    if search:
        query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
    
    offset = (page - 1) * limit
    result = query.range(offset, offset + limit - 1).execute()
    
    return {
        "data": result.data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": result.count,
            "pages": (result.count + limit - 1) // limit if result.count else 0
        }
    }


@app.post("/api/admin/clients", response_model=Client)
async def create_client(
    client: ClientCreate,
    current_user: User = Depends(get_current_admin)
):
    user_data = {
        "email": client.email or f"client_{datetime.now().timestamp()}@fxgalpha.com",
        "password_hash": get_password_hash("changeme123"),
        "role": "client",
        "is_active": True
    }
    
    user_result = supabase.table("users").insert(user_data).execute()
    
    if not user_result.data:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    user_id = user_result.data[0]["id"]
    
    client_data = client.dict()
    client_data["user_id"] = user_id
    
    if client_data.get("mt5_password"):
        client_data["mt5_password"] = encrypt_password(client_data["mt5_password"])
    
    result = supabase.table("clients").insert(client_data).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create client")
    
    return Client(**result.data[0])


@app.get("/api/admin/clients/{client_id}")
async def get_client(
    client_id: str,
    current_user: User = Depends(get_current_admin)
):
    client = supabase.table("clients").select("*").eq("id", client_id).execute()
    
    if not client.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    mt5_account = supabase.table("mt5_accounts").select("*").eq("client_id", client_id).execute()
    
    recent_profits = supabase.table("profit_history").select("*").eq(
        "client_id", client_id
    ).order("period_start", desc=True).limit(5).execute()
    
    return {
        **client.data[0],
        "mt5_account": mt5_account.data[0] if mt5_account.data else None,
        "recent_profits": recent_profits.data
    }


@app.put("/api/admin/clients/{client_id}")
async def update_client(
    client_id: str,
    client_update: ClientUpdate,
    current_user: User = Depends(get_current_admin)
):
    update_data = client_update.dict(exclude_unset=True)
    
    if "mt5_password" in update_data and update_data["mt5_password"]:
        update_data["mt5_password"] = encrypt_password(update_data["mt5_password"])
    
    result = supabase.table("clients").update(update_data).eq("id", client_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return result.data[0]


@app.delete("/api/admin/clients/{client_id}")
async def delete_client(
    client_id: str,
    current_user: User = Depends(get_current_admin)
):
    result = supabase.table("clients").update({"status": "inactive"}).eq("id", client_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client deleted successfully"}


@app.get("/api/admin/analytics/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_admin)):
    clients = supabase.table("clients").select("status").execute()
    
    total_clients = len(clients.data)
    active_clients = len([c for c in clients.data if c["status"] == "active"])
    suspended_clients = len([c for c in clients.data if c["status"] == "suspended"])
    inactive_clients = len([c for c in clients.data if c["status"] == "inactive"])
    
    today = datetime.now()
    current_monday = (today - timedelta(days=today.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = current_monday - timedelta(days=7)
    
    weekly_profits = supabase.table("profit_history").select("admin_share").eq(
        "period_type", "weekly"
    ).eq("period_start", week_start.date().isoformat()).execute()
    
    total_weekly_profit = sum(p["admin_share"] for p in weekly_profits.data)
    
    invoices = supabase.table("invoices").select("amount, status").execute()
    
    pending_invoices = len([i for i in invoices.data if i["status"] == "pending"])
    overdue_invoices = len([i for i in invoices.data if i["status"] == "overdue"])
    
    total_fees_due = sum(i["amount"] for i in invoices.data if i["status"] in ["pending", "overdue"])
    total_collected = sum(i["amount"] for i in invoices.data if i["status"] == "paid"])
    
    collection_rate = (total_collected / (total_collected + total_fees_due) * 100) if (total_collected + total_fees_due) > 0 else 0
    
    return DashboardStats(
        total_clients=total_clients,
        active_clients=active_clients,
        suspended_clients=suspended_clients,
        inactive_clients=inactive_clients,
        total_weekly_profit=total_weekly_profit,
        total_fees_due=total_fees_due,
        total_collected=total_collected,
        pending_invoices=pending_invoices,
        overdue_invoices=overdue_invoices,
        collection_rate=round(collection_rate, 2)
    )


@app.post("/api/admin/mt5/sync")
async def sync_mt5_accounts(
    client_ids: Optional[List[str]] = None,
    current_user: User = Depends(get_current_admin)
):
    if client_ids:
        success_count = 0
        failed_count = 0
        results = []
        
        for client_id in client_ids:
            client = supabase.table("clients").select("*").eq("id", client_id).execute()
            if client.data:
                if mt5_service.sync_client_account(client_id, client.data[0]):
                    success_count += 1
                    results.append({"client_id": client_id, "status": "success"})
                else:
                    failed_count += 1
                    results.append({"client_id": client_id, "status": "failed"})
        
        return {
            "synced": success_count,
            "failed": failed_count,
            "results": results
        }
    else:
        return mt5_service.sync_all_clients()


@app.get("/api/admin/invoices")
async def get_invoices(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    query = supabase.table("invoices").select("*, clients(name, email)", count="exact")
    
    if status:
        query = query.eq("status", status)
    
    if client_id:
        query = query.eq("client_id", client_id)
    
    offset = (page - 1) * limit
    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    
    return {
        "data": result.data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": result.count,
            "pages": (result.count + limit - 1) // limit if result.count else 0
        }
    }


@app.post("/api/admin/invoices")
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(get_current_admin)
):
    result = billing_service.create_invoice(
        client_id=str(invoice.client_id),
        amount=invoice.amount,
        period_start=invoice.period_start.isoformat(),
        period_end=invoice.period_end.isoformat(),
        notes=invoice.notes
    )
    
    if result:
        telegram_service.send_invoice_notification(result["id"])
    
    return result


@app.post("/api/admin/invoices/generate-weekly")
async def generate_weekly_invoices(current_user: User = Depends(get_current_admin)):
    result = billing_service.generate_weekly_invoices()
    
    for invoice in result["invoices"]:
        pass
    
    return result


@app.post("/api/admin/telegram/send")
async def send_telegram_message(
    client_id: str,
    message: str,
    subject: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    success = telegram_service.send_to_client(client_id, message, subject)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to send message")
    
    return {"message": "Message sent successfully"}


@app.post("/api/admin/telegram/broadcast")
async def broadcast_message(
    message: str,
    client_ids: Optional[List[str]] = None,
    filter_status: Optional[str] = None,
    subject: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    result = telegram_service.broadcast_message(message, client_ids, filter_status, subject)
    return result


@app.get("/api/client/dashboard")
async def get_client_dashboard(current_user: User = Depends(get_current_user)):
    client = supabase.table("clients").select("*").eq("user_id", str(current_user.id)).execute()
    
    if not client.data:
        raise HTTPException(status_code=404, detail="Client profile not found")
    
    client_data = client.data[0]
    client_id = client_data["id"]
    
    mt5_account = supabase.table("mt5_accounts").select("*").eq("client_id", client_id).execute()
    
    recent_invoices = supabase.table("invoices").select("*").eq(
        "client_id", client_id
    ).order("created_at", desc=True).limit(5).execute()
    
    return {
        "client": client_data,
        "account": mt5_account.data[0] if mt5_account.data else None,
        "recent_invoices": recent_invoices.data
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
