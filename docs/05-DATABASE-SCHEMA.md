# Database Schema Documentation

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [ER Diagram](#er-diagram)
3. [Core Tables](#core-tables)
4. [Relationships](#relationships)
5. [Indexes & Performance](#indexes--performance)
6. [Data Types & Constraints](#data-types--constraints)
7. [Migration Strategy](#migration-strategy)
8. [Backup & Recovery](#backup--recovery)
9. [Query Optimization](#query-optimization)

---

## Database Overview

**Database Engine**: PostgreSQL 15  
**Host**: AWS RDS (Multi-AZ)  
**Primary Database**: `estate_x_prod`  
**Analytics Database**: `estate_x_analytics` (read replicas)  
**Connection Pool**: PgBouncer with 100 max connections  
**Replication**: Synchronous to standby  

### Key Characteristics
- ACID compliance for transaction safety
- 100GB initial storage, auto-scaling to 500GB
- Daily automated backups (30-day retention)
- Point-in-time recovery (PITR) enabled
- Monitoring via AWS CloudWatch
- **Realtime Replication**: Enabled via Supabase/Postgres Wal2json for `trades` and `orders` tables

---

## ER Diagram

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ wallet_balance      │
│ kyc_status          │
│ role (enum)         │
└────┬─────────────┬──┘
     │             │
┌────▼──────────┐  │  ┌─────────────────┐
│  builders      │  │  │  wallet_txs     │
├────────────────┤  │  ├─────────────────┤
│ id (FK)        │  ├──│ user_id (FK)    │
│ company_name   │  │  │ amount          │
│ rera_approved  │  │  │ tx_type         │
└────┬───────────┘  │  └─────────────────┘
     │              │
┌────▼──────────────▼──┐
│    projects           │
├──────────────────────┤
│ id (PK)              │
│ builder_id (FK)      │
│ total_bricks         │
│ face_value           │
│ ipo_price            │
│ market_value         │
│ previous_close       │
│ ipo_status           │
└────┬──────────────┬──┘
     │              │
┌────▼──────────┐  │
│ brick_holdings │  │  ┌──────────────────┐
├────────────────┤  │  │    orders        │
│ id (PK)        │  ├──│ id (PK)          │
│ user_id (FK)   │  │  │ project_id (FK)  │
│ project_id (FK)├──┘  │ user_id (FK)     │
│ quantity       │     │ order_type       │
└─────────┬──────┘     │ price_per_brick  │
          │            │ unfilled_qty     │
          │            └─────────┬────────┘
          │                      │
          │            ┌─────────▼────────┐
          │            │      trades      │
          └────────────┤ id (PK)          │
                       │ project_id (FK)  │
                       │ price            │
                       │ quantity         │
                       └──────────────────┘

┌─────────────────────┐
│  macro_analytics    │
├─────────────────────┤
│ pincode (PK)        │
│ yoy_growth          │
│ rental_yield        │
│ demand_score        │
└─────────▲───────────┘
          │ (Linked via Pincode)
┌─────────┴───────────┐
│      projects       │
└─────────────────────┘
```

---

## Core Tables

### 1. users Table

Stores authentication and profile information for all user types.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_image_url VARCHAR(500),
    
    -- KYC Status
    kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, initiated, approved, rejected
    kyc_verified_at TIMESTAMP,
    kyc_rejection_reason VARCHAR(500),
    
    -- User Classification
    role VARCHAR(50) NOT NULL, -- investor, builder, admin, super_admin
    account_type VARCHAR(50), -- individual, company
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    
    -- Wallet
    wallet_address VARCHAR(66) UNIQUE, -- Ethereum wallet address
    
    -- Preferences
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_push BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Metadata
    ip_address_created VARCHAR(50),
    device_info JSONB
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### 2. builders Table

Builder-specific profile information and RERA compliance data.

```sql
CREATE TABLE builders (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_registration_number VARCHAR(100) UNIQUE,
    business_type VARCHAR(100),
    rera_registration_number VARCHAR(100) UNIQUE,
    rera_approved BOOLEAN DEFAULT false,
    rera_approved_date TIMESTAMP,
    
    -- Contact Info
    headquarters_address TEXT,
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(100),
    headquarters_pincode VARCHAR(10),
    
    -- Company Details
    year_established INTEGER,
    total_projects_count INTEGER DEFAULT 0,
    completed_projects_count INTEGER DEFAULT 0,
    ongoing_projects_count INTEGER DEFAULT 0,
    
    -- Reputation
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    default_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of defaulted projects
    
    -- Financial
    total_funding_raised DECIMAL(18,2) DEFAULT 0,
    total_construction_cost DECIMAL(18,2) DEFAULT 0,
    wallet_balance DECIMAL(18,2) DEFAULT 0.00 NOT NULL,
    
    -- Bank Details
    bank_account_name VARCHAR(255),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_ifsc_code VARCHAR(20),
    
    -- Verification
    document_verified BOOLEAN DEFAULT false,
    documents_verified_date TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'pending',
    rejection_reason VARCHAR(500),
    
    -- Compliance
    gst_number VARCHAR(50),
    pan_number VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_builders_company_name ON builders(company_name);
CREATE INDEX idx_builders_rera_number ON builders(rera_registration_number);
CREATE INDEX idx_builders_city ON builders(headquarters_city);
CREATE INDEX idx_builders_rera_approved ON builders(rera_approved);
```

### 3. projects Table

Real estate project information and IPO funding details.

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id),
    
    -- Project Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    location_address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Financials & Brick Exchange Logistics
    total_budget DECIMAL(18,2),
    total_bricks INTEGER NOT NULL DEFAULT 1000,
    face_value DECIMAL(18,2) NOT NULL DEFAULT 100.00,
    ipo_price DECIMAL(18,2) NOT NULL,
    market_value DECIMAL(18,2),
    previous_close_price DECIMAL(18,2),
    funding_raised DECIMAL(18,2) DEFAULT 0,
    
    -- Regulatory
    rera_id VARCHAR(100) UNIQUE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    ipo_status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, active, completed
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_builder_id ON projects(builder_id);
CREATE INDEX idx_projects_ipo_status ON projects(ipo_status);
```

### 3b. bank_accounts Table

Discrete entity mapping infinite isolated bank accounts allowing global liquidity flow.

```sql
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
```

### 4. wallet_transactions Table

Tracks all fiat deposits, withdrawals, and stock trades.

```sql
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(18,2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, brick_purchase, brick_sale
    is_builder_transaction BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_txs_user_id ON wallet_transactions(user_id);
```

### 5. brick_holdings Table

Portfolio mapping connecting Investors strictly to fractional pieces (Bricks) of real estate.

```sql
CREATE TABLE brick_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_holdings_user ON brick_holdings(user_id);
CREATE UNIQUE INDEX idx_holding_unique ON brick_holdings(user_id, project_id);
```

### 6. milestones Table

Project construction milestones for fund releases.

```sql
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Milestone Details
    milestone_number INTEGER NOT NULL,
    description VARCHAR(500),
    details TEXT,
    
    -- Timeline
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- Fund Release
    release_percentage DECIMAL(5,2) NOT NULL, -- % of escrow to release
    release_amount DECIMAL(18,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, verified
    verified_by_admin UUID REFERENCES users(id),
    verified_date TIMESTAMP,
    
    -- Documents
    completion_certificate_url VARCHAR(500),
    inspection_report_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
```

### 7. distributions Table

Monthly revenue distributions to investors.

```sql
CREATE TABLE distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    investment_id UUID REFERENCES investments(id),
    
    -- Distribution Details
    amount DECIMAL(18,2) NOT NULL,
    percentage DECIMAL(8,6) NOT NULL, -- Investor's % of total revenue
    
    -- Blockchain
    tx_hash VARCHAR(66),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, distributed, failed
    distribution_date TIMESTAMP,
    
    -- Tax Info
    tax_amount DECIMAL(18,2) DEFAULT 0,
    net_amount DECIMAL(18,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_distributions_user_id ON distributions(user_id);
CREATE INDEX idx_distributions_project_id ON distributions(project_id);
CREATE INDEX idx_distributions_status ON distributions(status);
CREATE INDEX idx_distributions_distribution_date ON distributions(distribution_date DESC);
CREATE INDEX idx_distributions_created_at ON distributions(created_at DESC);
```

### 8. orders & trades Tables

The pure Peer-to-Peer Stock Broker Matching Engine.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    order_type VARCHAR(20) NOT NULL, -- buy / sell
    price_per_brick DECIMAL(18,2) NOT NULL,
    quantity INTEGER NOT NULL,
    unfilled_quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_unfilled ON orders(project_id, order_type, status);

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    buy_order_id UUID REFERENCES orders(id),
    sell_order_id UUID REFERENCES orders(id),
    price DECIMAL(18,2) NOT NULL,
    quantity INTEGER NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_trades_project ON trades(project_id);

> [!IMPORTANT]
> **Supabase Realtime**: The `orders` and `trades` tables MUST have REPLICA IDENTITY FULL or at least Realtime Publication enabled in the Supabase Dashboard to support the sub-100ms UI updates.
```

### 9. kyc_records Table

KYC verification details for investors.

```sql
CREATE TABLE kyc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    
    -- Aadhaar
    aadhaar_hash VARCHAR(256), -- Hashed, not plain text
    aadhaar_last_4_digits VARCHAR(4),
    aadhaar_verified BOOLEAN DEFAULT false,
    aadhaar_verified_at TIMESTAMP,
    
    -- PAN
    pan_number VARCHAR(20) UNIQUE,
    pan_verified BOOLEAN DEFAULT false,
    pan_verified_at TIMESTAMP,
    
    -- Verification Details
    otp_sent_count INTEGER DEFAULT 0,
    otp_verified_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, otp_sent, verified, rejected
    rejection_reason VARCHAR(500),
    
    -- Audit & Queue Claiming
    assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    
    -- Documents
    document_upload_date TIMESTAMP,
    document_verification_date TIMESTAMP,
    pan_image_url VARCHAR(500),
    aadhaar_front_url VARCHAR(500),
    aadhaar_back_url VARCHAR(500),
    
    -- Session
    session_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user_id ON kyc_records(user_id);
CREATE INDEX idx_kyc_pan_number ON kyc_records(pan_number);
CREATE INDEX idx_kyc_status ON kyc_records(status);
CREATE INDEX idx_kyc_assigned_admin_id ON kyc_records(assigned_admin_id);
```

### 10. audit_logs Table

Compliance and audit trail for all critical operations.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    -- Operation Details
    entity_type VARCHAR(100), -- users, projects, investments, etc.
    entity_id UUID,
    action VARCHAR(50), -- create, update, delete, approve, reject
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    request_id VARCHAR(100),
    
    -- Status
    status VARCHAR(50),
    error_message VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

### 11. macro_analytics Table

Stores regional macro-economic indicators for property valuation and investor intelligence.

```sql
CREATE TABLE macro_analytics (
    pincode VARCHAR(10) PRIMARY KEY,
    yoy_growth_percentage DECIMAL(5,2) NOT NULL,
    avg_rental_yield DECIMAL(5,2) NOT NULL,
    demand_score INTEGER CHECK (demand_score BETWEEN 0 AND 100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_macro_pincode ON macro_analytics(pincode);
```
```

---

## Relationships

### Primary Key & Foreign Key Constraints

```
users (1) ──────────── (N) investments
  │
  ├─────────── (1) builders
  │
  ├─────────── (N) kyc_records
  │
  ├─────────── (N) payments
  │
  └─────────── (N) distributions

builders (1) ──────────── (N) projects

projects (1) ──────────── (N) investments
  │
  ├─────────── (N) milestones
  │
  ├─────────── (N) distributions
  │
  └─────────── (N) secondary_market_orders

investments (1) ──────────── (N) distributions

secondary_market_orders (1) ──> users (seller_id)
                          └──> users (buyer_id)

projects (1) ─────────── (1) macro_analytics (Mapped via Pincode)
brick_holdings (N) ───── (1) projects (Direct Portfolio Relationship)
```

---

## Indexes & Performance

### Index Strategy

```
Primary Filters (Must Index):
├── user_id (frequent in WHERE clauses)
├── project_id (joining investments, distributions)
├── status fields (filtering by state)
├── created_at (sorting, date range queries)
└── email, phone (unique lookups)

Secondary Indexes (Often Used):
├── builder_id for builder projects
├── wallet_address for blockchain queries
├── kyc_status for compliance
├── rera_id for regulatory lookup
└── Combined indexes for common joins
```

### Query Performance

```sql
-- GOOD: Uses indexes efficiently
SELECT i.* FROM investments i
WHERE i.project_id = $1 AND i.status = 'confirmed'
ORDER BY i.created_at DESC
LIMIT 10;

-- BETTER: Covers all needed columns
CREATE INDEX idx_investments_project_status_date ON investments(project_id, status, created_at DESC);

-- Find all distributions for a user in a date range
SELECT * FROM distributions
WHERE user_id = $1 AND distribution_date BETWEEN $2 AND $3
ORDER BY distribution_date DESC;
```

---

## Data Types & Constraints

### Decimal Precision

```
Financial Amounts: DECIMAL(18,2)
├── Supports up to Rs. 999,999,999,999.99
├── 2 decimal places (paise precision)
├── No rounding errors
└── NEVER use float/double for money

Percentages: DECIMAL(5,2)
├── Supports 0.00 to 999.99
├── 2 decimal places
└── For ROI, distribution rates

Tokens: DECIMAL(18,2)
├── Large supply of 100+ million possible
├── Decimal precision for fractional ownership
└── Example: 30,000.00 tokens = Rs. 30 Cr equity
```

### Enum Types

```sql
CREATE TYPE user_role AS ENUM (
    'investor', 'builder', 'admin', 'super_admin'
);

CREATE TYPE kyc_status AS ENUM (
    'pending', 'initiated', 'otp_sent', 'otp_verified',
    'document_submitted', 'approved', 'rejected'
);

CREATE TYPE project_status AS ENUM (
    'draft', 'pending', 'approved', 'active',
    'completed', 'stalled', 'cancelled'
);

CREATE TYPE investment_status AS ENUM (
    'pending', 'confirmed', 'completed', 'cancelled'
);

CREATE TYPE order_status AS ENUM (
    'open', 'filled', 'cancelled', 'expired'
);
```

---

## Migration Strategy

### Alembic Setup

```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Create users table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Sample Migration

```python
# migrations/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), server_default=sa.func.gen_random_uuid(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('phone', sa.String(20), unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_table('users')
```

---

## Backup & Recovery

### Backup Strategy

```
Daily Automated Backups
├── Time: 02:00 UTC (off-peak)
├── Type: Full backup
├── Retention: 30 days
├── Storage: AWS S3 (cross-region)
└── RPO (Recovery Point Objective): 24 hours

Point-in-Time Recovery (PITR)
├── Enabled: Yes
├── Retention: 30 days
├── Granularity: Per-transaction
└── RTO (Recovery Time Objective): <1 hour

Disaster Recovery
├── Multi-AZ deployment (active-standby)
├── Automatic failover: <1 minute
├── Read replicas: us-east-1 (analytics)
└── Test recovery: Quarterly
```

### Backup Verification

```sql
-- Check backup status
SELECT backup_id, backup_time, status
FROM aws_backup
WHERE database = 'estate_x_prod'
ORDER BY backup_time DESC
LIMIT 5;

-- Test restore (non-prod)
CREATE DATABASE estate_x_restore
FROM BACKUP backup_id_xyz;
```

---

## Query Optimization

### Common Queries

```sql
-- Get investor's portfolio summary
SELECT
  COUNT(i.id) as investment_count,
  SUM(i.amount) as total_invested,
  SUM(i.current_value) as current_value,
  SUM(i.total_distributions) as total_distributions,
  (SUM(i.total_distributions) - SUM(i.amount)) as profit
FROM investments i
WHERE i.user_id = $1 AND i.status = 'confirmed'
GROUP BY i.user_id;

-- Create analysis view
CREATE MATERIALIZED VIEW investor_portfolio_summary AS
SELECT
  u.id,
  u.email,
  COUNT(i.id) as investment_count,
  SUM(i.amount) as total_invested,
  SUM(i.current_value) as current_value,
  SUM(i.roi_percentage) / COUNT(i.id) as avg_roi
FROM users u
LEFT JOIN investments i ON u.id = i.user_id
WHERE u.role = 'investor'
GROUP BY u.id;

-- Get monthly revenue distribution progress
SELECT
  p.id,
  p.title,
  COUNT(DISTINCT d.user_id) as distributed_investors,
  SUM(d.amount) as total_distributed,
  COUNT(DISTINCT i.user_id) as total_investors,
  (COUNT(DISTINCT d.user_id) * 100.0 / COUNT(DISTINCT i.user_id)) as completion_percentage
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id
LEFT JOIN distributions d ON p.id = d.project_id AND d.distribution_date = CURRENT_DATE
GROUP BY p.id
ORDER BY completion_percentage DESC;
```

---

**Document Version**: 1.1  
**Last Updated**: April 22, 2026  
**Status**: Complete (Regional Intelligence & Relational Update)
