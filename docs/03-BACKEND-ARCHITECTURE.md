# Backend Architecture Documentation

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [Backend Overview](#backend-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Service Architecture](#service-architecture)
5. [API Layer Design](#api-layer-design)
6. [Database Layer](#database-layer)
7. [Authentication & Authorization](#authentication--authorization)
8. [Business Logic Layer](#business-logic-layer)
9. [Payment Integration](#payment-integration)
10. [KYC & Compliance Pipeline](#kyc--compliance-pipeline)
11. [Error Handling & Logging](#error-handling--logging)
12. [Caching Strategy](#caching-strategy)
13. [Scheduled Jobs & Events](#scheduled-jobs--events)

---

## Backend Overview

The EstateX backend is a robust, scalable REST API built with **FastAPI** (Python 3.11) and deployed on **AWS EC2** using containerization. The backend handles all business logic, database operations, payment processing, KYC verification, blockchain integration, and compliance management.

### Core Responsibilities
- User authentication and authorization
- Builder project management
- Investment order processing
- Payment gateway integration
- Smart contract interaction
- Revenue distribution
- KYC/AML verification
- Compliance tracking
- Audit logging
- Analytics and reporting

---

## Technology Stack

### Core Framework & Language
```
Python 3.11
├── Modern syntax (f-strings, type hints, match statements)
├── Strong async/await support
├── Excellent ecosystem of libraries
└── Good performance for I/O-bound operations
```

### Web Framework
```
FastAPI 0.104
├── High-performance async web framework
├── Automatic API documentation (Swagger UI)
├── Built-in data validation (Pydantic)
├── ASGI support for high concurrency
├── Dependency injection system
├── Request/response lifecycle hooks
└── WebSocket support for real-time features
```

### Database
```
PostgreSQL 15
├── ACID compliance for data integrity
├── JSON/JSONB support for flexible data
├── Full-text search capabilities
├── PostGIS extension for geo-spatial data
├── Advanced indexing options
└── Replication and backup support

Python Driver: psycopg2 or asyncpg
ORM: SQLAlchemy 2.0 with async support
```

### Caching
```
Redis 7
├── Session management
├── Rate limiting
├── Real-time cache for prices
├── Distributed locks for critical operations
├── Pub/Sub for real-time notifications
└── Expiring key support (TTL)

Python Driver: redis-py with async support
```

### Additional Libraries
```
Pydantic 2.0
├── Data validation
├── Settings management
├── JSON schema generation

SQLAlchemy 2.0
├── ORM for database abstraction
├── Query builder
├── Relationship management
├── Migration support (Alembic)

APScheduler
├── Scheduled background jobs
├── Cron jobs
├── One-time delayed tasks

Celery + Redis (Optional)
├── Distributed task queue
├── Async job processing
├── Task scheduling
└── Job monitoring

Razorpay SDK
├── Payment processing
├── Payment verification
├── Webhook handling

Web3.py
├── Blockchain interaction
├── Smart contract calls
├── Transaction signing
├── Event parsing

PyJWT
├── JWT token generation
├── Token validation
├── Claims verification

python-jose
├── Secure token handling
├── Signature verification

passlib + bcrypt
├── Password hashing
├── Secure password storage

python-multipart
├── File upload handling
├── Form data parsing
```

---

## Project Structure

```
estateX-backend/
│
├── app/                             # Main application package
│   │
│   ├── __init__.py
│   ├── main.py                      # FastAPI app entry point
│   │
│   ├── api/                         # API layer
│   │   ├── __init__.py
│   │   ├── deps.py                  # Dependency injection
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── users.py             # User management endpoints
│   │   │   ├── builders.py          # Builder management endpoints
│   │   │   ├── projects.py          # Project endpoints
│   │   │   ├── investments.py       # Investment endpoints
│   │   │   ├── payments.py          # Payment endpoints
│   │   │   ├── portfolio.py         # Portfolio endpoints
│   │   │   ├── secondary-market.py  # Secondary trading endpoints
│   │   │   ├── kyc.py               # KYC endpoints
│   │   │   ├── compliance.py        # Compliance endpoints
│   │   │   ├── analytics.py         # Analytics endpoints
│   │   │   ├── notifications.py     # Notification endpoints
│   │   │   ├── blockchain.py        # Blockchain endpoints
│   │   │   ├── admin.py             # Admin endpoints
│   │   │   └── health.py            # Health check endpoint
│   │   │
│   │   └── schemas/                 # Pydantic schemas
│   │       ├── __init__.py
│   │       ├── auth.py              # Auth request/response schemas
│   │       ├── user.py              # User schemas
│   │       ├── project.py           # Project schemas
│   │       ├── investment.py        # Investment schemas
│   │       ├── payment.py           # Payment schemas
│   │       └── common.py            # Common schemas
│   │
│   ├── models/                      # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py                  # User model
│   │   ├── builder.py               # Builder profile model
│   │   ├── project.py               # Project model
│   │   ├── investment.py            # Investment model
│   │   ├── transaction.py           # Transaction model
│   │   ├── payment.py               # Payment record model
│   │   ├── kyc.py                   # KYC record model
│   │   ├── audit.py                 # Audit log model
│   │   ├── analytics.py             # MacroAnalytics model
│   │   └── base.py                  # Base model class
│   │
│   ├── services/                    # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth.py                  # Authentication service
│   │   ├── user.py                  # User service
│   │   ├── builder.py               # Builder service
│   │   ├── project.py               # Project service
│   │   ├── investment.py            # Investment service
│   │   ├── portfolio.py             # Portfolio calculation
│   │   ├── wallet.py                # Wallet & Transaction service (Dual Ledger)
│   │   ├── payment.py               # Payment gateway integration (Razorpay)
│   │   ├── revenue.py               # Revenue distribution engine
│   │   ├── kyc.py                   # KYC verification
│   │   ├── compliance.py            # Compliance checking
│   │   ├── blockchain.py            # Smart contract interaction
│   │   ├── analytics.py             # Analytics calculations
│   │   ├── notification.py          # Notification sending
│   │   ├── milestone.py             # Milestone verification & fund release
│   │   └── document.py              # Document management
│   │
│   ├── repositories/                # Data access layer
│   │   ├── __init__.py
│   │   ├── user.py                  # User repository
│   │   ├── project.py               # Project repository
│   │   ├── investment.py            # Investment repository
│   │   ├── transaction.py           # Transaction repository
│   │   └── base.py                  # Base repository class
│   │
│   ├── middleware/                  # Custom middleware
│   │   ├── __init__.py
│   │   ├── auth.py                  # JWT validation
│   │   ├── error.py                 # Global error handler
│   │   ├── logging.py               # Request/response logging
│   │   ├── cors.py                  # CORS configuration
│   │   └── rate_limit.py            # Rate limiting
│   │
│   ├── core/                        # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py                # Settings management
│   │   ├── security.py              # Security utilities
│   │   ├── exceptions.py            # Custom exceptions
│   │   ├── constants.py             # Application constants
│   │   └── enums.py                 # Enumeration types
│   │
│   ├── utils/                       # Utility functions
│   │   ├── __init__.py
│   │   ├── validators.py            # Validation functions
│   │   ├── formatters.py            # Data formatting
│   │   ├── helpers.py               # Helper functions
│   │   ├── email.py                 # Email utilities
│   │   ├── sms.py                   # SMS utilities
│   │   ├── file.py                  # File upload utilities
│   │   ├── datetime.py              # Date/time utilities
│   │   └── crypto.py                # Encryption utilities
│   │
│   ├── cache/                       # Caching logic
│   │   ├── __init__.py
│   │   ├── redis.py                 # Redis client
│   │   ├── keys.py                  # Cache key patterns
│   │   └── decorators.py            # Caching decorators
│   │
│   ├── jobs/                        # Scheduled jobs
│   │   ├── __init__.py
│   │   ├── scheduler.py             # APScheduler setup
│   │   ├── revenue_distribution.py  # Monthly distribution job
│   │   ├── kyc_check.py             # KYC batch processing
│   │   ├── cleanup.py               # Data cleanup jobs
│   │   └── analytics.py             # Analytics calculation
│   │
│   ├── events/                      # Event handling
│   │   ├── __init__.py
│   │   ├── blockchain.py            # Smart contract events
│   │   ├── payment.py               # Payment events
│   │   └── handlers.py              # Event handlers
│   │
│   ├── integrations/                # External integrations
│   │   ├── __init__.py
│   │   ├── razorpay.py              # Razorpay integration
│   │   ├── blockchain.py            # Web3 integration
│   │   ├── kyc_provider.py          # KYC service provider
│   │   └── email.py                 # Email service
│   │
│   ├── db/                          # Database utilities
│   │   ├── __init__.py
│   │   ├── engine.py                # Database connection
│   │   ├── session.py               # Session management
│   │   ├── migrations/              # Alembic migrations
│   │   └── seed.py                  # Database seeding
│   │
│   └── logging/                     # Logging configuration
│       ├── __init__.py
│       └── config.py                # Logger setup
│
├── tests/                           # Test suite
│   ├── __init__.py
│   ├── conftest.py                  # Pytest configuration
│   ├── unit/                        # Unit tests
│   │   ├── test_auth.py
│   │   ├── test_projects.py
│   │   └── test_investments.py
│   ├── integration/                 # Integration tests
│   │   ├── test_api.py
│   │   └── test_blockchain.py
│   └── fixtures/                    # Test fixtures
│       ├── users.py
│       └── projects.py
│
├── migrations/                      # Database migrations
│   ├── alembic.ini
│   └── versions/
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (gitignored)
├── .gitignore
├── requirements.txt                 # Dependencies
├── requirements-dev.txt             # Dev dependencies
├── Dockerfile                       # Container configuration
├── docker-compose.yml               # Multi-container setup
├── pytest.ini                       # Pytest configuration
├── .pylintrc                        # Linting configuration
├── mypy.ini                         # Type checking configuration
└── README.md                        # Backend README
```

---

## Service Architecture

### Layered Service Design

```
┌─────────────────────────────────────────────────────────┐
│           API ROUTES (FastAPI Endpoints)                │
│  - Request validation (Pydantic schemas)                │
│  - Response formatting                                  │
│  - Status codes and error handling                      │
└──────────────────────┬──────────────────────────────────┘
                       │ Dependency Injection
┌──────────────────────▼──────────────────────────────────┐
│         BUSINESS LOGIC SERVICES                         │
│                                                         │
│  ├── AuthService (JWT, Password hashing)               │
│  ├── UserService (User management)                     │
│  ├── BuilderService (Builder profile & projects)       │
│  ├── ProjectService (Project CRUD)                     │
│  ├── InvestmentService (Investment processing)         │
│  ├── PaymentService (Razorpay integration)             │
│  ├── PortfolioService (Portfolio calculations)         │
│  ├── KYCService (Identity verification)                │
│  ├── BlockchainService (Smart contract interaction)    │
│  ├── RevenueService (Distribution engine)              │
│  └── ComplianceService (Compliance checking)           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         DATA ACCESS LAYER (Repositories)                │
│                                                         │
│  ├── UserRepository (DB queries for users)             │
│  ├── ProjectRepository (Project DB operations)         │
│  ├── InvestmentRepository (Investment records)         │
│  ├── TransactionRepository (Transaction logs)          │
│  └── Base patterns for CRUD operations                 │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│    INFRASTRUCTURE LAYER                                 │
│                                                         │
│  ├── PostgreSQL Database                               │
│  ├── Redis Cache                                       │
│  ├── External APIs (Razorpay, UIDAI)                   │
│  ├── Blockchain (Web3.py)                              │
│  └── File Storage (AWS S3)                             │
└──────────────────────────────────────────────────────────┘
```

### Core Services

#### 1. Authentication Service
```python
- register(email, password, phone) → User
- login(email, password) → {token, refresh_token, user}
- validate_token(token) → User
- refresh_token(refresh_token) → token
- logout(token) → bool
- change_password(user_id, old_pwd, new_pwd) → bool
- reset_password(token, new_pwd) → bool
```

#### 2. User Service
```python
- get_user(user_id) → User
- update_profile(user_id, data) → User
- get_profile_completion(user_id) → percentage
- add_bank_account(user_id, bank_data) → BankAccount
- update_preferences(user_id, prefs) → Preferences
- delete_account(user_id) → bool
```

#### 3. Builder Service
```python
- register_builder(user_id, data) → Builder
- upload_rera_document(builder_id, file) → Document
- submit_for_approval(builder_id) → BuilderStatus
- get_builder_projects(builder_id) → List[Project]
- get_builder_stats(builder_id) → BuilderStats
- update_builder_profile(builder_id, data) → Builder
```

#### 4. Project Service
```python
- create_project(builder_id, data) → Project
- update_project(project_id, data) → Project
- publish_project(project_id) → Project
- get_project(project_id) → Project
- list_projects(filters, page, limit) → Page[Project]
- get_project_details(project_id) → ProjectDetail
- add_milestone(project_id, data) → Milestone
- update_milestone(milestone_id, data) → Milestone
```

#### 5. Investment Service
```python
- create_investment(user_id, project_id, amount) → Investment
- get_user_investments(user_id) → List[Investment]
- get_project_investments(project_id) → List[Investment]
- get_investment(investment_id) → Investment
- cancel_investment(investment_id) → bool
- get_investment_status(investment_id) → Status
```

#### 6. Portfolio Service
```python
- get_portfolio(user_id) → Portfolio
- calculate_total_value(user_id) → float
- calculate_roi(user_id) → float
- get_holdings(user_id) → List[Holding]
- get_distribution_history(user_id) → List[Distribution]
- project_roi(user_id, months) → float
```

#### 7. Wallet Service (Dual Ledger)
```python
- get_wallet_balance(user_id) → float (Personal)
- get_builder_wallet_balance(builder_id) → float (Business)
- deposit_funds(user_id, amount) → Transaction
- withdraw_funds(user_id, amount, bank_id) → Transaction
- builder_withdraw(builder_id, amount, bank_id) → Transaction
- credit_milestone_payment(builder_id, project_id, amount) → Transaction
```

#### 8. Payment Service (Gateway)
```python
- create_order(amount, email, phone) → Order
- verify_payment(razorpay_id, signature) → bool
```

#### 8. KYC Service
```python
- initiate_kyc(user_id, aadhaar, pan) → KYCSession
- verify_aadhaar(user_id, otp) → bool
- verify_pan(user_id, pan) → bool
- get_kyc_status(user_id) → KYCStatus
- upload_kyc_document(user_id, file) → Document
- reject_kyc(user_id, reason) → bool
```

#### 9. Blockchain Service
```python
- mint_tokens(wallet, amount, project_id) → TransactionHash
- get_token_balance(wallet, token_address) → float
- transfer_tokens(from_wallet, to_wallet, amount) → TransactionHash
- create_sale_order(wallet, tokens, price) → Order
- execute_buy_order(buyer_wallet, seller_wallet, amount) → TransactionHash
- distribute_revenue(project_id, amount) → TransactionHash
- get_transaction_status(tx_hash) → Status
- get_regional_intelligence(pincode) → MacroData (Relationship Mapped)
- update_macro_indicators(pincode, data) → MacroData
```

#### 10. Revenue Distribution Service
```python
- collect_monthly_revenue(project_id, amount) → bool
- calculate_distribution(project_id) → List[Distribution]
- execute_distribution(project_id) → List[TransactionHash]
- get_investor_share(investment_id, month) → Amount
```

#### 11. Milestone Service
```python
- add_milestone(project_id, data) → Milestone
- submit_milestone_proof(milestone_id, doc_url) → Milestone
- verify_milestone(milestone_id, admin_id) → Milestone
- trigger_fund_release(milestone_id) → Transaction (Credits Builder Wallet)
```

#### 12. Exchange Service (High-Performance)
```python
- place_order(user_id, order_data) → Order
- run_matching_engine(order_id) → None (Background Task)
- cancel_order(user_id, order_id) → bool
- sync_global_ticker(project_id, last_price) → None (Real-time Sync)
```
> [!NOTE]
> **Price Sync Logic**: The matching engine atomically updates the `Project.market_value` after every successful execution. This ensures that the global ticker across the platform (headers, search, and detail pages) remains perfectly synchronized with the last traded price in the exchange.

---

## API Layer Design

### Endpoint Naming Convention

```
POST   /api/v1/auth/register              # Create account
POST   /api/v1/auth/login                 # Authenticate user
POST   /api/v1/auth/logout                # End session
POST   /api/v1/auth/refresh               # Refresh JWT

GET    /api/v1/users/{id}                 # Get user profile
PATCH  /api/v1/users/{id}                 # Update profile
DELETE /api/v1/users/{id}                 # Delete account

POST   /api/v1/builders                   # Register as builder
GET    /api/v1/builders/{id}              # Get builder profile
PATCH  /api/v1/builders/{id}              # Update builder
GET    /api/v1/builders/{id}/projects     # List builder's projects

POST   /api/v1/projects                   # Create project
GET    /api/v1/projects                   # List projects (paginated)
GET    /api/v1/projects/{id}              # Get project details
PATCH  /api/v1/projects/{id}              # Update project
DELETE /api/v1/projects/{id}              # Delete project

POST   /api/v1/investments                # Create investment
GET    /api/v1/investments                # List user investments
GET    /api/v1/investments/{id}           # Get investment detail

GET    /api/v1/portfolio                  # Get portfolio summary
GET    /api/v1/portfolio/holdings         # Get holdings
GET    /api/v1/portfolio/distributions    # Get distribution history

POST   /api/v1/payments/orders            # Create payment order
GET    /api/v1/payments/orders/{id}       # Get order status
POST   /api/v1/payments/verify            # Verify payment

POST   /api/v1/kyc/initiate               # Start KYC
POST   /api/v1/kyc/verify                 # Submit verification
GET    /api/v1/kyc/status                 # Check KYC status

GET    /api/v1/analytics/portfolio        # Portfolio analytics
GET    /api/v1/analytics/market           # Market analytics
GET    /api/v1/analytics/trends           # Trend analysis

POST   /api/v1/secondary-market/orders    # Create sell order
GET    /api/v1/secondary-market/listings  # View listings
POST   /api/v1/secondary-market/buy       # Buy tokens

GET    /api/v1/health                     # Health check
```

### Standard Response Format

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response-specific data
  },
  "meta": {
    "timestamp": "2024-03-06T10:30:00Z",
    "request_id": "req_123456789"
  },
  "errors": null
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "meta": {
    "timestamp": "2024-03-06T10:30:00Z",
    "request_id": "req_123456789"
  },
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_EMAIL"
    }
  ]
}
```

---

## Database Layer

### ORM Pattern (SQLAlchemy)

```python
# models/project.py
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.models.base import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True)
    builder_id = Column(String, ForeignKey("builders.id"))
    title = Column(String, nullable=False, index=True)
    description = Column(String)
    location = Column(String, index=True)
    total_budget = Column(Float)
    funding_target = Column(Float)
    funding_raised = Column(Float, default=0)
    rera_id = Column(String, unique=True)
    status = Column(String, default="draft", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    builder = relationship("Builder", back_populates="projects")
    investments = relationship("Investment", back_populates="project")
    milestones = relationship("Milestone", back_populates="project")
```

### Repository Pattern

```python
# repositories/project.py
from sqlalchemy.orm import Session
from app.models import Project
from typing import List, Optional

class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, **kwargs) -> Project:
        project = Project(**kwargs)
        self.db.add(project)
        self.db.commit()
        return project
    
    def get_by_id(self, project_id: str) -> Optional[Project]:
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def list_by_builder(self, builder_id: str, page: int = 1, limit: int = 10) -> List[Project]:
        return self.db.query(Project)\
            .filter(Project.builder_id == builder_id)\
            .offset((page - 1) * limit)\
            .limit(limit)\
            .all()
    
    def update(self, project_id: str, **kwargs) -> Project:
        project = self.get_by_id(project_id)
        for key, value in kwargs.items():
            setattr(project, key, value)
        self.db.commit()
        return project
    
    def delete(self, project_id: str) -> bool:
        project = self.get_by_id(project_id)
        if project:
            self.db.delete(project)
            self.db.commit()
            return True
        return False
```

---

## Authentication & Authorization

### JWT Token Strategy

```python
# core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 30

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Role-Based Access Control (RBAC)

```python
# core/enums.py
from enum import Enum

class UserRole(str, Enum):
    INVESTOR = "investor"
    BUILDER = "builder"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class Permission(str, Enum):
    CREATE_PROJECT = "create_project"
    APPROVE_PROJECT = "approve_project"
    INVEST = "invest"
    WITHDRAW = "withdraw"
    VIEW_ANALYTICS = "view_analytics"
    MANAGE_USERS = "manage_users"
    MANAGE_COMPLIANCE = "manage_compliance"
```

### Authorization Middleware

```python
# api/deps.py
from fastapi import Depends, HTTPException
from jose import JWTError
from app.core.security import verify_token

async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = verify_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401)
    return user

async def require_role(required_role: UserRole):
    def check_role(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return check_role
```

---

## Business Logic Layer

### Service Pattern Example

```python
# services/investment.py
from sqlalchemy.orm import Session
from app.repositories import InvestmentRepository, ProjectRepository
from app.models import Investment, Project
from app.integrations import BlockchainService, PaymentService
from decimal import Decimal

class InvestmentService:
    def __init__(
        self,
        db: Session,
        blockchain: BlockchainService,
        payment: PaymentService
    ):
        self.investment_repo = InvestmentRepository(db)
        self.project_repo = ProjectRepository(db)
        self.blockchain = blockchain
        self.payment = payment
    
    async def create_investment(
        self,
        user_id: str,
        project_id: str,
        amount: Decimal
    ) -> Investment:
        # Validate project exists and is active
        project = self.project_repo.get_by_id(project_id)
        if not project or project.status != "active":
            raise ValueError("Project not available")
        
        # Validate minimum investment
        if amount < Decimal("10000"):
            raise ValueError("Minimum investment is Rs. 10,000")
        
        # Validate remaining capacity
        if project.funding_raised + amount > project.funding_target:
            raise ValueError("Investment amount exceeds project capacity")
        
        # Create payment order
        order = await self.payment.create_order(
            amount=float(amount),
            email=user.email,
            phone=user.phone
        )
        
        # Create investment record
        investment = self.investment_repo.create(
            user_id=user_id,
            project_id=project_id,
            amount=amount,
            order_id=order.id,
            status="pending"
        )
        
        return investment
    
    async def confirm_investment(
        self,
        investment_id: str,
        payment_id: str
    ) -> Investment:
        investment = self.investment_repo.get_by_id(investment_id)
        
        # Verify payment
        payment_valid = await self.payment.verify_payment(payment_id)
        if not payment_valid:
            raise ValueError("Payment verification failed")
        
        # Calculate tokens to mint
        tokens = self._calculate_tokens(investment.amount)
        
        # Mint tokens on blockchain
        tx_hash = await self.blockchain.mint_tokens(
            wallet=investment.user.wallet_address,
            amount=tokens,
            project_id=investment.project_id
        )
        
        # Update investment status
        investment = self.investment_repo.update(
            investment_id,
            status="confirmed",
            payment_id=payment_id,
            tokens=tokens,
            tx_hash=tx_hash
        )
        
        # Update project funding
        self.project_repo.update(
            investment.project_id,
            funding_raised=project.funding_raised + investment.amount
        )
        
        return investment
    
    def _calculate_tokens(self, amount: Decimal) -> int:
        # Calculate proportional tokens based on amount
        # Each token = Rs. 1,000
        return int(amount / 1000)
```

---

## Payment Integration

### Razorpay Integration

```python
# integrations/razorpay.py
import razorpay
from decimal import Decimal
import hmac
import hashlib

class RazorpayService:
    def __init__(self, key_id: str, key_secret: str):
        self.client = razorpay.Client(auth=(key_id, key_secret))
        self.key_secret = key_secret
    
    def create_order(
        self,
        amount: float,
        currency: str = "INR",
        email: str = None,
        phone: str = None
    ) -> dict:
        """Create a Razorpay order"""
        order_data = {
            "amount": int(amount * 100),  # Convert to paise
            "currency": currency,
            "receipt": f"receipt_{int(time.time())}",
            "customer_notify": 1,
            "email": email,
            "phone": phone,
        }
        order = self.client.order.create(data=order_data)
        return order
    
    def verify_payment(
        self,
        razorpay_payment_id: str,
        razorpay_order_id: str,
        razorpay_signature: str
    ) -> bool:
        """Verify payment signature"""
        data = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            self.key_secret.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        return generated_signature == razorpay_signature
    
    def get_payment(self, payment_id: str) -> dict:
        """Get payment details"""
        return self.client.payment.fetch(payment_id)
    
    def refund_payment(
        self,
        payment_id: str,
        amount: float = None
    ) -> dict:
        """Refund a payment"""
        refund_data = {}
        if amount:
            refund_data["amount"] = int(amount * 100)
        return self.client.payment.refund(payment_id, refund_data)
```

---

## KYC & Compliance Pipeline

### KYC Verification Flow

```python
# services/kyc.py
from enum import Enum
from sqlalchemy.orm import Session

class KYCStatus(str, Enum):
    PENDING = "pending"
    INITIATED = "initiated"
    OTP_SENT = "otp_sent"
    OTP_VERIFIED = "otp_verified"
    DOCUMENT_SUBMITTED = "document_submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

class KYCService:
    def __init__(self, db: Session, kyc_provider):
        self.db = db
        self.kyc_provider = kyc_provider  # Aadhaar/PAN provider
    
    async def initiate_kyc(
        self,
        user_id: str,
        aadhaar: str,
        pan: str
    ) -> KYCSession:
        # Validate Aadhaar format (12 digits)
        if not self._validate_aadhaar(aadhaar):
            raise ValueError("Invalid Aadhaar format")
        
        # Initiate OTP with UIDAI
        otp_response = await self.kyc_provider.send_otp(aadhaar)
        
        # Create KYC session
        kyc_session = KYCRecord(
            user_id=user_id,
            aadhaar_masked=aadhaar[-4:],  # Only store last 4 digits
            status=KYCStatus.OTP_SENT
        )
        self.db.add(kyc_session)
        self.db.commit()
        
        return kyc_session
    
    async def verify_otp(
        self,
        user_id: str,
        otp: str,
        aadhaar: str
    ) -> bool:
        # Verify OTP with UIDAI
        verified = await self.kyc_provider.verify_otp(aadhaar, otp)
        
        if verified:
            # Update KYC status
            kyc = self.db.query(KYCRecord).filter(
                KYCRecord.user_id == user_id
            ).first()
            kyc.status = KYCStatus.OTP_VERIFIED
            self.db.commit()
        
        return verified
    
    def verify_pan(self, user_id: str, pan: str) -> bool:
        # Validate PAN with NSDL
        is_valid = self.kyc_provider.validate_pan(pan)
        
        if is_valid:
            kyc = self.db.query(KYCRecord).filter(
                KYCRecord.user_id == user_id
            ).first()
            kyc.pan_verified = True
            self.db.commit()
        
        return is_valid
```

---

## Error Handling & Logging

### Custom Exceptions

```python
# core/exceptions.py
class BaseAppException(Exception):
    def __init__(self, message: str, code: str = None, status_code: int = 400):
        self.message = message
        self.code = code or self.__class__.__name__
        self.status_code = status_code

class ValidationError(BaseAppException):
    pass

class AuthenticationError(BaseAppException):
    def __init__(self, message="Authentication failed"):
        super().__init__(message, status_code=401)

class AuthorizationError(BaseAppException):
    def __init__(self, message="Insufficient permissions"):
        super().__init__(message, status_code=403)

class ResourceNotFoundError(BaseAppException):
    def __init__(self, message="Resource not found"):
        super().__init__(message, status_code=404)

class ConflictError(BaseAppException):
    def __init__(self, message="Resource already exists"):
        super().__init__(message, status_code=409)
```

### Global Exception Handler

```python
# middleware/error.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.exceptions import BaseAppException

async def exception_handler(request: Request, exc: BaseAppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "code": exc.code,
            "data": None,
            "meta": {
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request.headers.get("X-Request-ID")
            }
        }
    )

app = FastAPI()
app.add_exception_handler(BaseAppException, exception_handler)
```

### Structured Logging

```python
# logging/config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "path": record.pathname,
            "line": record.lineno,
        }
        return json.dumps(log_data)

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
```

---

## Caching Strategy

### Redis Caching Implementation

```python
# cache/decorators.py
from functools import wraps
import json
from app.cache.redis import redis_client

def cache_result(ttl: int = 300):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{json.dumps({**kwargs})}"
            
            # Try to get from cache
            cached = await redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            await redis_client.set(
                cache_key,
                json.dumps(result),
                ex=ttl
            )
            
            return result
        return wrapper
    return decorator

# Usage
@cache_result(ttl=600)
async def get_project_details(project_id: str):
    return db.query(Project).filter(Project.id == project_id).first()
```

---

## Scheduled Jobs & Events

### APScheduler Configuration

```python
# jobs/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = BackgroundScheduler()

@scheduler.scheduled_job(CronTrigger(hour=0, minute=0))
async def monthly_revenue_distribution():
    """Distribute monthly revenue to investors"""
    projects = db.query(Project).filter(Project.status == "active").all()
    
    for project in projects:
        revenue_service.execute_monthly_distribution(project.id)
        
        # Notify investors
        notification_service.notify_distributions(project.id)

@scheduler.scheduled_job(CronTrigger(hour=*/6))
async def sync_blockchain_events():
    """Sync blockchain events with database"""
    blockchain_service.listen_and_process_events()

scheduler.start()
```

---

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Status**: Complete
