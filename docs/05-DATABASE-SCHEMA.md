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

---

## ER Diagram

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ phone               │
│ password_hash       │
│ first_name          │
│ last_name           │
│ kyc_status          │
│ role (enum)         │
│ is_active           │
│ created_at          │
│ updated_at          │
└────┬─────────────┬──┘
     │             │
     │             │
┌────▼──────────┐  │  ┌─────────────────┐
│  builders      │  │  │  investor_kyc   │
├────────────────┤  │  ├─────────────────┤
│ id (FK)        │  ├──│ user_id (FK)    │
│ registration_no│  │  │ aadhaar_hash    │
│ company_name   │  │  │ pan             │
│ rera_approved  │  │  │ status          │
│ headquarters   │  │  │ verified_date   │
│ created_at     │  │  │ created_at      │
└────┬───────────┘  │  └─────────────────┘
     │              │
     │              │
┌────▼──────────────▼──┐
│    projects           │
├──────────────────────┤
│ id (PK)              │
│ builder_id (FK)      │
│ title                │
│ location             │
│ total_budget         │
│ funding_target       │
│ funding_raised       │
│ status               │
│ rera_id              │
│ token_address        │
│ created_at           │
│ updated_at           │
└────┬──────────────┬──┘
     │              │
┌────▼──────────┐  │
│  investments   │  │  ┌──────────────────┐
├────────────────┤  │  │  milestones      │
│ id (PK)        │  ├──│ id (PK)          │
│ user_id (FK)   │  │  │ project_id (FK)  │
│ project_id (FK)├──┘  │ description      │
│ amount         │     │ target_date      │
│ tokens         │     │ release_percent  │
│ status         │     │ completed        │
│ order_id       │     │ created_at       │
│ created_at     │     └──────────────────┘
└────┬───────────┘
     │
┌────▼──────────────────────┐
│  payments                  │
├────────────────────────────┤
│ id (PK)                    │
│ investment_id (FK)         │
│ razorpay_payment_id        │
│ razorpay_order_id          │
│ amount                     │
│ status                     │
│ signature_verified         │
│ created_at                 │
└────────────────────────────┘

┌──────────────────────────┐
│  distributions           │
├──────────────────────────┤
│ id (PK)                  │
│ project_id (FK)          │
│ user_id (FK)             │
│ amount                    │
│ distribution_date        │
│ tx_hash                   │
│ status                    │
│ created_at               │
└──────────────────────────┘

┌──────────────────────────────┐
│  secondary_market_orders     │
├──────────────────────────────┤
│ id (PK)                      │
│ seller_id (FK, user)         │
│ buyer_id (FK, user)          │
│ project_id (FK)              │
│ token_amount                 │
│ price_per_token              │
│ order_type (BUY/SELL)        │
│ status (OPEN/FILLED/CANCEL)  │
│ tx_hash                      │
│ created_at                   │
└──────────────────────────────┘
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
    
    -- Bank Details
    bank_account_number VARCHAR(20),
    bank_ifsc_code VARCHAR(20),
    bank_account_holder_name VARCHAR(100),
    bank_verified BOOLEAN DEFAULT false,
    
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

Real estate project information and funding details.

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id UUID NOT NULL REFERENCES builders(id),
    
    -- Project Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100), -- residential, commercial, mixed-use
    property_type VARCHAR(100), -- apartment, villa, office, retail
    
    -- Location
    location_address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Project Details
    total_area DECIMAL(12,2), -- in sqft
    total_units INTEGER,
    total_budget DECIMAL(18,2), -- Total construction cost
    
    -- Funding
    funding_target DECIMAL(18,2), -- Amount to raise via crowdfunding
    funding_raised DECIMAL(18,2) DEFAULT 0,
    funding_percentage DECIMAL(5,2) DEFAULT 0,
    min_investment DECIMAL(18,2) DEFAULT 10000, -- Min: Rs. 10,000
    max_investment DECIMAL(18,2), -- Per investor
    
    -- Regulatory
    rera_id VARCHAR(100) UNIQUE,
    rera_approval_date DATE,
    approval_letter_url VARCHAR(500),
    
    -- Blockchain
    token_address VARCHAR(66) UNIQUE, -- Smart contract address
    tokens_minted DECIMAL(18,2),
    
    -- Timeline
    launch_date DATE,
    expected_completion_date DATE,
    construction_start_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending, approved, active, completed, stalled, cancelled
    published_at TIMESTAMP,
    
    -- Images & Documents
    thumbnail_url VARCHAR(500),
    images JSONB, -- Array of image URLs
    brochure_url VARCHAR(500),
    floor_plan_url VARCHAR(500),
    
    -- Compliance
    environmental_clearance BOOLEAN DEFAULT false,
    municipal_approval BOOLEAN DEFAULT false,
    insurance_coverage BOOLEAN DEFAULT false,
    
    -- Analytics
    investor_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_builder_id ON projects(builder_id);
CREATE INDEX idx_projects_city ON projects(city);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_rera_id ON projects(rera_id);
CREATE INDEX idx_projects_token_address ON projects(token_address);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_funding_target ON projects(funding_target);
```

### 4. investments Table

Tracks all investments made by investors in projects.

```sql
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Investment Details
    amount DECIMAL(18,2) NOT NULL, -- Investment amount in INR
    tokens DECIMAL(18,2) NOT NULL, -- Tokens minted (amount / 1000)
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    
    -- Payment
    payment_id UUID REFERENCES payments(id),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    
    -- Blockchain
    tx_hash VARCHAR(66), -- Smart contract transaction hash
    wallet_address VARCHAR(66), -- Investor's wallet for tokens
    
    -- ROI & Returns
    current_value DECIMAL(18,2),
    total_distributions DECIMAL(18,2) DEFAULT 0,
    roi_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Exit
    exit_date TIMESTAMP,
    exit_amount DECIMAL(18,2),
    exit_method VARCHAR(50), -- secondary_market, project_completion
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_project_id ON investments(project_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_created_at ON investments(created_at DESC);
CREATE INDEX idx_investments_wallet_address ON investments(wallet_address);
CREATE UNIQUE INDEX idx_investments_unique_per_project ON investments(user_id, project_id);
```

### 5. payments Table

Payment transaction records from Razorpay.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id UUID REFERENCES investments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Razorpay Details
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL,
    razorpay_signature VARCHAR(256),
    
    -- Payment Info
    amount DECIMAL(18,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    method VARCHAR(50), -- card, upi, netbanking, wallet
    
    -- Verification
    signature_verified BOOLEAN DEFAULT false,
    signature_verified_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'created', -- created, authorized, captured, failed, refunded
    
    -- Metadata
    email VARCHAR(255),
    phone VARCHAR(20),
    notes JSONB,
    
    -- Refund
    refund_id VARCHAR(100),
    refund_amount DECIMAL(18,2),
    refund_status VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
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

### 8. secondary_market_orders Table

Buy/sell orders in secondary marketplace.

```sql
CREATE TABLE secondary_market_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Order Details
    order_type VARCHAR(10) NOT NULL, -- BUY or SELL
    seller_id UUID REFERENCES users(id),
    buyer_id UUID REFERENCES users(id),
    
    -- Token Details
    token_amount DECIMAL(18,2) NOT NULL,
    price_per_token DECIMAL(18,2) NOT NULL, -- In INR
    total_price DECIMAL(18,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'open', -- open, filled, cancelled, expired
    
    -- Blockchain
    tx_hash VARCHAR(66),
    
    -- Timing
    expires_at TIMESTAMP,
    filled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_project_id ON secondary_market_orders(project_id);
CREATE INDEX idx_orders_seller_id ON secondary_market_orders(seller_id);
CREATE INDEX idx_orders_buyer_id ON secondary_market_orders(buyer_id);
CREATE INDEX idx_orders_status ON secondary_market_orders(status);
CREATE INDEX idx_orders_type ON secondary_market_orders(order_type);
CREATE INDEX idx_orders_created_at ON secondary_market_orders(created_at DESC);
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
    
    -- Documents
    document_upload_date TIMESTAMP,
    document_verification_date TIMESTAMP,
    
    -- Session
    session_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_user_id ON kyc_records(user_id);
CREATE INDEX idx_kyc_pan_number ON kyc_records(pan_number);
CREATE INDEX idx_kyc_status ON kyc_records(status);
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

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Status**: Complete
