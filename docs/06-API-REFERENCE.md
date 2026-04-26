# API Reference Documentation

**EstateX: Trade Properties Like Stocks**

---

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.estateX.com/api/v1
WebSocket: wss://api.estateX.com/ws
```

---

## Authentication

All endpoints (except auth) require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

Response includes tokens:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

> [!NOTE]
> **API Version**: 1.4 — Updated April 25, 2026. Added performance-optimized `OHLCV` engine with `DailyCandle` caching and documented the `400 Bad Request` responses for Circuit Breaker violations.

## Standard Response Format

**Success (2xx)**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-03-06T10:30:00Z",
    "request_id": "req_123"
  }
}
```

**Error (4xx, 5xx)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "meta": { "timestamp": "...", "request_id": "..." },
  "errors": [
    {"field": "email", "message": "Invalid email", "code": "INVALID_EMAIL"}
  ]
}
```

---

## Auth Endpoints

### POST /auth/register

Register new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "phone": "+918999999999",
  "first_name": "John",
  "last_name": "Doe",
  "role": "investor"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-123",
    "email": "user@example.com",
    "role": "investor",
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

### POST /auth/login

Authenticate and receive tokens.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "user@example.com",
      "role": "investor",
      "kyc_status": "approved"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 86400
    }
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request**:
```json
{
  "refresh_token": "eyJ..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "expires_in": 86400
  }
}
```

### POST /auth/logout

Logout and invalidate tokens.

**Request**: (empty body)

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/oauth-sync

Synchronize user metadata from Supabase OAuth (Google/Apple) to the local PostgreSQL database. This ensures that users who sign in via social login for the first time have a valid local account.

**Request**:
```json
{
  "supabase_id": "uuid-from-supabase",
  "email": "user@google.com",
  "full_name": "John Doe",
  "avatar_url": "https://..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "user@google.com",
    "role": "investor",
    "kyc_status": "pending",
    "created_at": "2024-04-26T00:00:00Z"
  }
}
```

### POST /auth/forgot-password

Generates a 6-digit OTP for the given email to reset password.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "OTP generated successfully",
  "otp": "123456"
}
```

### POST /auth/reset-password

Resets the user's password using the generated OTP.

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewSecurePass123!"
}
```

**Response** (200):
```json
{
  "message": "Password reset successfully"
}
```

---

## User Endpoints

### GET /users/profile

Get current user profile.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "user@example.com",
    "phone": "+918999999999",
    "first_name": "John",
    "last_name": "Doe",
    "kyc_status": "approved",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "profile_image_url": "https://...",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### PATCH /users/profile

Update user profile.

**Request**:
```json
{
  "first_name": "Johnny",
  "phone": "+918988888888",
  "profile_image": "<base64_image>",
  "preferences": {
    "notification_email": true,
    "language": "en"
  }
}
```

**Response** (200): Updated user object

### POST /users/bank-accounts

Link a new bank account to the user profile for seamless fiat deposits and withdrawals.

**Request**:
```json
{
  "account_number": "1234567890123456",
  "ifsc_code": "SBIN0001234",
  "account_holder_name": "John Doe",
  "is_primary": true
}
```

**Response** (200):
```json
{
  "id": "uuid-string",
  "user_id": "uuid-string",
  "account_number": "1234567890123456",
  "ifsc_code": "SBIN0001234",
  "account_holder_name": "John Doe",
  "is_primary": true,
  "is_verified": false,
  "created_at": "2024-03-01T00:00:00Z"
}
```

### GET /users/bank-accounts

Retrieve all globally banked liquidity exit points configured for the current user.

**Response** (200): Array of Bank Account objects.

### DELETE /users/bank-accounts/{bank_id}

Drop a specific bank account from the user profile mapping.

**Response** (204): No Content.

---

## Wallet Endpoints

### GET /wallet

Fetch user's liquid Fiat wallet balance and 10 most recent ledger transactions.

**Response** (200):
```json
{
  "balance": 50000.00,
  "recent_transactions": [
    {
      "id": "tx_123",
      "amount": 10000.00,
      "transaction_type": "deposit",
      "status": "completed",
      "created_at": "2024-03-01T00:00:00Z"
    }
  ]
}
```

### POST /wallet/deposit

Instantly inject external Fiat into your internal EstateX Wallet.

**Request**:
```json
{
  "amount": 10000.00,
  "reference_id": "pi_123"
}
```

**Response** (200): Returns the created Transaction object.

### POST /wallet/withdraw

Securely extract internal Fiat back to your external bank accounts.

**Request**:
```json
{
  "amount": 5000.00,
  "bank_account_id": "bank_123"
}
```

**Response** (200): Returns the created Transaction object.

### GET /wallet/builder

Fetch builder-specific business balance and recent construction earnings.

**Response** (200): Same format as `/wallet`.

### POST /wallet/builder/withdraw

Securely extract construction revenue from business wallet to builder's registered bank account.

**Request**:
```json
{
  "amount": 50000.00,
  "bank_account_id": "builder_bank_123"
}
```

**Response** (200): Returns the created Transaction object.

---

## Project Endpoints

### GET /projects

List projects with filters.

**Query Parameters**:
- `city`: Filter by city
- `status`: active, completed, stalled
- `min_investment`: Minimum investment amount
- `max_investment`: Maximum investment amount
- `sort`: created_at, funding_raised, roi
- `page`: Page number (default 1)
- `limit`: Items per page (default 20)

**Example**: `GET /projects?city=Bangalore&status=active&page=1&limit=20`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "title": "BuilderX Residency",
      "location_address": "123 Main St",
      "city": "Bangalore",
      "type": "residential",
      "total_budget": 100000000,
      "funding_target": 30000000,
      "funding_raised": 15000000,
      "funding_percentage": 50,
      "expected_completion_date": "2025-12-31",
      "investor_count": 250,
      "average_rating": 4.5,
      "status": "active",
      "thumbnail_url": "https://..."
    }
  ],
  "meta": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "pages": 7
  }
}
```

### GET /projects/{id}

Get detailed project information.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "title": "BuilderX Residency",
    "description": "50-acre residential complex",
    "builder": {
      "id": "builder_123",
      "company_name": "BuilderX Corp",
      "headquarters_city": "Bangalore",
      "average_rating": 4.7,
      "total_projects": 45
    },
    "location": {
      "address": "123 Main St",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560034",
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "financial": {
      "total_budget": 100000000,
      "funding_target": 30000000,
      "funding_raised": 15000000,
      "min_investment": 10000,
      "tokens_per_rupee": 0.001
    },
    "timeline": {
      "launch_date": "2024-01-01",
      "construction_start": "2023-06-01",
      "expected_completion": "2025-12-31",
      "months_remaining": 22
    },
    "milestones": [
      {
        "milestone_number": 1,
        "description": "Foundation & Structural",
        "target_date": "2024-06-30",
        "release_percentage": 30,
        "status": "completed"
      }
    ],
    "documents": {
      "rera_approval": "https://...",
      "brochure": "https://...",
      "floor_plans": ["https://..."]
    },
    "compliance": {
      "rera_approved": true,
      "environmental_clearance": true,
      "insurance_coverage": true
    },
    "images": ["https://...", "https://..."],
    "investor_count": 250,
    "view_count": 5000
  }
}
```

---

## Primary Market (IPO) Endpoints

### POST /exchange/ipo/{project_id}/subscribe

Direct primary market purchase. Maps real-world fiat directly to real-estate Bricks from the Builder's internal supply. Assumes the Admin has marked `ipo_status` as `active`.

**Request**:
```json
{
  "quantity": 50
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Successfully purchased 50 Bricks for 5000.00 INR."
}
```

---

## Portfolio Endpoints

### GET /exchange/portfolio

Displays the user's legally backed Equity (Bricks) inside various Real Estate Projects.

**Response** (200):
```json
[
  {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "project_id": "uuid-string",
    "quantity": 50,
    "created_at": "2024-03-01T00:00:00Z"
  }
]
```

---

## Exchange & Secondary Market Endpoints

### POST /exchange/orders

Push intent into the Secondary Orderbook! Bound by `+20% / -10%` circuit breakers.
**Performance**: Returns instantly (sub-100ms) while matching logic runs in a background task.
**Real-time**: Results are pushed to the UI instantly via Supabase Realtime as matches are cleared.

**Request**:
```json
{
  "project_id": "uuid-string",
  "order_type": "buy",
  "price_per_brick": 105.00,
  "quantity": 50
}
```

**Response** (200):
```json
{
  "id": "uuid-string",
  "project_id": "uuid-string",
  "user_id": "uuid-string",
  "order_type": "buy",
  "price_per_brick": 105.00,
  "quantity": 50,
  "unfilled_quantity": 50,
  "status": "open",
  "created_at": "2024-03-01T00:00:00Z"
}
```

### GET /exchange/orders

Lists the current user's outstanding intent to purchase or liquidate assets.

**Query Parameters**:
- `status`: open, partial, fulfilled, cancelled

**Response** (200): Array of Order objects perfectly dictating active limit trades.

### GET /exchange/trades/{project_id}

Publicly tracks transparent historical `Trades` shifting the underlying `Project.market_value` ticker globally!

**Response** (200): Array of Trade objects mapping exactly who bought from who at what price!

### GET /exchange/trades/{project_id}/ohlcv

Aggregates historical trades into Open, High, Low, Close, Volume buckets for advanced candlestick charting in the Terminal.

**Query Parameters**:
- `interval`: 1m, 5m, 1h, 1d (Time bucket size)

**Response** (200):
```json
[
  {
    "time": 1712345600,
    "open": 102.50,
    "high": 105.00,
    "low": 102.50,
    "close": 104.50,
    "value": 1500
  }
]
```

---

## Analytics Endpoints

### GET /analytics/macro/{pincode}

Provides macroeconomic real estate data for a specific area, empowering investors with external market context. Currently returns simulated deterministic data, built to scale to external real estate APIs (e.g., MagicBricks, 99acres).

**Response** (200):
```json
{
  "pincode": "400001",
  "yoy_growth_percentage": 12.5,
  "avg_rental_yield": 6.8,
  "demand_score": 85,
  "last_updated": "2024-03-01T00:00:00Z"
}
```

---

## KYC Endpoints

### POST /kyc/initiate

Start KYC verification process.

**Request**:
```json
{
  "aadhaar": "123456789012",
  "pan": "AAAPA1234A"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "kyc_session_id": "kyc_123",
    "status": "otp_sent",
    "message": "OTP sent to registered phone",
    "retry_after": 30
  }
}
```

### POST /kyc/verify-otp

Verify OTP for Aadhaar.

**Request**:
```json
{
  "otp": "123456",
  "kyc_session_id": "kyc_123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "otp_verified",
    "message": "Aadhaar verified. Please upload PAN."
  }
}
```

### POST /kyc/verify-pan

Verify PAN against government database.

**Request**:
```json
{
  "pan": "AAAPA1234A",
  "kyc_session_id": "kyc_123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "message": "Documents submitted successfully. Your identity is now under review by our compliance team."
  }
}
```

### GET /kyc/status

Get current KYC status.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "verified_date": "2024-01-15T10:30:00Z",
    "aadhaar_verified": true,
    "pan_verified": true
  }
}
```

---

---

## Admin Endpoints

### GET /admin/kyc-applications

Retrieve a paginated list of KYC applications for admin review. Supports filtering by status and assigned admin.

**Query Parameters**:
- `status`: pending, approved, rejected, or all (default: 'all')
- `assigned_admin_id`: UUID of the admin who claimed the ticket (optional)
- `skip`: Records to skip (default: 0)
- `limit`: Records to return (default: 50)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid-string",
      "user_id": "uuid-string",
      "full_name": "John Doe",
      "status": "pending",
      "assigned_admin_id": null,
      "pan_number": "AAXPA...",
      "created_at": "2024-03-01T00:00:00Z",
      "updated_at": "2024-03-01T00:00:00Z"
    }
  ],
  "total": 120,
  "skip": 0,
  "limit": 50
}
```

### POST /admin/kyc-applications/{id}/claim

Locks a KYC application so the current admin can review it without collision.

**Response** (200):
```json
{
  "success": true,
  "message": "Successfully claimed application",
  "kyc_status": "pending"
}
```

### POST /admin/kyc-applications/{id}/release

Releases the lock on a KYC application, returning it to the global queue.

**Response** (200):
```json
{
  "success": true,
  "message": "Successfully released application",
  "kyc_status": "pending"
}
```

### POST /admin/kyc-applications/{id}/review

Finalizes the KYC review process, marking it Approved or Rejected and logging the admin who performed the action.

**Request**:
```json
{
  "status": "approved",
  "rejection_reason": null
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Successfully marked KYC application as approved",
  "kyc_status": "approved"
}
```

### GET /admin/analytics/macro

List all macroeconomic data nodes (Pincode-based).

**Response** (200): Array of MacroData objects.

### POST /admin/analytics/macro

Create a new macroeconomic data node.

**Request**:
```json
{
  "pincode": "400001",
  "yoy_growth_percentage": 12.5,
  "avg_rental_yield": 6.8,
  "demand_score": 85
}
```

**Response** (201): Created MacroData object.

### PUT /admin/analytics/macro/{pincode}

Update an existing macroeconomic data node.

**Response** (200): Updated MacroData object.

### DELETE /admin/analytics/macro/{pincode}

Remove a macroeconomic data node.

**Response** (200): Success message.

### POST /admin/users/{user_id}/wallet/adjust

**God Mode**: Directly adjust a user's wallet balance. Use with extreme caution.

**Request**:
```json
{
  "amount": 500.0,
  "transaction_type": "refund",
  "reason": "Resolving dispute #123"
}
```

**Response** (200): Transaction summary.

---

## Analytics Endpoints

### GET /analytics/portfolio

Get portfolio analytics and insights.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_invested": 250000,
    "portfolio_growth": 10,
    "top_performer": { "project": "proj_123", "roi": 15 },
    "average_holding_period": 180,
    "diversification": { "residential": 60, "commercial": 40 }
  }
}
```

### GET /analytics/market

Get market-wide analytics.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "total_investors": 5000,
    "total_funded": 500000000,
    "average_investment": 100000,
    "projects_active": 25,
    "top_projects": [
      {
        "project_id": "proj_123",
        "total_funded": 30000000,
        "investor_count": 1000
      }
    ]
  }
}
```

---

## Admin Analytics Endpoints (Restricted to Admins)

### GET /admin/analytics/macro

Fetch all regional macro-economic nodes.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "pincode": "400001",
      "yoy_growth_percentage": 12.5,
      "avg_rental_yield": 6.5,
      "demand_score": 85,
      "last_updated": "2026-04-22T10:00:00Z"
    }
  ]
}
```

### POST /admin/analytics/macro

Initialize a new regional intelligence node.

**Request**:
```json
{
  "pincode": "400001",
  "yoy_growth_percentage": 12.5,
  "avg_rental_yield": 6.5,
  "demand_score": 85
}
```

### PUT /admin/analytics/macro/{pincode}

Update existing regional indicators.

**Request**:
```json
{
  "yoy_growth_percentage": 13.2,
  "avg_rental_yield": 6.8,
  "demand_score": 90
}
```

### DELETE /admin/analytics/macro/{pincode}

Permanently remove a regional intelligence node.

**Response** (200):
```json
{
  "success": true,
  "message": "Macro analytics node deleted successfully"
}
```

---

## Revenue Distribution Endpoints

### POST /revenue/deposit

Initiate a new monthly rental cycle for a project. Accessible by **Builders** and **Admins**.

**Request**:
```json
{
  "project_id": "uuid-string",
  "amount": 500000.00,
  "month": 4,
  "year": 2026
}
```

**Response** (200):
```json
{
  "id": "uuid-string",
  "project_id": "uuid-string",
  "month": 4,
  "year": 2026,
  "gross_amount": 500000.00,
  "fee_amount": 5000.00,
  "net_amount": 495000.00,
  "status": "pending_approval",
  "created_at": "2026-04-25T00:00:00Z"
}
```

### GET /revenue/admin/pending

Admin-only. Fetch all rental cycles awaiting settlement approval.

**Response** (200): Array of `RentalCycle` objects with `status = "pending_approval"`.

### POST /revenue/admin/settle/{cycle_id}

Admin-only. Approve and execute the pro-rata distribution for a pending cycle. The service calculates each brick holder's `eligible_quantity` (bricks held ≥ 30 days) and credits their wallet accordingly.

**Response** (200):
```json
{
  "id": "uuid-string",
  "status": "settled",
  "distributed_at": "2026-04-25T12:00:00Z",
  "payouts_created": 143
}
```

### DELETE /revenue/admin/reject/{cycle_id}

Admin-only. Reject and permanently remove a pending rental cycle (e.g., incorrect amount submitted by builder).

**Response** (200):
```json
{ "message": "Cycle rejected and removed" }
```

### GET /revenue/history/{project_id}

Publicly fetch the settled distribution history for a project, ordered most-recent first.

**Response** (200): Array of settled `RentalCycle` objects.

---

## Governance Endpoints

### GET /governance/proposals/{project_id}

Fetch all governance proposals for a specific project, including real-time vote distribution.

**Response** (200):
```json
[
  {
    "id": "uuid-string",
    "project_id": "uuid-string",
    "title": "Renew Tenant Contract for 2027?",
    "description": "The current lease expires in December 2026.",
    "options": ["Renew", "Change Tenant", "Sell Asset"],
    "status": "active",
    "end_date": "2026-05-15T23:59:00Z",
    "total_votes": 4250,
    "vote_distribution": [3000, 750, 500]
  }
]
```

### POST /governance/proposals/{proposal_id}/vote

Cast a weighted vote on a proposal. Requires KYC-approved **Investor** with active brick holdings in the proposal's project. Weight is snapshotted from current brick holdings.

**Request**:
```json
{
  "option_index": 0
}
```

**Response** (200):
```json
{
  "id": "uuid-string",
  "proposal_id": "uuid-string",
  "user_id": "uuid-string",
  "option_index": 0,
  "weight": 150,
  "created_at": "2026-04-25T14:00:00Z"
}
```

**Errors**:
- `400`: Proposal not active or already voted
- `403`: Not a brick holder of this project

### GET /governance/admin/proposals

Admin-only. Fetch all governance proposals across all projects.

**Response** (200): Array of `ProposalResponse` objects.

### POST /governance/admin/proposals

Admin-only. Create a new governance proposal for a project.

**Request**:
```json
{
  "project_id": "uuid-string",
  "title": "Renew Tenant Contract for 2027?",
  "description": "The current lease expires in December 2026. Vote to decide next steps.",
  "options": ["Renew", "Change Tenant", "Sell Asset"],
  "end_date": "2026-05-15T23:59:00Z"
}
```

**Response** (201): Created `ProposalResponse` object.

### PUT /governance/admin/proposals/{proposal_id}/status

Admin-only. Close or execute a proposal, recording the winning option.

**Query Parameters**:
- `status`: `closed` or `executed`
- `result_index`: Integer index of the winning option (required when `status=executed`)

**Response** (200): Updated `ProposalResponse` object.

---

## Webhooks

### Payment Webhook

**Endpoint**: `POST /webhooks/razorpay`

**Triggered On**: Payment event (authorized, captured, failed)

**Payload**:
```json
{
  "event": "payment.authorized",
  "created_at": 1234567890,
  "entity": {
    "id": "pay_123",
    "order_id": "order_123",
    "amount": 50000,
    "status": "captured"
  }
}
```

**Response**: Must return 200 status to confirm receipt

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| INVALID_EMAIL | 400 | Email format invalid |
| EMAIL_EXISTS | 409 | Email already registered |
| INVALID_PASSWORD | 400 | Password doesn't meet requirements |
| INVALID_CREDENTIALS | 401 | Email/password incorrect |
| TOKEN_EXPIRED | 401 | JWT token expired |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks required role |
| PROJECT_NOT_FOUND | 404 | Project doesn't exist |
| INVESTMENT_EXCEEDS_LIMIT | 400 | Amount exceeds project capacity |
| KYC_NOT_APPROVED | 403 | User KYC not approved |
| PAYMENT_FAILED | 400 | Payment verification failed |
| INTERNAL_ERROR | 500 | Server error |

---

**Document Version**: 1.3  
**Last Updated**: April 25, 2026  
**Status**: Complete (Revenue Distribution Engine & DAO Governance Update)
