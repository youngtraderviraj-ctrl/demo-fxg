from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"


class ClientStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class InvoiceStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class MessageType(str, Enum):
    BROADCAST = "broadcast"
    INDIVIDUAL = "individual"
    AUTOMATED = "automated"
    REMINDER = "reminder"


class PeriodType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: UUID4
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    mt5_login: Optional[str] = None
    mt5_password: Optional[str] = None
    mt5_server: Optional[str] = None
    profit_split_percentage: int = Field(default=40, ge=0, le=100)
    wallet_address: Optional[str] = None
    status: ClientStatus = ClientStatus.ACTIVE
    notes: Optional[str] = None
    tags: Optional[List[str]] = []


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    mt5_login: Optional[str] = None
    mt5_password: Optional[str] = None
    mt5_server: Optional[str] = None
    profit_split_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    wallet_address: Optional[str] = None
    status: Optional[ClientStatus] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class Client(ClientBase):
    id: UUID4
    user_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MT5AccountBase(BaseModel):
    login: str
    server: str
    balance: float = 0
    equity: float = 0
    margin: float = 0
    free_margin: float = 0
    margin_level: float = 0
    profit: float = 0


class MT5Account(MT5AccountBase):
    id: UUID4
    client_id: UUID4
    last_sync: Optional[datetime] = None
    sync_status: str = "pending"
    sync_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfitHistoryBase(BaseModel):
    period_type: PeriodType
    period_start: date
    period_end: date
    gross_profit: float
    total_deals: int = 0
    winning_deals: int = 0
    losing_deals: int = 0
    profit_split_percentage: int
    client_share: float
    admin_share: float
    balance_start: Optional[float] = None
    balance_end: Optional[float] = None


class ProfitHistoryCreate(ProfitHistoryBase):
    client_id: UUID4


class ProfitHistory(ProfitHistoryBase):
    id: UUID4
    client_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    amount: float
    currency: str = "USDT"
    period_start: date
    period_end: date
    due_date: date
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    client_id: UUID4


class InvoiceUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[date] = None
    status: Optional[InvoiceStatus] = None
    notes: Optional[str] = None


class Invoice(InvoiceBase):
    id: UUID4
    client_id: UUID4
    invoice_number: str
    status: InvoiceStatus
    payment_date: Optional[datetime] = None
    metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    transaction_hash: str
    amount: float
    currency: str = "USDT"
    wallet_from: str
    wallet_to: str
    blockchain: str = "TRON"


class TransactionCreate(TransactionBase):
    client_id: UUID4
    invoice_id: Optional[UUID4] = None


class Transaction(TransactionBase):
    id: UUID4
    invoice_id: Optional[UUID4] = None
    client_id: UUID4
    status: TransactionStatus
    confirmations: int = 0
    confirmed_at: Optional[datetime] = None
    block_number: Optional[int] = None
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TelegramLogBase(BaseModel):
    message_type: MessageType
    subject: Optional[str] = None
    message_text: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None


class TelegramLogCreate(TelegramLogBase):
    client_id: Optional[UUID4] = None


class TelegramLog(TelegramLogBase):
    id: UUID4
    client_id: Optional[UUID4] = None
    sent_at: datetime
    status: str
    error_message: Optional[str] = None
    telegram_message_id: Optional[str] = None
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DashboardStats(BaseModel):
    total_clients: int
    active_clients: int
    suspended_clients: int
    inactive_clients: int
    total_weekly_profit: float
    total_fees_due: float
    total_collected: float
    pending_invoices: int
    overdue_invoices: int
    collection_rate: float


class ClientDashboard(BaseModel):
    client: Client
    account: Optional[MT5Account] = None
    performance: dict
    recent_invoices: List[Invoice]


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    data: List
    pagination: dict
