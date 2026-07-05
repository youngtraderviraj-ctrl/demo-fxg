# API Documentation

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.fxgalpha.com/api
```

## Authentication

All API endpoints (except `/auth/login`) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Token Refresh

Tokens expire after 15 minutes. Use the refresh endpoint to get a new token without re-authenticating.

---

## Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "admin@fxgalpha.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "admin@fxgalpha.com",
    "role": "admin"
  }
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

### POST /auth/logout

Invalidate current tokens.

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

### POST /auth/change-password

Change user password.

**Request:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## Admin - Client Management

### GET /admin/clients

Get list of all clients with pagination and filtering.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `status` (string): Filter by status (active/suspended/inactive)
- `search` (string): Search by name or email
- `sort_by` (string): Sort field (default: created_at)
- `sort_order` (string): Sort order (asc/desc)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "telegram_chat_id": "123456789",
      "mt5_login": "12345678",
      "mt5_server": "MetaQuotes-Demo",
      "profit_split_percentage": 40,
      "wallet_address": "TRX...",
      "status": "active",
      "notes": "VIP client",
      "tags": ["vip", "high-volume"],
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-07-03T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

### POST /admin/clients

Create a new client.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "telegram_chat_id": "123456789",
  "mt5_login": "12345678",
  "mt5_password": "password123",
  "mt5_server": "MetaQuotes-Demo",
  "profit_split_percentage": 40,
  "wallet_address": "TRX...",
  "status": "active",
  "notes": "VIP client",
  "tags": ["vip"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-07-03T00:00:00Z"
}
```

---

### GET /admin/clients/{id}

Get detailed information about a specific client.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "telegram_chat_id": "123456789",
  "mt5_login": "12345678",
  "mt5_server": "MetaQuotes-Demo",
  "profit_split_percentage": 40,
  "wallet_address": "TRX...",
  "status": "active",
  "notes": "VIP client",
  "tags": ["vip"],
  "mt5_account": {
    "balance": 10000.00,
    "equity": 10500.00,
    "margin": 1000.00,
    "free_margin": 9500.00,
    "profit": 500.00,
    "last_sync": "2026-07-03T00:00:00Z"
  },
  "recent_profits": [
    {
      "period_start": "2026-06-24",
      "period_end": "2026-06-30",
      "gross_profit": 1000.00,
      "admin_share": 400.00
    }
  ],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-07-03T00:00:00Z"
}
```

---

### PUT /admin/clients/{id}

Update client information.

**Request:**
```json
{
  "name": "John Doe Updated",
  "profit_split_percentage": 45,
  "status": "active",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe Updated",
  "updated_at": "2026-07-03T00:00:00Z"
}
```

---

### DELETE /admin/clients/{id}

Delete a client (soft delete - marks as inactive).

**Response:**
```json
{
  "message": "Client deleted successfully"
}
```

---

### POST /admin/clients/import

Import clients from CSV file.

**Request:**
```
Content-Type: multipart/form-data
file: clients.csv
```

**CSV Format:**
```csv
name,email,telegram_chat_id,mt5_login,mt5_password,mt5_server,profit_split_percentage
John Doe,john@example.com,123456789,12345678,password,MetaQuotes-Demo,40
```

**Response:**
```json
{
  "imported": 10,
  "failed": 2,
  "errors": [
    {
      "row": 3,
      "error": "Duplicate email"
    }
  ]
}
```

---

### GET /admin/clients/export

Export clients to CSV.

**Query Parameters:**
- `status` (string): Filter by status
- `format` (string): Export format (csv/xlsx)

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="clients_2026-07-03.csv"

[CSV data]
```

---

## Admin - Billing

### GET /admin/invoices

Get list of invoices.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (string): Filter by status
- `client_id` (uuid): Filter by client
- `from_date` (date): Filter from date
- `to_date` (date): Filter to date

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "client_name": "John Doe",
      "invoice_number": "INV-2026-0001",
      "amount": 400.00,
      "currency": "USDT",
      "period_start": "2026-06-24",
      "period_end": "2026-06-30",
      "due_date": "2026-07-07",
      "status": "pending",
      "created_at": "2026-07-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### POST /admin/invoices

Create a new invoice.

**Request:**
```json
{
  "client_id": "uuid",
  "amount": 400.00,
  "period_start": "2026-06-24",
  "period_end": "2026-06-30",
  "due_date": "2026-07-07",
  "notes": "Weekly profit share"
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoice_number": "INV-2026-0001",
  "amount": 400.00,
  "status": "pending",
  "created_at": "2026-07-01T00:00:00Z"
}
```

---

### GET /admin/invoices/{id}

Get invoice details.

**Response:**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "client": {
    "name": "John Doe",
    "email": "john@example.com",
    "wallet_address": "TRX..."
  },
  "invoice_number": "INV-2026-0001",
  "amount": 400.00,
  "currency": "USDT",
  "period_start": "2026-06-24",
  "period_end": "2026-06-30",
  "due_date": "2026-07-07",
  "status": "pending",
  "payment_date": null,
  "transactions": [],
  "notes": "Weekly profit share",
  "created_at": "2026-07-01T00:00:00Z"
}
```

---

### PUT /admin/invoices/{id}

Update invoice.

**Request:**
```json
{
  "amount": 450.00,
  "due_date": "2026-07-10",
  "notes": "Updated amount"
}
```

---

### DELETE /admin/invoices/{id}

Cancel invoice.

**Response:**
```json
{
  "message": "Invoice cancelled successfully"
}
```

---

### POST /admin/invoices/{id}/mark-paid

Manually mark invoice as paid.

**Request:**
```json
{
  "payment_date": "2026-07-05T10:30:00Z",
  "transaction_hash": "0x123...",
  "notes": "Manual payment verification"
}
```

**Response:**
```json
{
  "message": "Invoice marked as paid",
  "invoice": {
    "id": "uuid",
    "status": "paid",
    "payment_date": "2026-07-05T10:30:00Z"
  }
}
```

---

### GET /admin/invoices/{id}/pdf

Download invoice as PDF.

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2026-0001.pdf"

[PDF data]
```

---

### POST /admin/invoices/generate-weekly

Generate invoices for all clients for the previous week.

**Response:**
```json
{
  "generated": 45,
  "total_amount": 18000.00,
  "invoices": [
    {
      "client_name": "John Doe",
      "invoice_number": "INV-2026-0001",
      "amount": 400.00
    }
  ]
}
```

---

## Admin - Analytics

### GET /admin/analytics/dashboard

Get dashboard summary statistics.

**Response:**
```json
{
  "total_clients": 100,
  "active_clients": 85,
  "suspended_clients": 10,
  "inactive_clients": 5,
  "total_weekly_profit": 25000.00,
  "total_fees_due": 10000.00,
  "total_collected": 8500.00,
  "pending_invoices": 15,
  "overdue_invoices": 3,
  "collection_rate": 85.0,
  "top_clients": [
    {
      "name": "John Doe",
      "weekly_profit": 2000.00,
      "admin_share": 800.00
    }
  ]
}
```

---

### GET /admin/analytics/revenue

Get revenue analytics.

**Query Parameters:**
- `period` (string): daily/weekly/monthly/yearly
- `from_date` (date): Start date
- `to_date` (date): End date

**Response:**
```json
{
  "period": "monthly",
  "data": [
    {
      "period": "2026-01",
      "gross_profit": 100000.00,
      "admin_share": 40000.00,
      "collected": 35000.00,
      "pending": 5000.00
    },
    {
      "period": "2026-02",
      "gross_profit": 120000.00,
      "admin_share": 48000.00,
      "collected": 45000.00,
      "pending": 3000.00
    }
  ],
  "totals": {
    "gross_profit": 220000.00,
    "admin_share": 88000.00,
    "collected": 80000.00,
    "pending": 8000.00
  }
}
```

---

### GET /admin/analytics/clients

Get client analytics.

**Response:**
```json
{
  "total_clients": 100,
  "by_status": {
    "active": 85,
    "suspended": 10,
    "inactive": 5
  },
  "by_profit_range": {
    "0-1000": 30,
    "1000-5000": 45,
    "5000-10000": 20,
    "10000+": 5
  },
  "top_performers": [
    {
      "name": "John Doe",
      "total_profit": 50000.00,
      "admin_share": 20000.00
    }
  ]
}
```

---

## Admin - Telegram

### POST /admin/telegram/send

Send message to specific client.

**Request:**
```json
{
  "client_id": "uuid",
  "message": "Hello, your weekly report is ready!",
  "media_url": "https://example.com/image.jpg",
  "media_type": "photo"
}
```

**Response:**
```json
{
  "message_id": "12345",
  "status": "sent",
  "sent_at": "2026-07-03T10:00:00Z"
}
```

---

### POST /admin/telegram/broadcast

Broadcast message to all or filtered clients.

**Request:**
```json
{
  "message": "Important announcement!",
  "filter": {
    "status": "active",
    "tags": ["vip"]
  },
  "schedule_at": "2026-07-04T09:00:00Z"
}
```

**Response:**
```json
{
  "scheduled": true,
  "recipients": 45,
  "schedule_at": "2026-07-04T09:00:00Z"
}
```

---

### GET /admin/telegram/templates

Get message templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Weekly Report",
      "content": "Dear {name}, your weekly profit is ${profit}...",
      "variables": ["name", "profit", "period"]
    }
  ]
}
```

---

### POST /admin/telegram/templates

Create message template.

**Request:**
```json
{
  "name": "Payment Reminder",
  "content": "Dear {name}, your invoice {invoice_number} is due on {due_date}.",
  "variables": ["name", "invoice_number", "due_date"]
}
```

---

### GET /admin/telegram/history

Get message history.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `client_id` (uuid): Filter by client
- `message_type` (string): Filter by type

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "client_name": "John Doe",
      "message_type": "individual",
      "subject": "Weekly Report",
      "sent_at": "2026-07-03T10:00:00Z",
      "status": "sent"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
```

---

## Admin - MT5 Integration

### POST /admin/mt5/sync

Manually trigger MT5 sync for all or specific clients.

**Request:**
```json
{
  "client_ids": ["uuid1", "uuid2"],
  "force": true
}
```

**Response:**
```json
{
  "synced": 45,
  "failed": 2,
  "results": [
    {
      "client_name": "John Doe",
      "status": "success",
      "balance": 10000.00,
      "equity": 10500.00
    }
  ]
}
```

---

### GET /admin/mt5/accounts/{id}

Get MT5 account details.

**Response:**
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "login": "12345678",
  "server": "MetaQuotes-Demo",
  "balance": 10000.00,
  "equity": 10500.00,
  "margin": 1000.00,
  "free_margin": 9500.00,
  "margin_level": 1050.00,
  "profit": 500.00,
  "last_sync": "2026-07-03T10:00:00Z",
  "sync_status": "success"
}
```

---

### GET /admin/mt5/profit-history

Get profit history for client.

**Query Parameters:**
- `client_id` (uuid): Client ID
- `period_type` (string): daily/weekly/monthly
- `from_date` (date): Start date
- `to_date` (date): End date

**Response:**
```json
{
  "data": [
    {
      "period_start": "2026-06-24",
      "period_end": "2026-06-30",
      "gross_profit": 1000.00,
      "total_deals": 50,
      "winning_deals": 35,
      "losing_deals": 15,
      "client_share": 600.00,
      "admin_share": 400.00
    }
  ]
}
```

---

## Client Portal

### GET /client/dashboard

Get client dashboard data.

**Response:**
```json
{
  "client": {
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  },
  "account": {
    "balance": 10000.00,
    "equity": 10500.00,
    "profit": 500.00,
    "margin_level": 1050.00
  },
  "performance": {
    "today_profit": 100.00,
    "weekly_profit": 500.00,
    "monthly_profit": 2000.00
  },
  "recent_invoices": [
    {
      "invoice_number": "INV-2026-0001",
      "amount": 400.00,
      "due_date": "2026-07-07",
      "status": "pending"
    }
  ]
}
```

---

### GET /client/invoices

Get client's invoices.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (string): Filter by status

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-2026-0001",
      "amount": 400.00,
      "period_start": "2026-06-24",
      "period_end": "2026-06-30",
      "due_date": "2026-07-07",
      "status": "pending",
      "created_at": "2026-07-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

---

### GET /client/invoices/{id}

Get invoice details.

**Response:**
```json
{
  "id": "uuid",
  "invoice_number": "INV-2026-0001",
  "amount": 400.00,
  "currency": "USDT",
  "period_start": "2026-06-24",
  "period_end": "2026-06-30",
  "due_date": "2026-07-07",
  "status": "pending",
  "payment_address": "TRX...",
  "qr_code": "data:image/png;base64,...",
  "transactions": []
}
```

---

### GET /client/transactions

Get payment transaction history.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-2026-0001",
      "amount": 400.00,
      "transaction_hash": "0x123...",
      "status": "confirmed",
      "confirmed_at": "2026-07-05T10:30:00Z"
    }
  ]
}
```

---

### GET /client/performance

Get performance analytics.

**Query Parameters:**
- `period` (string): daily/weekly/monthly
- `from_date` (date): Start date
- `to_date` (date): End date

**Response:**
```json
{
  "period": "weekly",
  "data": [
    {
      "period_start": "2026-06-24",
      "period_end": "2026-06-30",
      "gross_profit": 1000.00,
      "total_deals": 50,
      "winning_deals": 35,
      "losing_deals": 15,
      "win_rate": 70.0,
      "balance_start": 9500.00,
      "balance_end": 10500.00
    }
  ]
}
```

---

### GET /client/profile

Get client profile.

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "telegram_chat_id": "123456789",
  "wallet_address": "TRX...",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

### PUT /client/profile

Update client profile.

**Request:**
```json
{
  "phone": "+1234567890",
  "wallet_address": "TRX..."
}
```

---

## Payments

### POST /payments/verify

Verify payment transaction.

**Request:**
```json
{
  "transaction_hash": "0x123...",
  "invoice_id": "uuid"
}
```

**Response:**
```json
{
  "verified": true,
  "amount": 400.00,
  "status": "confirmed",
  "confirmations": 19
}
```

---

### GET /payments/status/{transaction_hash}

Get payment status.

**Response:**
```json
{
  "transaction_hash": "0x123...",
  "amount": 400.00,
  "status": "confirmed",
  "confirmations": 19,
  "confirmed_at": "2026-07-05T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid input data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Admin**: 200 requests per minute
- **Client**: 60 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625308800
```

---

## Webhooks

### Payment Webhook

Receive notifications when payments are detected.

**POST** to configured webhook URL:

```json
{
  "event": "payment.confirmed",
  "data": {
    "transaction_hash": "0x123...",
    "invoice_id": "uuid",
    "amount": 400.00,
    "confirmed_at": "2026-07-05T10:30:00Z"
  }
}
```
