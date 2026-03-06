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

---

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

Add bank account for distributions.

**Request**:
```json
{
  "account_number": "1234567890123456",
  "ifsc_code": "SBIN0001234",
  "account_holder_name": "John Doe",
  "account_type": "savings"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "bank_123",
    "account_number": "****7890",
    "ifsc_code": "SBIN0001234",
    "verified": false
  }
}
```

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

## Investment Endpoints

### POST /investments

Create new investment in a project.

**Request**:
```json
{
  "project_id": "proj_123",
  "amount": 50000,
  "accept_terms": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "investment_id": "inv_123",
    "project_id": "proj_123",
    "amount": 50000,
    "tokens": 50,
    "status": "pending",
    "payment_order": {
      "id": "order_123",
      "amount": 50000,
      "currency": "INR"
    },
    "message": "Proceed to payment"
  }
}
```

### POST /investments/{id}/verify-payment

Verify payment and confirm investment.

**Request**:
```json
{
  "razorpay_payment_id": "pay_...",
  "razorpay_order_id": "order_...",
  "razorpay_signature": "signature..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "investment_id": "inv_123",
    "status": "confirmed",
    "tokens": 50,
    "wallet_address": "0x742d35...",
    "tx_hash": "0xabc123...",
    "message": "Tokens minted successfully"
  }
}
```

### GET /investments

List user's investments.

**Query Parameters**:
- `project_id`: Filter by project
- `status`: pending, confirmed, completed, cancelled
- `sort`: created_at, amount, roi
- `page`: Page number

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_123",
      "project": {
        "id": "proj_123",
        "title": "BuilderX Residency"
      },
      "amount": 50000,
      "tokens": 50,
      "current_value": 52500,
      "total_distributions": 2500,
      "roi_percentage": 5,
      "status": "confirmed",
      "invested_date": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": { "total": 8, "page": 1 }
}
```

### GET /investments/{id}

Get investment details.

**Response** (200): Single investment object with full details

---

## Portfolio Endpoints

### GET /portfolio

Get user's portfolio summary.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_invested": 250000,
      "current_value": 275000,
      "total_distributions": 15000,
      "portfolio_roi": 10,
      "portfolio_roi_percentage": 10,
      "investment_count": 5
    },
    "breakdown": {
      "by_project": [
        {
          "project_id": "proj_123",
          "project_name": "BuilderX Residency",
          "invested": 50000,
          "current_value": 52500,
          "percentage": 20
        }
      ],
      "by_status": {
        "confirmed": 250000,
        "pending": 0,
        "completed": 0
      }
    },
    "performance": {
      "average_roi": 10,
      "best_investment": { "project": "proj_456", "roi": 15 },
      "worst_investment": { "project": "proj_789", "roi": 5 }
    }
  }
}
```

### GET /portfolio/holdings

Get detailed token holdings.

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "project_id": "proj_123",
      "project_name": "BuilderX Residency",
      "token_address": "0xtoken...",
      "tokens_held": 50,
      "tokens_percentage": 0.167,
      "wallet_address": "0x742d35...",
      "current_price": 1050,
      "total_value": 52500
    }
  ]
}
```

### GET /portfolio/distributions

Get distribution history.

**Query Parameters**:
- `project_id`: Filter by project
- `from_date`: Start date
- `to_date`: End date
- `page`: Page number

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "dist_123",
      "project": "BuilderX Residency",
      "amount": 2500,
      "percentage": 1.67,
      "distribution_date": "2024-02-28",
      "type": "monthly_rental",
      "tx_hash": "0xabc..."
    }
  ],
  "meta": {
    "total_distributions": 45,
    "total_amount": 15000,
    "average_per_distribution": 333.33
  }
}
```

---

## Secondary Market Endpoints

### POST /secondary-market/orders/sell

Create sell order for tokens.

**Request**:
```json
{
  "project_id": "proj_123",
  "token_amount": 10,
  "price_per_token": 1100
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "order_id": "order_123",
    "type": "SELL",
    "status": "open",
    "token_amount": 10,
    "price_per_token": 1100,
    "total_price": 11000
  }
}
```

### GET /secondary-market/listings

Get active sell orders.

**Query Parameters**:
- `project_id`: Filter by project
- `min_price`, `max_price`: Price range
- `sort`: price, created_at
- `page`: Pagination

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "order_id": "order_123",
      "project_id": "proj_123",
      "seller": "User#1234",
      "token_amount": 10,
      "price_per_token": 1100,
      "total_price": 11000,
      "created_at": "2024-02-20T10:30:00Z"
    }
  ],
  "meta": { "total": 45, "page": 1 }
}
```

### POST /secondary-market/orders/buy

Create buy order.

**Request**:
```json
{
  "project_id": "proj_123",
  "token_amount": 5,
  "price_per_token": 1050
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "order_id": "order_456",
    "type": "BUY",
    "amount_required": 5250,
    "status": "pending_payment"
  }
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
    "status": "approved",
    "message": "KYC verification completed successfully"
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

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Status**: Complete
