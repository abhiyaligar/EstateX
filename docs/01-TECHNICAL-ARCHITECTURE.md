# Technical Architecture Documentation

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Layered Architecture](#layered-architecture)
4. [Component Breakdown](#component-breakdown)
5. [Communication Patterns](#communication-patterns)
6. [Data Flow](#data-flow)
7. [Scalability Considerations](#scalability-considerations)
8. [Technology Rationale](#technology-rationale)
9. [Integration Points](#integration-points)

---

## System Architecture Overview

EstateX employs a **modern, cloud-native, layered architecture** designed for security, scalability, and regulatory compliance. The system is structured into four distinct layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER (Web)                       │
│                                                                   │
│  Next.js 14 Frontend • React 18 • Tailwind CSS • Web3.js        │
│                                                                   │
│  Browser-based UI for Builders, Investors, and Admins           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / WebSocket
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│                                                                   │
│  Nginx Reverse Proxy • Load Balancer • Request Validation        │
│  Rate Limiting • SSL/TLS Termination • DDoS Protection           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/2
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                           │
│                                                                   │
│  FastAPI Framework • Python 3.11                                 │
│  RESTful Endpoints • Service Classes • Domain Logic              │
│  KYC Pipeline • Payment Processing • Compliance Engine           │
│                                                                   │
│  Core Services:                                                  │
│  • Builder Management Service                                    │
│  • Investment Management Service                                 │
│  • Portfolio Service                                             │
│  • Transaction Service                                           │
│  • Notification Service                                          │
│  • Analytics Service                                             │
  • Exchange & Matching Service                                    │
  • Support & Resolution Service                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
┌───────────────────▼─┐   ┌─────────▼──────────────────┐
│   DATA LAYER        │   │   BLOCKCHAIN LAYER         │
│                     │   │                            │
│  PostgreSQL 15      │   │  Polygon Mumbai Network    │
│  Redis 7            │   │  Solidity Smart Contracts  │
│  SQLAlchemy ORM     │   │  Web3.py Integration       │
│                     │   │                            │
│  Relational Data    │   │  Tokenization              │
│  Session Cache      │   │  Escrow Management         │
│  Rate Limit Store   │   │  Distribution Automation   │
└─────────────────────┘   │  Audit Trail               │
                          └────────────────────────────┘
```

---

## Architecture Diagram

### High-Level System Components

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT APPLICATIONS                                  │
│                                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐               │
│  │  Builder Portal │  │  Investor App   │  │  Admin Dashboard │               │
│  │  (Next.js)      │  │  (Next.js)      │  │  (Next.js)       │               │
│  └────────┬────────┘  └────────┬────────┘  └────────┬─────────┘               │
│           │                    │                    │                          │
└───────────┼────────────────────┼────────────────────┼──────────────────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │ HTTPS/WSS
┌────────────────────────────────▼────────────────────────────────────────────────┐
│                           AWS LOAD BALANCER (ALB)                                │
│                    Route 53 DNS • SSL/TLS Certificate                            │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────────┐
│                       NGINX REVERSE PROXY (EC2)                                  │
│            Rate Limiting • Request Validation • Static File Serving              │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────────────┐
│                    FASTAPI BACKEND SERVICES (EC2 Auto Scaling)                   │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐     │
│  │ Auth Service       │  │ Builder Service    │  │ Investment Service   │     │
│  │ • JWT tokens       │  │ • Registration     │  │ • Portfolio mgmt     │     │
│  │ • Session mgmt     │  │ • RERA validation  │  │ • Fractional tokens  │     │
│  │ • KYC pipeline     │  │ • Document upload  │  │ • Price discovery    │     │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘     │
│                                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐     │
│  │ Payment Service    │  │ Revenue Service    │  │ Analytics Service    │     │
│  │ • Razorpay SDK     │  │ • Distribution mgmt│  │ • Portfolio metrics  │     │
│  │ • Escrow mgmt      │  │ • Rental income    │  │ • ROI calculations   │     │
│  │ • Transaction log  │  │ • Smart contract   │  │ • Reporting          │     │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘     │
└────────────────┬─────────────────────────────────────┬────────────────────────┘
                 │                                     │
    ┌────────────▼────────────┐      ┌────────────────▼────────────────┐
    │                         │      │                                 │
┌───▼──────────────────────┐ │  ┌───▼───────────────────────────────┐ │
│  PostgreSQL 15 (AWS RDS) │ │  │ Redis 7 (ElastiCache)             │ │
│                          │ │  │                                   │ │
│ • User Accounts          │ │  │ • Session Cache                   │ │
│ • Builder Profiles       │ │  │ • Rate Limiting                   │ │
│ • Projects               │ │  │ • Real-time Updates               │ │
│ • Investments            │ │  │ • Distributed Locks               │ │
│ • Transactions           │ │  │                                   │ │
│ • Audit Logs             │ │  └───────────────────────────────────┘ │
│ • KYC Records            │ │                                         │
└──────────────────────────┘ │                                         │
                             │                                         │
                 ┌───────────┴─────────────────┐
                 │                             │
    ┌────────────▼─────────────┐  ┌──────────▼──────────────┐
    │  AWS S3 Storage          │  │ Razorpay Payment API    │
    │                          │  │                         │
    │ • Document uploads       │  │ • Payment processing    │
    │ • Project images         │  │ • Webhook handling      │
    │ • Compliance files       │  │ • Transaction recording │
    │ • Backup archives        │  │                         │
    └──────────────────────────┘  └─────────────────────────┘
```

### Blockchain Integration

```
┌────────────────────────────────────────────────────────────┐
│              POLYGON MUMBAI TESTNET                         │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │        Smart Contracts (Solidity 0.8.20)          │   │
│  │                                                    │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐  │   │
│  │  │ Token Contract   │  │ Escrow Contract      │  │   │
│  │  │ (ERC-20)         │  │                      │  │   │
│  │  │ • Mint tokens    │  │ • Fund lock/release  │  │   │
│  │  │ • Transfer       │  │ • Milestone mgmt     │  │   │
│  │  │ • Balance check  │  │ • Dispute handling   │  │   │
│  │  └──────────────────┘  └──────────────────────┘  │   │
│  │                                                    │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐  │   │
│  │  │ Revenue Dist.    │  │ Secondary Market     │  │   │
│  │  │ Contract         │  │ Contract             │  │   │
│  │  │ • Pool rentals   │  │ • Listing orders     │  │   │
│  │  │ • Proportional   │  │ • Settlement (T+0)   │  │   │
│  │  │  distribution    │  │ • Price discovery    │  │   │
│  │  │ • Batch payouts  │  │ • Transaction fees   │  │   │
│  │  └──────────────────┘  └──────────────────────┘  │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└──────────────────────────┬────────────────────────────────┘
                           │ Web3.py via
                           │ JSON-RPC Endpoint
┌──────────────────────────▼────────────────────────────────┐
│        FastAPI Backend (Blockchain Integration)            │
│                                                             │
│  • Web3.py provider initialization                         │
│  • Transaction signing and broadcasting                    │
│  • Event listening and parsing                             │
│  • Smart contract interaction                              │
│  • Gas optimization and batching                           │
│  • Error handling and retry logic                          │
└──────────────────────────────────────────────────────────┘
```

---

## Layered Architecture

### 1. Presentation Layer

**Responsibilities**:
- User interface rendering
- Form input validation (client-side)
- State management for UI
- API request orchestration
- Real-time updates via WebSocket

**Technologies**:
- Next.js 14 (SSR/SSG)
- React 18 component library
- Tailwind CSS for styling
- Redux/Zustand for state
- Chart.js for visualizations
- Web3.js for wallet integration

**Key Components**:
- Builder Dashboard (project management, analytics)
- Investor Marketplace (project browsing, investment)
- Portfolio Dashboard (holdings, performance, distributions)
- Admin Console (compliance, approvals, reporting)
- Secondary Trading Interface (buy/sell fractional shares)

---

### 2. API Gateway & Security Layer

**Responsibilities**:
- Request routing and load balancing
- SSL/TLS encryption termination
- DDoS protection
- Rate limiting per user/IP
- Request logging and monitoring
- CORS policy enforcement

**Technologies**:
- Nginx reverse proxy
- AWS Application Load Balancer (ALB)
- AWS Shield Standard (DDoS)
- AWS WAF (Web Application Firewall)
- CloudFront CDN (optional)

**Configuration**:
- HTTPS on port 443
- HTTP/2 support
- Connection pooling
- Request timeouts (30 seconds)
- Rate limit: 100 requests/minute per IP

---

### 3. Business Logic Layer

**Responsibilities**:
- Core application logic
- API endpoint implementation
- Service orchestration
- Transaction processing
- Compliance validation
- Event handling

**Technologies**:
- FastAPI 0.104
- Python 3.11
- Pydantic for validation
- SQLAlchemy ORM
- APScheduler for scheduled tasks

**Core Services**:

#### 3.1 Authentication & Authorization Service
```
Functions:
- User registration and login
- JWT token generation and validation
- Role-based access control (RBAC)
- Session management
- Password reset and recovery
- 2FA implementation (future)
```

#### 3.2 Builder Management Service
```
Functions:
- Builder profile creation
- RERA document upload and validation
- Builder KYC verification
- Project creation and updates
- Project milestone management
- Builder reputation scoring
- Compliance status tracking
```

#### 3.3 Investment Management Service
```
Functions:
- Project listing and filtering
- Investor portfolio management
- Investment order processing
- Primary subscription management
- Token minting and distribution
- Escrow fund management
- Dispute resolution
```

#### 3.4 Payment & Transaction Service
```
Functions:
- Razorpay payment gateway integration
- UPI payment processing
- Transaction validation
- Refund processing
- Payment reconciliation
- Webhook handling
- Transaction history
```

#### 3.5 Revenue Distribution Service
```
Functions:
- Monthly rental income collection
- Proportional distribution calculation
- Smart contract interaction for payouts
- Distribution scheduling
- Distribution history tracking
- Tax reporting data
```

#### 3.6 Analytics Service
```
Functions:
- Portfolio metrics calculation
- ROI projections
- Risk analysis
- Market trend analysis
- Performance reporting
- Data aggregation for dashboards
```

#### 3.7 KYC/Compliance Service
```
Functions:
- UIDAI/Aadhaar verification (OTP-based)
- PAN verification (NSDL integration)
- Strict Manual Review: Human-in-the-loop validation for all users
- Admin Queue Management: Claim/Release mechanics for review tickets
- KYC Status Tracking (Submitted, In Review, Approved, Rejected)
- AML checks and Sanction list screening
- Compliance reporting and audit trails
```

---

### 4. Data Layer

**Responsibilities**:
- Data persistence
- Data consistency
- Query optimization
- Caching strategy
- Backup and recovery

#### 4.1 PostgreSQL Relational Database

**Databases**:
- **estate_x_prod**: Primary database for all relational data
- **estate_x_analytics**: Denormalized data for analytics queries

**Storage**:
- AWS RDS Multi-AZ for high availability
- Automated daily backups (30-day retention)
- 100 GB initial storage (auto-scaling to 500 GB)

**Connection Pool**:
- Max connections: 100
- Min connections: 10
- Connection timeout: 30 seconds
- Idle connection timeout: 300 seconds

#### 4.2 Redis Caching

**Use Cases**:
- Session storage (TTL: 24 hours)
- Rate limit counters (TTL: 1 minute)
- Real-time price cache (TTL: 5 minutes)
- User permission caching (TTL: 1 hour)
- Distributed locks for critical operations

**Configuration**:
- AWS ElastiCache (t3.micro)
- Single-node for development
- Multi-node cluster for production
- Backup snapshots daily

---

## Component Breakdown

### Frontend Components

```
EstateX Frontend Application
│
├── Public Pages
│   ├── Home Page
│   ├── About & Features
│   ├── Investor Marketplace
│   ├── Project Listing Detail
│   └── Blog & Resources
│
├── Investor Pages
│   ├── Dashboard
│   │   ├── Portfolio Overview
│   │   ├── Investment History
│   │   ├── Distribution Records
│   │   └── Performance Charts
│   │
│   ├── Investment Workflow
│   │   ├── Project Browse & Filter
│   │   ├── Due Diligence Tools
│   │   ├── Investment Orders
│   │   └── Payment Processing
│   │
│   ├── Secondary Market
│   │   ├── Marketplace View
│   │   ├── Listing Management
│   │   ├── Buy Orders
│   │   └── Sell Orders
│   │
│   ├── Portfolio Management
│   │   ├── Holdings View
│   │   ├── Risk Analytics
│   │   ├── ROI Projections
│   │   └── Historical Performance
│   │
│   └── Account Settings
│       ├── KYC Status
│       ├── Payment Methods
│       ├── Bank Details
│       └── Preferences
│
├── Builder Pages
│   ├── Dashboard
│   │   ├── Project Overview
│   │   ├── Fundraising Progress
│   │   ├── Investor List
│   │   └── Revenue Dashboard
│   │
│   ├── Project Management
│   │   ├── Project Registration
│   │   ├── Document Upload
│   │   ├── Milestone Tracking
│   │   └── Fund Release Requests
│   │
│   ├── Investor Communication
│   │   ├── Announcements
│   │   ├── Updates
│   │   └── Notifications
│   │
│   └── Account Settings
│       ├── Builder Profile
│       ├── Bank Accounts
│       ├── RERA Details
│       └── Document Management
│
├── Admin Pages
│   ├── Dashboard
│   │   ├── Platform Analytics
│   │   ├── KYC Queue
│   │   ├── Compliance Status
│   │   └── Alerts & Issues
│   │
│   ├── User Management
│   │   ├── KYC Verification Queue
│   │   ├── KYC History
│   │   ├── User Blocking/Unblocking
│   │   └── Dispute Management
│   │
│   ├── Project Management
│   │   ├── Project Approval Queue
│   │   ├── Milestone Validation
│   │   ├── Document Review
│   │   └── Project Compliance
│   │
│   ├── Financial Management
│   │   ├── Payment Reconciliation
│   │   ├── Escrow Accounts
│   │   ├── Transaction Audit
│   │   └── Fund Flow Reports
│   │
│   └── Reporting
│       ├── Compliance Reports
│       ├── Revenue Reports
│       ├── User Analytics
│       └── System Health
│
└── Shared Components
    ├── Navigation (Header, Sidebar)
    ├── Forms (Input validation, error handling)
    ├── Tables (Data display, sorting, filtering)
    ├── Modals (Dialogs, confirmations)
    ├── Charts (Line, bar, pie, candlestick)
    ├── Notifications (Toast, alerts)
    └── Auth (Login, signup, 2FA)
```

### Backend Services

```
FastAPI Application
│
├── Authentication Module
│   ├── JWT token management
│   ├── OAuth2 flows
│   ├── Permission validation
│   └── Session management
│
├── User Management
│   ├── User CRUD operations
│   ├── Role assignment
│   ├── Profile management
│   └── Preference settings
│
├── Builder Module
│   ├── Builder registration
│   ├── RERA validation
│   ├── Document management
│   ├── Project CRUD
│   ├── Milestone management
│   └── Reputation scoring
│
├── Investment Module
│   ├── Project filtering & search
│   ├── Investment order processing
│   ├── Portfolio calculation
│   ├── Holdings management
│   ├── Token distribution
│   └── Escrow management
│
├── Payment Module
│   ├── Razorpay integration
│   ├── Payment processing
│   ├── Webhook handling
│   ├── Refund management
│   └── Transaction logging
│
├── Blockchain Module
│   ├── Web3 provider
│   ├── Smart contract ABI
│   ├── Transaction signing
│   ├── Event listening
│   └── Gas estimation
│
├── Revenue Distribution Module
│   ├── Monthly collection
│   ├── Proportional calculation
│   ├── Batch distribution
│   ├── Distribution history
│   └── Tax reporting
│
├── Analytics Module
│   ├── Portfolio metrics
│   ├── ROI calculations
│   ├── Risk analysis
│   ├── Trend analysis
│   └── Report generation
│
├── KYC/Compliance Module
│   ├── UIDAI verification
│   ├── PAN verification
│   ├── Document validation
│   ├── AML checks
│   └── Compliance reporting
│
├── Notification Module
│   ├── Email notifications
│   ├── SMS notifications
│   ├── In-app notifications
│   ├── Notification templates
│   └── Notification scheduling
│
├── Support Module
│   ├── Ticket creation (Investor/Builder)
│   ├── Resolution Terminal (Admin)
│   ├── Status & Priority management
│   └── Relationship-mapped user context
│
└── Admin Module
    ├── User management
    ├── Project approval
    ├── Dispute resolution
    ├── Report generation
    └── System configuration
```

---

## Communication Patterns

### Request-Response Pattern (Synchronous)

```
Client Browser
    │
    ├─ HTTP POST /api/investments/create
    │       ├─ Headers: Authorization: Bearer <JWT>
    │       ├─ Body: {project_id, amount, ...}
    │
    ├──────────────────────────────────────────────────────┐
    │                  Nginx Reverse Proxy                  │
    │         (Load Balancing, Rate Limiting, SSL)          │
    └────────────────────────────────────────┬──────────────┘
                                             │
    ┌────────────────────────────────────────▼──────────────┐
    │           FastAPI Backend Service                      │
    │                                                        │
    │ ┌──────────────────────────────────────────────────┐ │
    │ │ 1. Request Validation (Pydantic)                 │ │
    │ │    - Schema validation                           │ │
    │ │    - Permission check                            │ │
    │ └──────────────────────────────────────────────────┘ │
    │                     │                                  │
    │ ┌──────────────────▼──────────────────────────────┐ │
    │ │ 2. Business Logic Processing                     │ │
    │ │    - Investment amount validation                │ │
    │ │    - Project availability check                  │ │
    │ │    - Escrow creation                             │ │
    │ │    - Token calculation                           │ │
    │ └──────────────────────────────────────────────────┘ │
    │                     │                                  │
    │ ┌──────────────────▼──────────────────────────────┐ │
    │ │ 3. Database Transaction                          │ │
    │ │    - Create investment record                    │ │
    │ │    - Update portfolio                            │ │
    │ │    - Log transaction                             │ │
    │ │    - Commit or rollback                          │ │
    │ └──────────────────────────────────────────────────┘ │
    │                     │                                  │
    │ ┌──────────────────▼──────────────────────────────┐ │
    │ │ 4. Response Preparation                          │ │
    │ │    - Serialize data                              │ │
    │ │    - Add metadata                                │ │
    │ │    - Status code (200/201/400/etc)               │ │
    │ └──────────────────────────────────────────────────┘ │
    └────────────────────────────────────────┬──────────────┘
                                             │
                                HTTP 200 OK
                            {investment_id, token_count, ...}
                                             │
                                     Client Receives
```

### High-Performance Async Pattern (Matching Engine)

For mission-critical trading operations, where UI responsiveness is paramount, we use an **Asynchronous Matching Pattern**:

1. **Client Action**: User submits an order.
2. **Instant Handshake**: Backend validates the order, escrows assets, and returns a `200 OK` instantly (**<100ms**).
3. **Background Worker**: FastAPI `BackgroundTasks` spawns a dedicated worker to run the FIFO matching algorithmic core.
4. **Isolated DB Session**: The worker uses a fresh database session to perform set-based bulk settlements, minimizing lock contention.
5. **Real-time Push**: Once the match is cleared, **Supabase Realtime** pushes the resulting `Trade` and `Orderbook` updates to all connected clients.

### Event-Driven Pattern (Asynchronous)

```
Smart Contract Event
    │
    ├─ EventLog: MilestoneCompleted(project_id, milestone)
    │
    ├──────────────────────────────────────────────────────┐
    │           Event Listener Service (FastAPI)            │
    │                                                        │
    │ - Listening to Polygon RPC for contract events        │
    │ - Filtering relevant events                           │
    │ - Parsing event data                                  │
    └────────────────────────────────────────┬──────────────┘
                                             │
    ┌────────────────────────────────────────▼──────────────┐
    │        Event Processing (APScheduler)                  │
    │                                                        │
    │ 1. Trigger fund release from escrow                   │
    │ 2. Update project milestone status                    │
    │ 3. Notify investors of progress                       │
    │ 4. Update analytics dashboard                         │
    │ 5. Log audit trail                                    │
    └────────────────────────────────────────┬──────────────┘
                                             │
    ┌────────────────────────────────────────▼──────────────┐
    │        Database Updates + Notifications                │
    │                                                        │
    │ - PostgreSQL: Update project status                   │
    │ - Redis: Invalidate cache                             │
    │ - Email Service: Notify investors                     │
    │ - WebSocket: Real-time dashboard update               │
    └──────────────────────────────────────────────────────┘
```

### Webhook Pattern (External Integration)

```
Payment Gateway (Razorpay)
    │
    ├─ Payment Completed Event
    │
    ├──────────────────────────────────────────────────────┐
    │         Razorpay Webhook Endpoint                     │
    │         POST /api/webhooks/razorpay                   │
    │                                                        │
    │ - Verify webhook signature                            │
    │ - Extract payment data                                │
    │ - Validate amount and order ID                        │
    │ - Mark payment as completed                           │
    │ - Trigger investment creation                         │
    │ - Send confirmation email                             │
    └──────────────────────────────────────────────────────┘
```

---

## Data Flow

### Complete User Investment Journey

```
1. USER DISCOVERY
   Investor logs in → Browses projects → Filters by criteria
                          │
                          ▼
2. PROJECT SELECTION
   Views project details → Reviews financial projections
                          │
                          ▼
3. INVESTMENT ORDER
   Creates investment order → Specifies amount
                          │
                          ▼
4. PAYMENT PROCESSING
   Initiates payment via Razorpay → Completes UPI/Card
                          │
                          ▼
5. PAYMENT VERIFICATION
   Webhook from Razorpay → Verify signature & amount
                          │
                          ▼
6. BLOCKCHAIN TOKENIZATION
   Smart contract mints tokens → Assigns to investor wallet
                          │
                          ▼
7. DATABASE UPDATE
   Create investment record → Update portfolio → Log transaction
                          │
                          ▼
8. CONFIRMATION
   Send email notification → Update dashboard → Broadcast WebSocket
                          │
                          ▼
9. ONGOING PORTFOLIO MANAGEMENT
   Investor views holdings → Tracks ROI → Receives distributions
```

### Monthly Revenue Distribution Flow

```
1. REVENUE COLLECTION
   Rental income received → Builder deposits to escrow account
                          │
                          ▼
2. DISTRIBUTION TRIGGER
   Scheduled task runs at month-end → Calculate proportions
                          │
                          ▼
3. SMART CONTRACT EXECUTION
   Web3.py calls distribution contract → Batch payout execution
                          │
                          ▼
4. BLOCKCHAIN SETTLEMENT
   Polygon network processes transaction → Gas fees paid
                          │
                          ▼
5. DATABASE LOGGING
   Record distribution event → Update investor balances
                          │
                          ▼
6. NOTIFICATION
   Emit event to notification service → Send email receipts
                          │
                          ▼
7. ANALYTICS UPDATE
   Update ROI calculations → Refresh dashboard widgets
```

---

## Scalability Considerations

### Horizontal Scaling

**Frontend Scaling**:
- Next.js static generation for SEO-critical pages
- CloudFront CDN for global content delivery
- Multiple AWS regions for latency reduction
- Load balancer distributes traffic

**Backend Scaling**:
- FastAPI deployed on EC2 Auto Scaling Group
- Minimum 2 instances, maximum 10 instances
- Scaling triggers: CPU >70%, Memory >80%
- Health check interval: 30 seconds

**Database Scaling**:
- PostgreSQL read replicas for analytics queries
- Connection pooling via PgBouncer
- Horizontal sharding by project_id (future)
- Archive old transaction records to S3

**Redis Scaling**:
- Redis Cluster for distributed caching
- Key partitioning by user_id for hot data
- Automatic failover with sentinel

---

## Technology Rationale

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Web Framework** | FastAPI | Native async support, automatic API docs, high performance |
| **Database** | PostgreSQL | ACID compliance, JSON support, complex query capability |
| **Blockchain** | Polygon Mumbai | Low gas fees (~$0.001), EVM-compatible, active ecosystem |
| **Frontend** | Next.js 14 | Server-side rendering, API routes, built-in optimization |
| **Caching** | Redis | Sub-millisecond latency, distributed lock support |
| **Container** | Docker | Environment consistency, easy scaling |
| **Cloud** | AWS | Mature services, global presence, cost optimization |

---

## Integration Points

### External APIs

1. **Razorpay Payment Gateway**
   - Endpoint: `https://api.razorpay.com/v1`
   - Authentication: API Key + Secret
   - Webhook signature verification: SHA256 HMAC

2. **UIDAI Aadhaar Service (Government)**
   - e-KYC verification
   - OTP-based authentication
   - Response validation

3. **NSDL PAN Service (Government)**
   - PAN validation
   - Name verification
   - Tax category checking

4. **Polygon RPC Endpoint**
   - `https://rpc-mumbai.maticvigil.com`
   - JSON-RPC 2.0 protocol
   - Web3.py provider integration

5. **Email Service (SendGrid or Twilio)**
   - Transactional emails
   - Notification templates
   - Bounce handling

---

## Security Architecture

### Authentication Flow
```
User Login Request
    │
    ├─ Validate credentials against PostgreSQL
    │
    ├─ Generate JWT token (exp: 24 hours)
    │
    ├─ Return token + refresh token
    │
    ├─ Client stores token in secure HttpOnly cookie
    │
    ├─ Every subsequent request includes Bearer token
    │
    ├─ Middleware validates signature and expiration
    │
    └─ Request proceeds if valid
```

### Data Encryption
- **In Transit**: TLS 1.3 for all HTTP connections
- **At Rest**: 
  - PostgreSQL: Row-level encryption for sensitive fields
  - AWS S3: AES-256 encryption
  - Redis: Encrypted snapshots

---

## Deployment Architecture

### Environment Separation

```
Development
├── Local Docker Compose
├── PostgreSQL 15 (local)
├── Redis (local)
└── Polygon Mumbai Testnet

Staging
├── AWS EC2 t3.small (single instance)
├── AWS RDS PostgreSQL (Multi-AZ)
├── AWS ElastiCache Redis
└── Polygon Mumbai Testnet

Production
├── AWS EC2 Auto Scaling Group (t3.medium)
├── AWS RDS PostgreSQL Multi-AZ
├── AWS ElastiCache Redis Cluster
└── Polygon Mumbai or Mainnet
```

---

## Monitoring & Observability

### Metrics
- Application performance (API response times)
- Infrastructure metrics (CPU, memory, disk)
- Database metrics (query performance, connections)
- Blockchain metrics (transaction success rate, gas costs)

### Logging
- Centralized logging with AWS CloudWatch
- Structured JSON logging from FastAPI
- Log retention: 30 days
- Critical alerts for errors and failures

---

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Status**: Complete
