# EstateX: Trade Properties Like Stocks

**A Real Estates Tokenized Trading Platform**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Key Features](#key-features)
5. [Market Opportunity](#market-opportunity)
6. [Project Objectives](#project-objectives)
7. [Project Scope](#project-scope)
8. [Technology Stack](#technology-stack)
9. [Project Timeline](#project-timeline)
10. [Documentation Structure](#documentation-structure)
11. [Getting Started](#getting-started)

---

## Executive Summary

EstateX is a revolutionary digital platform designed to democratize real estate investment in India by enabling fractional ownership of residential and commercial projects through blockchain technology. The platform bridges the gap between:

- **Builders & Developers**: Secure faster, cheaper project financing (10-30% equity) without traditional banking delays
- **Retail Investors**: Access premium real estate investments starting from Rs. 10,000 with full RERA and SEBI compliance

The platform leverages blockchain (Polygon network), smart contracts for transparent fund management, and a secondary trading marketplace to introduce liquidity into an otherwise illiquid asset class.

---

## Problem Statement

### The Dual Challenge

#### Challenge 1: Builder Financing Gap
- **Current Reality**: Developers face 90-120 day delays in fund disbursement from banks/NBFCs
- **Cost Impact**: Interest rates of 12-15% per annum inflate project costs significantly
- **Result**: 29% of Indian real estate projects remain incomplete or stalled

#### Challenge 2: Retail Investor Exclusion
- **Entry Barrier**: Traditional real estate requires minimum investment of Rs. 25 lakhs
- **Exclusion Rate**: 92% of India's middle-class households cannot participate in real estate investment
- **Lost Opportunity**: Investors miss 7.8% average annual rental yields and capital appreciation

#### Existing Solutions Gap
- REITs are limited to commercial assets and large investors
- Lack of project-level transparency and performance reporting
- No secondary market liquidity at property level
- Absence of blockchain-based audit trails enabling fraud

---

## Solution Overview

EstateX creates a secure, transparent, and technologically advanced crowdfunding ecosystem with:

✅ **Verified Builder Onboarding**: RERA document validation and compliance verification  
✅ **Fractional Ownership**: Tokenized properties tradable like stocks  
✅ **Smart Escrow**: Automated milestone-based fund releases  
✅ **Revenue Distribution Engine**: Two-stage approval pipeline for pro-rata monthly rental payouts  
✅ **Secondary Marketplace**: P2P trading platform for fractional shares  
✅ **Professional Trading Terminal**: TradingView Lightweight Charts with OHLCV, candlestick/line/area, SMA, fullscreen mode  
✅ **DAO Governance**: Snapshot-based weighted voting for brick holders on project decisions  
✅ **Macro Market Intelligence**: Database-backed regional growth indicators and rental yields  
✅ **Investor Analytics**: Real-time portfolio tracking, ROI projections, and Asset Allocation breakdown  
✅ **Dual Wallet Architecture**: Strict separation of investor personal funds and builder business ledger  
✅ **Strict Compliance**: Manual KYC review policy, RERA validation, SEBI-aligned structure  
✅ **Social Authentication**: Google OAuth integration via Supabase  
✅ ✅ **Support Ticket Management**: Centralized Resolution Terminal for investor queries  
✅ **Flexible Wallet Overrides**: Multi-criteria (GUID/Email) financial adjustment protocols  

---

## Key Features

### For Builders
- Rapid project registration with RERA document uploads
- Access to distributed investor capital at competitive terms
- Milestone-based fund releases with transparent escrow
- Real-time project performance dashboard
- Automatic reputation scoring

### For Investors
- Browse verified real estate projects across India
- Invest fractional amounts starting Rs. 10,000
- Track portfolio performance in real-time
- Receive automatic monthly rental distributions
- Trade shares in secondary marketplace
- Advanced analytics and ROI projections

### For Platform Admins
- Complete KYC/builder compliance verification
- Project milestone validation
- **Revenue Settlement Dashboard**: Approve/reject monthly rental cycle submissions from builders
- **DAO Governance Management**: Create proposals, configure voting options, and execute consensus results
- Macro Analytics Management: Global Market Intelligence CRUD suite
- **Support Ticket Resolution**: Centralized terminal for resolving investor queries with full user context  
- **Flexible Wallet Overrides**: God-mode financial adjustments with multi-identifier support (GUID/Email)  
- Regulatory compliance monitoring

---

## Market Opportunity

| Metric | Value |
|--------|-------|
| **Global Crowdfunding Market** | $20+ billion |
| **India's Current Share** | <1% (massive underserved) |
| **Estimated TAM for Real Estate Crowdfunding (India)** | $15 billion |
| **India's Real Estate Sector Size** | $200 billion |
| **Contribution to GDP** | 7.3% |
| **Target Market (Middle-class Households)** | 400+ million |
| **Minimum Investment Barrier to Remove** | Rs. 25 lakhs → Rs. 10,000 |

---

## Project Objectives

### Primary Goals
1. Create a RERA and SEBI-compliant platform connecting builders with retail investors
2. Enable faster, cheaper project financing for developers
3. Democratize real estate investment access for retail participants
4. Implement transparent, smart contract-driven fund management
5. Build a liquid secondary market for fractional real estate ownership
6. Provide sophisticated analytics for informed investment decisions
7. Establish blockchain-based audit trails eliminating fraud

### Success Metrics
- 100+ projects listed within 6 months of launch
- 50,000+ verified investors on platform
- Rs. 500+ crores in total investment volume
- 95% reduction in fraud through blockchain audit trails
- 15% faster project execution through timely funding

---

## Project Scope

### Inclusions ✅
- **Builder Onboarding**: Registration, RERA validation, KYC
- **Primary Investment Market**: Project listing and subscription
- **Secondary Trading Exchange**: P2P marketplace with smart contract settlements
- **Revenue Distribution Engine**: Automated rental income distribution
- **Compliance Suite**: KYC pipeline, escrow management, audit trails
- **Investor Analytics Dashboard**: Portfolio tracking, ROI projections, milestone monitoring
- **Mobile-Responsive UI**: Fully responsive web experience
- **Payment Integration**: Razorpay and UPI payment gateways

### Exclusions ❌
- Debt instruments and interest-bearing products
- International real estate projects
- Native iOS/Android mobile applications
- Mortgage products and financing instruments
- Real-time construction monitoring (Phase 2)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS 3.4
- **Visualization**: TradingView Lightweight Charts (OHLCV terminal), Recharts (portfolio analytics)
- **Web3**: Web3.js for blockchain wallet connectivity
- **State Management**: Redux/Zustand
- **Realtime**: Supabase Realtime (orders, trades, live feed)
- **Testing**: Jest, React Testing Library

### Backend
- **Language**: Python 3.11
- **Framework**: FastAPI 0.104
- **Database**: PostgreSQL 15
- **Caching**: Redis 7
- **ORM**: SQLAlchemy
- **Validation**: Pydantic
- **Authentication**: JWT tokens
- **Payment Gateway**: Razorpay SDK

### Blockchain
- **Smart Contract Language**: Solidity 0.8.20
- **Network**: Polygon Mumbai Testnet (Layer-2)
- **Development Framework**: Hardhat
- **Library**: OpenZeppelin Contracts (ERC-20, Access Control)
- **Connection**: Web3.py for Python integration

### DevOps & Infrastructure
- **Containerization**: Docker 24 + Docker Compose
- **Cloud Platform**: AWS (EC2, RDS, S3, VPC)
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx
- **Monitoring**: CloudWatch (Phase 2)

---

## Project Timeline

### Phase-wise Breakdown (16 Weeks)

**Weeks 1-4 (Initiation & Design)**
- Requirements gathering and stakeholder interviews
- Complete UI/UX design in Figma
- System architecture documentation
- Database schema design

**Weeks 5-8 (Backend & Payment)**
- FastAPI backend development
- PostgreSQL database implementation
- JWT authentication system
- KYC pipeline development
- Razorpay payment integration

**Weeks 9-12 (Frontend & Blockchain)**
- Next.js 14 frontend development
- Smart contract development in Solidity
- Polygon Mumbai deployment
- Full-stack integration
- MVP demonstration

**Weeks 13-16 (Testing, Security & Deployment)**
- Security audits and smart contract audits
- Load testing (10,000 concurrent users)
- AWS production deployment
- Complete documentation
- Project submission

---

## Documentation Structure

This project includes comprehensive documentation covering:

### 1. **Technical Architecture** (`docs/01-TECHNICAL-ARCHITECTURE.md`)
   - System overview and components
   - Layered architecture design
   - Technology decision rationale
   - Integration patterns

### 2. **Frontend Architecture** (`docs/02-FRONTEND-ARCHITECTURE.md`)
   - UI component structure
   - Page hierarchy and routing
   - State management design
   - API integration patterns

### 3. **Backend Architecture** (`docs/03-BACKEND-ARCHITECTURE.md`)
   - API endpoint design
   - Business logic structure
   - Service layer architecture
   - Authentication and authorization
### 5. **Database Schema** (`docs/05-DATABASE-SCHEMA.md`)
   - Entity relationships
   - Table definitions
   - Indexing strategy
   - Data integrity rules

### 5. **API Documentation** (`docs/06-API-REFERENCE.md`)
   - Endpoint specifications
   - Request/response formats
   - Authentication requirements
   - Error handling

### 7. **Deployment & DevOps** (`docs/07-DEPLOYMENT-GUIDE.md`)
   - Environment setup
   - Docker containerization
   - AWS infrastructure
   - CI/CD pipeline

### 8. **Security & Compliance** (`docs/08-SECURITY-COMPLIANCE.md`)
   - KYC/AML procedures
   - RERA compliance
   - SEBI alignment
   - Data protection

### 9. **Features & User Guide** (`docs/09-FEATURES-USER-GUIDE.md`)
   - User roles and permissions
   - Feature descriptions
   - Step-by-step workflows
   - Troubleshooting guide

---

## Getting Started

### Prerequisites
- Node.js 18+ (Frontend)
- Python 3.11+ (Backend)
- PostgreSQL 15 (Database)
- Docker 24 (Containerization)
- Git (Version control)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/abhiyaligar/EstateX.git
cd EstateX

# Frontend setup
cd frontend
npm install
npm run dev

# Backend setup (in another terminal)
cd backend
python -m venv venv
.\venv\Scripts\activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload

# Visit application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

---

## Key Statistics

| Metric | Target |
|--------|--------|
| Concurrent Users Supported | 10,000+ |
| Maximum Concurrent Investors per Project | 500+ |
| Average Transaction Time | <100ms (P95 Response) |
| Order Matching Engine | High-Performance In-Memory FIFO |
| Live Data Feed | Real-time Push (Zero Polling) |
| Smart Contract Gas Fee (Polygon) | Rs. 5-10 per transaction |
| Monthly Distribution Batching | Reduces costs by 80% |
| KYC Verification Time | <2 hours |
| Project Listing Time | <24 hours |

---

## Regulatory Compliance

✅ **RERA Compliance**: All builders registered and verified  
✅ **SEBI Alignment**: AIF-equivalent structure with transparency  
✅ **KYC/AML**: UIDAI and PAN-linked identity verification  
✅ **Data Protection**: GDPR-compliant data handling  
✅ **Blockchain Audit Trail**: Immutable transaction records  

---

## Contact & Support

For documentation updates, technical support, or queries:
- **Email**: estateX@example.com
- **Documentation**: See `/docs` folder
- **API Reference**: See `docs/06-API-REFERENCE.md`

---

## License

This project is developed as an academic capstone and is protected under intellectual property guidelines.

---

**Version**: 1.6  
**Last Updated**: April 27, 2026 (19:35)  
**Status**: Support Ticket Engine & Flexible Admin Wallet Overrides Active
