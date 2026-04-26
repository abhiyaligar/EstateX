# Features & User Guide

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Getting Started](#getting-started)
4. [Investor Features](#investor-features)
5. [Builder Features](#builder-features)
6. [Admin Features](#admin-features)
7. [Complete User Workflows](#complete-user-workflows)
8. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview

### What is EstateX?

EstateX is a blockchain-powered real estate crowdfunding platform that allows millions to invest in premium real estate projects from just Rs. 10,000. Unlike traditional real estate investment which requires millions, EstateX breaks down projects into fractional ownership tokens.

**Key Benefits**:
- 🏠 Invest in premium properties with minimal capital
- 📊 Real-time portfolio tracking
- 🤝 Transparent milestone-based fund releases
- 💰 Monthly rental income distributions
- 🔄 Trade your stakes on secondary market
- ✅ 100% regulatory compliance
- ⛓️ Blockchain-verified ownership

---

## User Roles

### Investor

**Who**: Individual investors seeking real estate exposure

**Capabilities**:
- Create account with Aadhaar + PAN verification
- Invest in multiple projects
- Track real-time portfolio value
- Receive monthly rental distributions
- Trade tokens on secondary marketplace
- View project milestones & progress

**Permissions**:
```
read:projects
write:investments
read:portfolio
write:kyc
write:secondary_market_orders
read:compliance_documents
```

**Investment Limits**:
```
Minimum: Rs. 10,000 (1 token, 1 property)
Maximum: Unlimited
Portfolio Limit: No limit (diversify across projects)
Daily Transaction: Rs. 50 lakhs
```

### Builder

**Who**: Registered real estate developers seeking project funding

**Capabilities**:
- Register company & RERA projects
- Create fundraising campaigns
- Track funding progress
- Update project milestones
- Manage investor communications
- View analytics & investor breakdown
- **My Projects Workspace**: High-density dashboard for project lifecycle management
- **Dual Wallet System**: Separate construction funds from personal capital

**Permissions**:
```
read:own_projects
write:projects
read:fundraising_stats
read:investor_list
write:milestone_updates
read:compliance_requirements
```

**Requirements**:
- RERA registration (verified on signup)
- Company registration (CIN for Indian companies)
- Audited financials (3 years)
- Insurance certificate

### Admin

**Who**: EstateX staff managing platform operations

**Capabilities**:
- Approve/reject KYC applications
- Approve/reject builder registrations
- Verify project milestones
- Release escrowed funds
- Generate compliance reports
- Handle dispute resolution
- Monitor platform health

**Permissions**:
```
read:all_users
write:kyc_approval
write:project_approval
write:milestone_verification
write:compliance_reports
write:dispute_resolution
```

### Super Admin

**Who**: EstateX founder/executive team

**Capabilities**:
- All admin permissions
- Manage admin users
- System configuration
- Emergency actions
- Complete audit logs access

---

## Getting Started

### For Investors

#### Step 1: Create Account (2 minutes)
```
1. Download mobile app or visit estateX.com
2. Click "Sign Up as Investor"
3. Enter email & create password
4. Click verification link in email
5. Account created & ready for KYC
```

#### Step 2: Complete KYC (10 minutes)
```
1. Go to Profile → KYC
2. Enter basic info (name, DoB, address)
3. Upload Aadhaar
   ├── Click camera icon
   ├── Take photo or upload
   └── Mark face visible
4. Verify via OTP
   ├── Enter OTP received on phone
   └── Confirm verification
5. Enter PAN
   ├── Type PAN number
   ├── Verify name match
   └── System auto-confirms with NSDL
6. Add Bank Account
   ├── Enter account number & IFSC
   ├── Account holder name
   └── Verify (next 48 hours)
7. Status: Submitted → Approved (Manual Review)
```

**KYC Status**: Check anytime in Profile → KYC Status
```
Status Flow:
├── Not Started: Complete documents
├── Submitted: Awaiting manual review
├── In Review: Claimed by a compliance officer
├── Approved: Ready to invest
└── Rejected: Contact support for resubmission
```

#### Step 3: Make First Investment (5 minutes)
```
1. Go to Home → Featured Projects
2. Browse and click on a project
3. Click "Invest Now" button
4. Select amount (minimum Rs. 10,000)
5. Review breakdown:
   ├── Investment amount
   ├── Number of tokens
   ├── Expected monthly return
   └── Expected ROI
6. Click "Proceed to Payment"
7. Choose payment method:
   ├── Razorpay (UPI, Cards, Wallets)
   └── Bank transfer (net banking)
8. Complete payment
9. Verify payment in app
10. Tokens mint on blockchain (5-10 minutes)
11. Investment confirmed!
```

#### Step 4: Track Investment (Ongoing)
```
Portfolio Page shows:
├── Total invested: Rs. amount
├── Current value: Market value
├── Unrealized gains: % & Rs.
├── Monthly distributions: Received this month
├── Holdings breakdown:
│   ├── Project name
│   ├── Tokens owned
│   ├── Current value
│   ├── % of project
│   └── Expected monthly return
└── Performance chart: 6M, 1Y, All time
```

#### Step 5: Receive Monthly Distribution (Automatic)
```
Process (First of every month):
1. Builder collects rental income for month
2. Revenue distributed pro-rata by tokens
3. 1% fee deducted for platform
4. Amount transferred to investor bank account
5. Notification sent in app
6. Transaction visible in Distributions tab

View Distributions:
├── Portfolio → Distributions
├── Monthly history table
├── Amount, date, status
└── Download as PDF invoice
```

---

### For Builders

#### Step 1: Register Company (30 minutes)
```
1. Download app and click "Sign Up as Builder"
2. Enter personal KYC (full procedure - see Investor guide)
3. Add Company Details:
   ├── Company name
   ├── Registration number (CIN)
   ├── Business type
   ├── Year established
   └── Headquarters address
4. Upload Documents:
   ├── Company registration certificate
   ├── Audited balance sheet (3 years)
   ├── Income tax returns (3 years)
   └── Bank statements (6 months)
5. Add RERA Registration:
   ├── State
   ├── RERA registration number
   ├── Registered projects
   └── Upload registration certificate
6. Submit for verification
7. Status: Pending → Approved (5-7 business days)
```

#### Step 2: List Project (1 hour setup)
```
1. Go to Projects → Create New
2. Add Basic Info:
   ├── Project name
   ├── Location (city, address)
   ├── Property type (residential, commercial)
   └── Total units
3. Add Financial Details:
   ├── Total project cost
   ├── Funding target (50-90% typically)
   ├── Number of tokens (usually total cost / 1000)
   ├── Price per token (Rs. 1,000 standard)
   └── Expected completion date
4. Add Project Details:
   ├── Description
   ├── Key features
   ├── Amenities list
   ├── Location highlights
   └── Developer track record
5. Add Construction Plan:
   ├── Timeline (months to completion)
   ├── Breakdown of phases
   └── Expected rental yield (%)
6. Upload Documents:
   ├── Approved project plans
   ├── Environmental clearance
   ├── Municipal approval
   ├── Location map
   └── Architect certification
7. Set Milestones:
   ├── Milestone 1: Foundation (20% of funds)
   ├── Milestone 2: Structure (35% of funds)
   ├── Milestone 3: Internal (30% of funds)
   └── Milestone 4: Handover (15% of funds)
8. Review & Submit
9. Status: In Review → Approved (2-3 days admin review)
```

#### Step 3: Track Fundraising (Ongoing)
```
Dashboard shows:
├── Funding progress: Bar chart showing $X / $Y target
├── Active investors: Count of unique investors
├── Total raised: Amount so far
├── Time remaining: Days until deadline
├── Daily activity: Recent investments chart
└── Investor breakdown: Cities, investment sizes
```

#### Step 4: Update Project Progress (Monthly)
```
1. Go to My Projects → Select project
2. Click "Update Milestone"
3. Enter milestone details:
   ├── Work completed (%)
   ├── Description of progress
   ├── Challenges (if any)
   ├── Next steps
   └── Expected completion date
4. Upload evidence:
   ├── Site photos (2-5 images)
   ├── Construction report
   └── Inspector certification
5. Submit for verification
6. Admin reviews (within 48 hours)
7. Once approved → Fund released to builder
```

#### Step 5: Prepare for Distribution (Monthly)
```
Process:
1. Building completed & operational
2. Collect rental income for month
3. Go to Projects → Distributions
4. Create distribution:
   ├── Month & year
   ├── Total rental collected
   ├── Expenses deducted (utilities, maintenance, taxes)
   ├── Net revenue
   └── Submit receipt/documentation
5. EstateX admin verifies (within 48 hours)
6. System auto-calculates per-token distribution
7. Amounts transferred to all investors by 5th of next month
8. Monthly reports sent to investors
```

---

## Investor Features

### 1. Project Discovery & Analysis

**Browse Projects**
```
Home → Featured Projects shows:
├── Project cards with:
│   ├── Location & image
│   ├── Funding progress (%)
│   ├── Target return (%)
│   ├── Time to completion
│   ├── Number of investors
│   └── "Learn More" button

Filters & Sort:
├── Filter by location (city)
├── Filter by property type
├── Filter by investment size required
├── Sort by return %, distance, completion date
└── Search by project name
```

**Analyze Project**
```
Project Detail Page shows:
├── Photos gallery (10-20 images)
├── Project description & highlights
├── Key metrics:
│   ├── Total cost
│   ├── Funding target & collected
│   ├── Token price (typically Rs. 1,000)
│   ├── Expected rental yield (e.g., 8% p.a.)
│   ├── Expected ROI calculation
│   └── Completion timeline
├── Developer profile
│   ├── Track record (# previous projects)
│   ├── Completion rate (%)
│   ├── Investor rating (5-star)
│   └── RERA certificate
├── Investment breakdown
│   ├── Where funds go (land, construction, etc.)
│   └── Fund release milestones
├── Milestone timeline
│   ├── Phase 1: Foundation (2 months, 20% funds)
│   ├── Phase 2: Structure (4 months, 35% funds)
│   ├── Phase 3: Interiors (4 months, 30% funds)
│   └── Phase 4: Handover (1 month, 15% funds)
├── Risks & disclaimer
├── "Invest Now" button (for approved investors)
└── "Save Project" for wishlist
```

### 2. Portfolio Management

**View Holdings**
```
Portfolio → Holdings shows table:
├── Project name
├── Location
├── Tokens owned
├── Current price per token
├── Total value (tokens × price)
├── Invested amount
├── Gain/Loss ($ and %)
├── Expected monthly return (rupees)
├── Days to completion
└── Status (Active, Completed, etc.)

Summary Card shows:
├── Total invested (all time)
├── Current portfolio value
├── Unrealized gains (%)
├── Expected monthly income
├── Performance vs market
└── Asset Allocation (New):
    ├── Exposure by City (Pie Chart)
    ├── Exposure by Property Type (Residential, Commercial, Industrial)
    └── Relationship-backed project metadata (Real-time fetching)
```

**Monitor Milestones**
```
Portfolio → Project Details → Milestones:
├── Timeline view of all milestones
├── Current milestone highlighted
├── For each milestone:
│   ├── Completion percentage
│   ├── Expected completion date
│   ├── Status (In Progress, Verified, Released)
│   ├── Funds associated (%)
│   └── Latest update with photos
└── Notification when milestone approved
```

### 3. Secondary Market

**Why Trade?**
```
Reasons to use secondary market:
├── Rebalance portfolio (sell underperforming)
├── Need liquidity (sell token quickly)
├── Upgrade investments (sell low-value, buy high-value)
├── Diversify (spread across more projects)
└── Take profits (sell appreciated tokens)
```

**Sell Tokens**
```
Portfolio → Project → Sell:
1. Select number of tokens to sell
2. Set price per token
   ├── Market price suggestion: Rs. 1,050 (5% appreciation)
   ├── Or set custom price
   └── Affects attractiveness to buyers
3. Set expiration (7, 14, 30 days)
4. Review details:
   ├── Gross proceeds (tokens × price)
   ├── Platform fee (1%)
   ├── Net proceeds
   └── **Circuit Breaker Check**: The system rejects orders priced >20% or <10% away from the day's opening price.
5. Confirm & list order. **Performance NOTE**: The order is validated and pushed instantly. Matching logic runs in the background.
6. Order visible on marketplace within milliseconds.
7. When buyer found:
   ├── Notification sent via Supabase Realtime
   ├── Tokens locked (cannot sell again)
   ├── Payment processed
   ├── Amount credited to bank (24-48 hours)
   └── Tokens transferred to buyer
```

**Buy Tokens**
```
Secondary Market → Browse Orders:
├── Filter by project
├── Sort by price (lowest first)
└── For each listing:
    ├── Seller rating & reviews
    ├── Price per token
    ├── Tokens available
    ├── Days remaining
    └── "Buy Now" button

Purchase Flow:
1. Click "Buy Now"
2. Select quantity (cannot exceed listed)
3. Review breakdown:
   ├── Quantity × price
   ├── Platform fee (1%)
   ├── Total cost
   └── Processing time
4. Payment via Razorpay.
5. Tokens transferred to your account (Instant settlement).
6. Start receiving distributions on new project. **Real-time NOTE**: The Order Book and Ledger update instantly on your screen without refreshing.
```

**Manage Active Orders**
```
Secondary Market → Active Intents:
├── View all your open buy/sell orders.
├── Modify Order:
│   ├── Adjust price per token based on real-time market depth.
│   └── Change quantity of tokens to buy/sell.
└── Cancel Order:
    ├── Click 'Cancel' to instantly remove your order from the public order book.
    └── Locked tokens (for sell orders) are immediately returned to your portfolio balance.
```

**Advanced Trading Terminal**
```
Secondary Market → Terminal:
├── Interactive Charting:
│   ├── View real-time aggregated trades via TradingView Lightweight Charts.
│   ├── Seamlessly switch between Candlestick, Line, and Area charts.
│   ├── **Turbo Mode**: Historical 1-day candles are pre-computed every midnight. Charts load 1000x faster than traditional aggregation methods.
│   └── Built-in volume histogram and 20-period Simple Moving Average (SMA).
├── Deep Customization:
│   ├── Change data bucket timeframes (1m, 5m, 1h, 1d).
│   └── Filter historical data directly (1D, 1W, 1M, 3M, 1Y, ALL).
├── Fullscreen Mode:
│   └── Click the 'Maximize' icon to hide orderbooks and expand the terminal for distraction-free technical analysis.
└── Macro Analytics Panel:
    ├── Real-time display of YoY property growth percentage for the project's pincode.
    └── Average rental yield and local demand score to aid fundamental analysis.
```

### 4. Distribution Tracking

**View Monthly Distributions**
```
Portfolio → Distributions:
├── Table of all distributions received:
│   ├── Month/year
│   ├── Project name
│   ├── Amount per token
│   ├── Your tokens count
│   ├── Total received (amount)
│   ├── Status (Processed, Pending)
│   └── Transaction ID
├── Summary:
│   ├── Total distributed (YTD)
│   ├── Average monthly amount
│   ├── Frequency (1st of month)
│   └── Next distribution date
└── Download option:
    ├── As PDF statement
    ├── As CSV (for tax filing)
    └── Email to self/accountant
```

**Understand Distribution Calculation**
```
Example:
┌─────────────────────────────────────┐
│ Monthly Distribution Breakdown      │
├─────────────────────────────────────┤
│ Project: Downtown Residences        │
│ Rental Income Collected: Rs. 5 Cr   │
│ Total Tokens: 50,000                │
│ Your Tokens: 100                    │
├─────────────────────────────────────┤
│ Your Share: (100/50,000) × Rs. 5 Cr │
│         = 0.2% × Rs. 5 Cr           │
│         = Rs. 10,00,000             │
│ Per Token: Rs. 10,00,000 / 100      │
│         = Rs. 10,000 per token      │
├─────────────────────────────────────┤
│ Tax Deducted: Rs. 1,50,000 (15% TDS)│
│ Net Credited: Rs. 8,50,000          │
│ Status: Processed (5th of month)    │
└─────────────────────────────────────┘
```

---

## System Integrity & Safety

The EstateX backend implements institutional-grade safeguards to protect investor capital:

### 1. Atomic Settlement Engine
All financial mutations (payouts, trades, settlements) use **Atomic Database Transactions**. This means a transfer never happens "halfway"—either the entire transaction succeeds, or it fails and reverts completely. This eliminates the risk of double-spending or lost funds during high-concurrency events.

### 2. Database Safety Net
We enforce strict `CheckConstraints` directly on the database hardware. This acts as a physical wall: it is mathematically impossible for any wallet balance (User or Builder) to drop below zero. Any code bug attempting to create a negative balance is instantly blocked by the database engine.

### 3. Circuit Breaker Mechanism
To ensure market stability, every project in the Secondary Market has a dynamic volatility band:
- **Upper Circuit**: +20% from the session's opening price.
- **Lower Circuit**: -10% from the session's opening price.
Orders outside these bands are automatically rejected to prevent artificial price pumping and panic selling.

---

## Builder Features

### 1. Project Management

**Create Project Campaign**
```
Dashboard → Create Project → Campaign Setup:
├── Basic Info
│   ├── Project name & location
│   ├── Property type (residential, commercial, mixed)
│   └── Total units/area
├── Financial Structure
│   ├── Total project cost breakdown
│   ├── Funding target (% to raise)
│   ├── Token structure (tokens = cost / Rs. 1000)
│   └── Token price (typically Rs. 1,000)
├── Timeline
│   ├── Construction duration (months)
│   ├── Expected completion date
│   └── Milestone breakdown
├── Returns
│   ├── Expected rental yield (%)
│   ├── Price appreciation potential
│   └── ROI calculation
└── Media
    ├── Upload photos (10-20)
    ├── Upload video (optional)
    └── Floor plans (PDF/image)
```

**Track Campaign Progress**
```
Campaign Dashboard shows:
├── Funding meter:
│   ├── Target: Rs. 50 Cr
│   ├── Collected: Rs. 35 Cr (70%)
│   ├── Remaining: Rs. 15 Cr (30%)
│   └── Days to close: 45
├── Investor metrics:
│   ├── Total investors: 2,500
│   ├── Average investment: Rs. 14 lakhs
│   ├── New investors today: 45
│   └── Repeat investors: 340 (13%)
├── Daily activity:
│   ├── Investment graph (7-day, 30-day)
│   └── Peak times for conversions
└── Top investors:
    ├── Name & location
    ├── Investment amount
    └── When invested
```

### 2. Milestone Management

**Submit Milestone Update**
```
My Projects → Project → Milestones:
1. Click current/next milestone
2. Complete update form:
   ├── Overall progress (%) - e.g., Foundation 85% done
   ├── Completion status (On time / Delayed / Early)
   ├── Description:
   │   ├── Work completed this month
   │   ├── Challenges faced
   │   ├── Solutions applied
   │   └── Next steps planned
   ├── Financial update:
   │   ├── Funds received for this phase
   │   ├── Funds utilized
   │   └── Remaining for phase
   └── Timeline adjustment:
       ├── Original completion date
       ├── Revised completion date (if applicable)
       └── Reason for change
3. Upload evidence:
   ├── Site photos (minimum 3):
   │   ├── Overall site view
   │   ├── Work in progress
   │   └── Recent progress
   ├── Construction report (PDF)
   ├── Inspector certification
   └── Quality assurance check
4. Submit for verification
5. Status: Awaiting Verification
6. Admin reviews within 48 hours:
   ├── If approved → Funds released
   ├── If rejected → Comments provided, resubmit
   └── Notification sent to investors
```

**Fund Release Process**
```
Timeline:
│ Builder submits milestone update
│ ↓ (24 hours for document review)
│ Admin verifies update
│ ├─ If approved:
│ │  ├─ Smart contract release triggered
│ │  ├─ Escrowed funds transferred
│ │  └─ Notification to builder (24 hours)
│ └─ If rejected:
│    ├─ Comments sent to builder
│    └─ Resubmit with corrections
│ ↓ (48-72 hours total)
│ Funds in builder account
│
Notes:
├─ All updates visible to investors real-time
├─ Transparency maintained (no hidden updates)
└─ Fund release automatic (no manual approval)
```

### 3. Investor Communication

**Send Updates**
```
My Projects → Communications → Send Update:
├── Update type:
│   ├── Milestone update (sent to all investors)
│   ├── Event notification (e.g., site visit)
│   ├── General announcement
│   └── Emergency notice
├── Message content:
│   ├── Title
│   ├── Body text
│   ├── Attachments (photos, documents)
│   └── Scheduled time (now or later)
├── Recipients:
│   ├── All investors (default)
│   ├── Filter by investment size
│   └── Custom list (early backers, etc.)
└── Notification:
    ├── In-app notification
    ├── Email (opt-in by investor)
    └── SMS (premium feature)
```

### 4. Builder Wallet (Dual Ledger)

**Separate Business Funds**
```
Dashboard → Builder Wallet:
├── Dedicated Business Ledger:
│   ├── Tracks all project construction funds.
│   ├── Strictly isolated from personal investor funds.
│   └── Prevents commingling of personal and business capital.
├── Balance View:
│   ├── Total liquid capital available for withdrawal.
│   ├── Breakdown of funds by project milestones.
│   └── Recent transaction history (deposits, milestone credits, withdrawals).
└── Withdrawal Process:
    ├── Select registered business bank account.
    ├── Enter amount to withdraw.
    ├── Confirm via OTP.
    └── Funds credited in 24-48 hours.
```

**Investor Queries**
```
My Projects → Investor Queries:
├── All queries from investors visible
├── Grouped by:
│   ├── Milestone questions
│   ├── Financial/returns questions
│   ├── Timeline questions
│   └── General questions
├── Response features:
│   ├── Reply directly in app
│   ├── FAQ knowledge base (reuse answers)
│   ├── Prioritize high-value investors
│   └── Track response time
└── Analytics:
    ├── Common questions (for FAQ)
    ├── Investor sentiment
    └── Response time metrics
```

---

## Admin Features

### 1. KYC Verification

**Review KYC Applications**
```
Admin Dashboard → KYC Approvals:
├── Queue of pending applications
├── For each application:
│   ├── Personal info (name, email, PAN)
│   ├── Aadhaar verification status
│   ├── PAN verification status
│   ├── Bank account status
│   ├── Document uploads (address proof, etc.)
│   └── Timestamp of submission
├── Action options:
│   ├── Approve (✓)
│   ├── Request more info (→ back to investor)
│   └── Reject with reason
├── Analytics:
│   ├── Daily approvals
│   ├── Average verification time
│   └── Rejection reasons (for improvement)
└── Bulk actions:
    ├── Approve multiple (for obvious cases)
    └── Generate batch reports
```

### 2. Project Verification

**Review Project Listings**
```
Admin Dashboard → Project Approvals:
├── Pending projects for approval
├── For each project:
│   ├── Builder profile (company, RERA cert)
│   ├── Project documents (plans, approvals)
│   ├── Financial structure (feasibility check)
│   ├── Timeline (realistic assessment)
│   └── Risk assessment
├── Verification checklist:
│   ├── ☐ RERA registration verified
│   ├── ☐ Builder credibility checked
│   ├── ☐ Project documents authentic
│   ├── ☐ Financial figures reasonable
│   ├── ☐ Milestone timeline realistic
│   ├── ☐ Risk disclosures adequate
│   └── ☐ Compliance requirements met
├── Action:
│   ├── Approve (publish project)
│   ├── Request changes (send to builder)
│   └── Reject (with detailed reason)
└── Once approved:
    └── Project visible to all investors
```

### 3. Milestone Verification

**Verify Project Progress**
```
Admin Dashboard → Milestone Verifications:
├── Queue of milestone updates awaiting verification
├── For each update:
│   ├── Project name & phase
│   ├── Builder's progress report
│   ├── Photo evidence (3+ photos)
│   ├── Inspector certification
│   ├── Previous milestone status
│   └── Timeline comparison (on-time? delayed?)
├── Verification process:
│   ├── Review photos for authenticity
│   ├── Cross-check with timeline
│   ├── Verify inspector credentials
│   ├── Compare with previous photos
│   └── Assess completion percentage
├── Decision:
│   ├── Approve → Auto-release funds to builder
│   ├── Request clarification → Back to builder
│   └── Reject → Explain issues, request resubmission
└── Fund release:
    └── Automatic upon approval (no manual transfer)
```

### 4. Dispute Resolution

**Handle Investor Complaints**
```
Admin Dashboard → Disputes:
├── New complaint alerts
├── For each dispute:
│   ├── Investor info & complaint details
│   ├── Project & investment amount
│   ├── Timeline & conversation history
│   └── Suggested resolution
├── Toolset:
│   ├── Access user transaction history
│   ├── View immutable project logs
│   ├── Contact builder/investor directly
│   └── Implement resolution (refunds, credits, etc.)
└── Close: Mark as resolved, log for compliance.

### 5. Macro Analytics Management

**Global Market Intelligence Database**
```
Admin Dashboard → Analytics Tab:
├── Market Intelligence Grid:
│   ├── View all regional macro nodes by Pincode
│   ├── Real-time indicators:
│   │   ├── YoY Growth (%)
│   │   ├── Avg. Rental Yield (%)
│   │   └── Demand Score (0-100)
│   └── Last update timestamp tracking
├── Node Lifecycle Management:
│   ├── NEW NODE: Initialize regional intelligence for new geographical areas
│   ├── UPDATE: Adjust indicators as market cycles shift
│   └── DELETE: Remove deprecated or incorrect regional data
└── System Integrity:
    └── Direct database relationship mapping between Pincodes and active Projects.
```
│   ├── Attached evidence/documents
│   └── Category (payment issue, milestone delay, etc.)
├── Resolution process:
│   ├── Contact builder for explanation (24 hours)
│   ├── Review all evidence
│   ├── Determine responsible party
│   ├── Propose resolution
│   └── Implement fix (refund, extension, credit)
├── Tracking:
│   ├── Status: Open → In Review → Resolved → Closed
│   ├── SLA: Respond within 24 hours
│   └── Follow-up: Ensure investor satisfaction
└── Escalation:
    ├── To legal if needed (repeated violations)
    └── To RERA if builder breach confirmed
```

### 6. Revenue Distribution Settlement

**Review & Approve Monthly Rental Cycles**
```
Admin Dashboard → Revenue Settlements:
├── Pending Settlements Queue:
│   ├── Lists all rental cycles in 'pending_approval' state.
│   ├── For each cycle:
│   │   ├── Project name & builder identity
│   │   ├── Month / Year of the distribution
│   │   ├── Gross amount deposited by builder
│   │   ├── Calculated 1% platform fee
│   │   ├── Net amount to be distributed (99%)
│   │   └── Number of eligible brick holders
│   └── Action Options:
│       ├── APPROVE → Executes pro-rata distribution to all holders.
│       │   ├── System queries brick_holdings for bricks held ≥ 30 days.
│       │   ├── Creates individual RentalPayout records per investor.
│       │   └── Credits each investor's wallet_balance automatically.
│       └── REJECT → Permanently removes the cycle (builder must re-submit).
└── Settlement Audit:
    ├── View completed cycles with settlement timestamps.
    ├── Drill into individual payouts per investor.
    └── Track admin who approved each settlement.
```

**Revenue Distribution Data Flow**
```
Builder/Admin deposits rental → RentalCycle created (pending_approval)
    │
    ▼
Admin reviews amount & period
    │
    ├─ APPROVE:
    │   ├─ Query: brick_holdings WHERE created_at ≤ (cycle.month - 30 days)
    │   ├─ Sum total eligible bricks
    │   ├─ For each holder: payout = (holder_bricks / total_bricks) × net_amount
    │   ├─ Create RentalPayout record
    │   ├─ Credit users.wallet_balance
    │   └─ Mark RentalCycle.status = 'settled'
    │
    └─ REJECT: DELETE RentalCycle (builder re-submits with correction)
```

### 7. DAO Governance Management

**Create & Manage Voting Proposals**
```
Admin Dashboard → Governance Tab:
├── All Proposals View:
│   ├── Lists proposals across all projects.
│   ├── Status filter: Active, Closed, Executed.
│   └── Real-time vote tallies with weighted distribution.
├── Create Proposal:
│   ├── Select target project.
│   ├── Enter title & detailed rationale.
│   ├── Define multi-choice options (e.g. "Renew", "Sell", "Abstain").
│   └── Set UTC deadline for voting closure.
└── Execute Consensus:
    ├── View final weighted distribution chart.
    ├── Mark winning option (result_option_index).
    └── Set status to 'executed' to close the record.
```

### 8. Compliance Reporting

**Generate Compliance Reports**
```
Admin Dashboard → Reports:
├── Monthly compliance report:
│   ├── KYC completion rate
│   ├── AML screening results
│   ├── Fund flow audit
│   ├── Milestone timelines vs actual
│   ├── Dispute statistics
│   └── Regulatory updates needed
├── Quarterly report:
│   ├── Total platform metrics (users, funds, projects)
│   ├── Risk assessment
│   ├── Regulatory alignment check
│   ├── Security audit findings
│   └── Recommendations for improvement
├── Annual report:
│   ├── Financial summary
│   ├── Audit by external firm
│   ├── Investor protection status
│   └── Regulatory certifications
└── Export:
    ├── PDF for stakeholders
    ├── Excel for detailed analysis
    └── Email to regulators (auto)
```

---

## Complete User Workflows

### Workflow 1: New Investor's First Investment

```
Day 1 - Signup (5 mins)
├─ Download app
├─ Click "Sign Up"
├─ Enter email & password
├─ Verify email link
└─ Account created

Day 1-2 - KYC (10 mins active)
├─ Profile → KYC
├─ Enter name, DoB, address
├─ Upload Aadhaar photo
├─ Verify via OTP
├─ Enter PAN number
├─ Add bank account
└─ Status: Submitted (Awaiting manual approval ~24h)

Day 2 - First Investment (20 mins)
├─ Home → Featured Projects
├─ Browse 10+ projects
├─ Read "Downtown Residences" (Rs. 50 Cr, 8% yield)
├─ Click "Invest Now"
├─ Select Rs. 1 Lakh (100 tokens)
├─ Review breakdown:
│  ├─ Your tokens: 100
│  ├─ Expected monthly: Rs. 667
│  └─ Expected ROI over 5 years: Rs. 40 L
├─ Payment via Razorpay
├─ Enter OTP
├─ Payment confirmed
└─ Tokens appear in Portfolio (5 mins)

Day 2 onwards - Monitor
├─ Daily check: Portfolio shows Rs. 1L invested
├─ Monthly distributions: Rs. 667 credited (1st of month)
├─ Watch milestones: Foundation 60% complete
├─ After 2 months: Consider selling some tokens (at 2% profit)
└─ After 5 years: Property completed, rental permanent income
```

---

## Social Features (In Development 🚧)

EstateX is expanding from a pure investment platform into a vibrant social ecosystem. The following features are currently being implemented:

### 1. Investment Circles
- Connect with friends and family to pool capital.
- Private discussion boards for shared investment strategies.
- Co-ownership dashboards for group investments.

### 2. Community Discussions
- Project-specific forums for investors to ask questions.
- Verified builder Q&A sessions.
- Expert market analysis and community sentiment tracking.

### 3. Investor Reputation
- Badges for long-term holders and successful exiters.
- Community-driven trust scores for builders.

> [!NOTE]
> These features are currently in the database schema and backend implementation phase. Full UI integration is expected in the next major release.

---

### Workflow 2: Builder's Project Launch

```
Month -3 - Registration (1 hour active)
├─ Download app
├─ Enter company details
├─ Upload documents:
│  ├─ Registration certificate
│  ├─ 3-year financials
│  ├─ RERA registration
│  └─ Insurance certificate
├─ Personal KYC (like investor KYC)
└─ Status: Under Review (5-7 days)

Month -2 - First Project Setup (2 hours active)
├─ Dashboard → Create Project
├─ Fill project details:
│  ├─ Name: "Downtown Residences"
│  ├─ Location: Mumbai, Andheri West
│  ├─ Total cost: Rs. 50 Crores
│  ├─ Funding target: Rs. 45 Cr (90%)
│  ├─ 50,000 tokens at Rs. 1,000 each
│  ├─ Expected rental yield: 8% p.a.
│  └─ Completion: 24 months
├─ Upload:
│  ├─ 20 project photos
│  ├─ Floor plans
│  ├─ Approved project plans
│  └─ Construction schedule
├─ Set milestones:
│  ├─ Foundation (20%, 5 months)
│  ├─ Structure (35%, 9 months)
│  ├─ Interiors (30%, 8 months)
│  └─ Handover (15%, 2 months)
└─ Submit for review (admin approves in 2-3 days)

Month -1 - Project Goes Live
├─ Project published on platform
├─ Appears in "Featured Projects"
├─ Marketing begins (social media, email)
└─ First investments start flowing

Month 0-6 - Fundraising & Construction
├─ Track daily:
│  ├─ Funds collected
│  ├─ Investor count
│  └─ Days to close
├─ Reach target in 120 days (Rs. 45 Cr)
├─ Celebrate milestone with investors
└─ Begin construction

Month 6 - First Milestone Update
├─ Site: Foundation 100% complete
├─ Take photos & inspection report
├─ Submit to admin:
│  ├─ Update text
│  ├─ 5 site photos
│  └─ Inspector certification
├─ Admin verifies (48 hours)
├─ Funds released: Rs. 9 Cr (20%)
└─ Construction continues

Months 7-24 - Progress Updates
├─ Monthly milestone updates:
│  ├─ Phase 2: Structure progressing (months 7-15)
│  ├─ Phase 3: Interiors underway (months 16-23)
│  └─ Phase 4: Final work & handover (month 24)
├─ Each approved update → automatic fund release
├─ Investor confidence high (transparent progress)
└─ Zero delays in funding

Month 24+ - Handover & Distributions
├─ Project completed
├─ Rental income begins
├─ Monthly distributions auto-calculated:
│  ├─ Month 1: Rs. 3.5 Cr rental → Rs. 3.46 Cr (1% fee) → 10K per token
│  ├─ Investor with 100 tokens → Rs. 10 lakhs monthly
│  └─ Investor realizes 8% p.a. as promised
├─ Project appreciation:
│  ├─ Token price appreciation to Rs. 1,100 (10% in 2 years)
│  ├─ Investor can sell at profit on secondary market
│  └── Builder reputation enhanced (more future projects funded)
```

### Workflow 3: Investor Sells on Secondary Market

```
Scenario: 
Investor holds 100 tokens in Downtown Residences
Project 50% complete, token price appreciated to Rs. 1,050
Investor needs cash for family emergency

Day 1 - Create Sell Order
├─ Portfolio → Holdings
├─ Click "Downtown Residences"
├─ Click "Sell Tokens"
├─ Enter details:
│  ├─ Quantity: 50 tokens
│  ├─ Price: Rs. 1,050/token (market rate)
│  ├─ Expiration: 30 days
│  └─ Reason (optional): Early exit needed
├─ Review breakdown:
│  ├─ Gross: 50 × Rs. 1,050 = Rs. 52.5 lakhs
│  ├─ Fee (1%): Rs. 52,500
│  └─ Net: Rs. 52.0 lakhs
├─ Submit order
└─ Tokens locked (cannot sell again until cancelled)

Days 1-10 - Waiting
├─ Order visible on Secondary Market
├─ Buyers browse available tokens
├─ Interest from 3 investors
├─ Inquiry from investor in Delhi (wants to buy 25)

Day 10 - Partial Match
├─ Delhi investor buys 25 tokens @ Rs. 1,050
├─ Notification: "25 tokens sold!"
├─ Amount credited to bank (next morning)
├─ Received: Rs. 26 lakhs (after 1% fee)
├─ Remaining: 25 tokens still on sale

Day 15 - Full Match
├─ Mumbai investor buys remaining 25 tokens
├─ All 50 tokens sold
├─ Total received: Rs. 52 lakhs (50 × 1,050 - 1% fee)
├─ Bank account credited (next morning)
└─ Order closed

Post-sale:
├─ Investor still holds 50 original tokens
├─ Continues receiving distributions on 50 tokens
├─ Sold 50 tokens at Rs. 1,050 (Rs. 5 lakh profit)
├─ New owners (25+25) start receiving distributions
└─ Buyer can later resell or hold for long-term
```

---

## Troubleshooting & FAQ

### Common Issues & Solutions

#### KYC Related

**Q: Why is my KYC stuck "In Review"?**
```
A: Usually resolves in 24 hours. If longer:
├─ Check email for requests for more info
├─ Contact support: support@estateX.com
├─ Provide ticket number from app
└─ Escalation takes 24-48 hours max
```

**Q: Aadhaar verification failed. What to do?**
```
A: Common causes & fixes:
├─ Photo too dark/blurry → Take in bright light
├─ Face not visible → Hold Aadhaar away, show full face
├─ Info mismatch → Check name matches exactly on Aadhaar
├─ Server issue → Try again in 1 hour
└─ Still failing → Upload Aadhaar as PDF instead
```

**Q: Can I change my bank account after KYC?**
```
A: Yes, anytime:
├─ Profile → Bank Accounts
├─ Click "Add New Account"
├─ Enter new details
├─ New account verified in 48 hours
└─ Distributions go to latest added account
```

#### Investment Related

**Q: Minimum investment is Rs. 10,000. Can I invest less?**
```
A: No, minimum is Rs. 10,000 (1 token) per project.
However:
├─ You can start with 1 project (Rs. 10K)
├─ Then add to another project later
├─ Build portfolio gradually
└─ No maximum investment limit
```

**Q: How long does payment processing take?**
```
A: Typical timeline:
├─ UPI/Debit Card: Instant to 5 mins
├─ Credit Card: 5-15 mins
├─ Net Banking: 5-30 mins
├─ Tokens appear in portfolio: Within 1 hour
├─ If delayed:
│  ├─ Check email for payment status
│  ├─ Check bank confirmation
│  └─ Contact support if still stuck
└─ Support can resend funds (instant)
```

**Q: Can I cancel investment after payment?**
```
A: Depends on status:
├─ Before tokens minted (< 1 hour): Can cancel for full refund
├─ After tokens minted: Cannot cancel, but can sell on secondary market
├─ Refund timeline: 5-7 working days to bank
└─ Contact support for cancellation request
```

**Q: What if a project doesn't meet funding target?**
```
A: Refund process:
├─ Fundraising ends if target not met within deadline
├─ All invested funds automatically refunded
├─ No fee charged for failed projects
├─ Refund to original bank account
└─ Timeline: 10-15 working days
```

#### Portfolio & Distributions

**Q: Why haven't I received this month's distribution?**
```
A: Timeline for distributions:
├─ Builder should pay by 25th of month
├─ EstateX verifies by 28th
├─ Distributions credited by 5th of next month
├─ If you don't see by 10th:
│  ├─ Check app under Portfolio → Distributions
│  ├─ Verify you held tokens all month
│  ├─ Check bank account for amount
│  └─ Contact support with project name
```

**Q: How is distribution tax calculated?**
```
A: Tax withholding:
├─ Rental income = House Property income
├─ TDS deducted @ 15% (resident) / 30% (NRI)
├─ Certificate sent for income tax filing
├─ Example:
│  ├─ Monthly income: Rs. 10,000
│  ├─ TDS (15%): Rs. 1,500
│  ├─ Net credited: Rs. 8,500
│  └─ Certificate: Rs. 10,000 for tax return
└─ You can claim TDS credit in tax filing
```

**Q: Can distributions be reinvested automatically?**
```
A: Currently: No automatic reinvestment
Workaround:
├─ Receive distribution monthly (Rs. 8.5K)
├─ Manually invest in another project
├─ Or add to existing project on secondary market
└─ Future feature planned (auto-reinvest)
```

#### Secondary Market

**Q: Why can't I sell all my tokens?**
```
A: Liquidity reasons:
├─ Each project has limit (cannot exceed 10% ownership)
├─ Can sell up to token limit per project
├─ Example: If 100 tokens & limit is 10% → can sell 90
├─ Lower prices sell faster (competition)
├─ Solution: Set lower price or smaller quantity
```

**Q: How long does sale take to complete?**
```
A: Timeline:
├─ Listing goes live: Instant
├─ Buyer finds & purchases: 1-14 days typical
├─ Payment processed: 24 hours
├─ Tokens transferred: 1 hour
├─ Money in bank account: Next morning
└─ If not sold: Order expires after 30 days
```

**Q: What if token price drops below my sell price?**
```
A: Options:
├─ Reduce price to sell (accept lower rate)
├─ Cancel order & wait for price recovery
├─ Hold tokens & receive distributions
├─ Price typically rises with project progress
└─ Market dynamic: Supply & demand
```

#### Platform Technical

**Q: App crashed & lost my data. What do I do?**
```
A: Don't worry, your data is safe:
├─ Data stored in server, not phone
├─ Reinstall app, login, all data restored
├─ Portfolio, investments, distributions intact
├─ Contact support if issues persist
└─ No data loss possible (distributed backup)
```

**Q: Can I use web version instead of app?**
```
A: Yes:
├─ Go to estateX.com
├─ Login with same email/password
├─ Full functionality available
├─ Sync between app & web (real-time)
├─ Recommended: Use both interchangeably
└─ Better UX on mobile for on-the-go
```

**Q: Is my data really secure?**
```
A: Yes, with multiple protections:
├─ Passwords: bcrypt + salt (never stored plain)
├─ Data in transit: TLS 1.3 encryption
├─ Data at rest: AES-256 encryption
├─ Bank details: PCI DSS compliant
├─ Aadhaar: Hashed (never full # stored)
├─ All access logged & monitored
├─ Regular security audits
└─ Insurance: Cyber liability coverage
```

#### Account & Support

**Q: How do I contact support?**
```
A: Multiple options:
├─ In-app: Help → Contact Support (chat)
├─ Email: support@estateX.com (response in 2 hours)
├─ Phone: +91-XXXX-XXXX (Mon-Fri, 9 AM-6 PM)
├─ Twitter: @estateX (public issues)
└─ Response time SLA:
   ├─ Critical: 1 hour
   ├─ High: 4 hours
   ├─ Medium: 24 hours
   └─ Low: 48 hours
```

**Q: How do I delete my account?**
```
A: Account deletion:
├─ Not recommended if active investments
├─ Must sell all tokens first
├─ Then: Profile → Settings → Delete Account
├─ Confirmation email sent
├─ Final notice: 30 days to reactivate
├─ After 30 days: Account & data permanently deleted
├─ Distributions still sent until then
└─ Cannot reactivate after 30 days
```

**Q: What are the fees?**
```
A: Platform fee structure:
├─ Investment: FREE (no fee on purchase)
├─ Distribution: 1% platform fee (deducted from revenue)
├─ Secondary Market Sell: 1% fee (included in price)
├─ Secondary Market Buy: FREE (no fee)
├─ Payment Gateway: Razorpay covers
├─ Bank Transfer: Your bank's fee
└─ Example: Rs. 1L invested, earn Rs. 10K/month
   ├─ Distribution: Rs. 10K gross - Rs. 100 (1%) = Rs. 9.9K net
   └─ Sell 50 tokens @ Rs. 1,050:
      ├─ Gross: Rs. 52.5L
      ├─ Fee (1%): Rs. 52.5K
      └─ Net: Rs. 52L
```

---

**Document Version**: 1.3  
**Last Updated**: April 25, 2026  
**Status**: Revenue Distribution Engine & DAO Governance Complete

### Quick Reference Card

```
INVESTOR QUICK START
├─ Sign up: 2 min
├─ KYC: 10 min
├─ First investment: 5 min
├─ Portfolio tracking: Ongoing
├─ Distributions: Monthly (auto)
└─ Minimum investment: Rs. 10,000

BUILDER QUICK START
├─ Registration: 30 min
├─ Project setup: 1-2 hours
├─ Approval: 2-3 days
├─ Fundraising: 2-6 months
├─ Milestone updates: Monthly
└─ Fund releases: Auto upon approval

KEY NUMBERS
├─ Users on platform: 50,000+ investors
├─ Projects listed: 25+ active
├─ Total raised: Rs. 2,000+ Cr
├─ Monthly distributions: Rs. 50+ Cr
├─ Average return: 8-12% p.a.
└─ Completion rate: 98%
```

**EstateX User Guide v1.6**  
**Last Updated**: April 25, 2026  
**Status**: Revenue Distribution Engine & DAO Governance Complete
