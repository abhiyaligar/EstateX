# Deployment & DevOps Guide

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Docker Containerization](#docker-containerization)
4. [AWS Infrastructure](#aws-infrastructure)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Logging](#monitoring--logging)
7. [Scaling & Performance](#scaling--performance)
8. [Disaster Recovery](#disaster-recovery)

---

## Environment Setup

### Development Environment

**Hardware Requirements**:
- Intel i5 12th Gen or higher
- 16 GB RAM minimum
- 512 GB SSD storage
- 100 Mbps internet

**Software Stack**:
```bash
# Backend
Python 3.11
PostgreSQL 15
Redis 7
Node.js 18+ (for Hardhat)

# Frontend
Node.js 18+
npm 9+

# Dev Tools
Docker 24
Docker Compose
Git
VS Code (recommended)
```

### Environment Variables

**Backend (.env)**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/estate_x_dev
REDIS_URL=redis://localhost:6379

# Server
DEBUG=True
LOG_LEVEL=DEBUG
SERVER_PORT=8000

# JWT
SECRET_KEY=dev_secret_key_change_in_production
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=24

# Razorpay (Test Keys)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=test_secret_xxx

# Blockchain
WEB3_PROVIDER_URL=https://rpc-mumbai.maticvigil.com
WALLET_PRIVATE_KEY=0x...
ESCROW_CONTRACT_ADDRESS=0x...
TOKEN_CONTRACT_ADDRESS=0x...

# Email
SENDGRID_API_KEY=SG.xxx
SENDER_EMAIL=noreply@estateX.com

# AWS
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET=estateX-documents
```

**Frontend (.env)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_RPC_URL=https://rpc-mumbai.maticvigil.com
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
```

---

## Local Development

### Quick Start (Docker Compose)

```bash
# Clone repository
git clone https://github.com/abhiyaligar/EstateX.git
cd EstateX

# Create .env file
cp .env.example .env
# Edit .env with local values

# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Access Points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432
- Redis: localhost:6379

### Manual Setup (Recommended for Development)

```bash
# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload

# Frontend Setup
cd frontend
npm install
npm run dev

# Start Hardhat for smart contracts
cd blockchain
npm install
npx hardhat node  # Local blockchain
npx hardhat compile  # Compile contracts
```

### Database Setup

```bash
# Create PostgreSQL database
createdb estate_x_dev

# Run migrations
alembic upgrade head

# Seed data (optional)
python -c "from app.db.seed import seed_database; seed_database()"
```

### Testing

```bash
# Backend unit tests
pytest tests/unit -v

# Backend integration tests
pytest tests/integration -v

# Frontend tests
npm run test

# Frontend coverage
npm run test:coverage

# Smart contract tests
npx hardhat test

# Load testing
locust -f tests/load/locustfile.py
```

---

## Docker Containerization

### Dockerfile (Backend)

```dockerfile
# Dockerfile - backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile (Frontend)

```dockerfile
# Dockerfile - frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: estate_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: estate_x_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U estate_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://estate_user:secure_password@postgres:5432/estate_x_prod
      REDIS_URL: redis://redis:6379
      DEBUG: "False"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app  # For development
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## AWS Infrastructure

### EC2 Configuration

**Production Setup**:
```
Instance Type: t3.medium (2 vCPU, 4 GB RAM)
Root Volume: 50 GB gp3 (encrypted)
AMI: Ubuntu 22.04 LTS
Security Group:
  - Inbound: 80, 443, 22 (SSH from bastion)
  - Outbound: All
Auto Scaling: Min 2, Max 10 instances
```

**Launch Template**:
```bash
#!/bin/bash
# User data script

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone and setup application
cd /home/ubuntu
git clone https://github.com/abhiyaligar/EstateX.git
cd EstateX

# Download environment file from Secrets Manager
aws secretsmanager get-secret-value --secret-id estate-x-env --region us-east-1 --query SecretString --output text > .env

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

### RDS Database

**Configuration**:
```
Engine: PostgreSQL 15.3
Instance Class: db.t3.small (Multi-AZ)
Storage: 100 GB gp3 (auto-scaling to 500 GB)
Backup Retention: 30 days
Encryption: KMS-managed
Enhanced Monitoring: Enabled
Performance Insights: Enabled
```

**Security**:
```
VPC: Private subnet
Security Group: Only EC2 access
SSL/TLS: Required for connection
Master User: Secret stored in AWS Secrets Manager
```

### ElastiCache (Redis)

**Configuration**:
```
Engine: Redis 7.0
Node Type: cache.t3.micro (for dev), cache.t3.small (for prod)
Number of Nodes: 1 (dev), 2+ (prod)
Automatic Failover: Enabled
Automatic Backups: Daily
Multi-AZ: Enabled
VPC: Private subnet
```

### S3 Storage

**Bucket Configuration**:
```
Bucket Name: estateX-documents-prod
Versioning: Enabled
Encryption: AES-256
Access: VPC Gateway Endpoint
CORS: Configured for frontend
Lifecycle: Archive to Glacier after 90 days
```

### Load Balancer (ALB)

**Configuration**:
```
Type: Application Load Balancer
Scheme: Internet-facing
Subnets: Public subnets (Multi-AZ)
Security Group: Allow 80, 443
Certificate: AWS Certificate Manager
Health Check: /health (interval 30s)
Target Group: EC2 instances on port 8000
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_BACKEND: estateX-backend
  ECR_REPOSITORY_FRONTEND: estateX-frontend

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        working-directory: ./backend
        run: |
          pip install -r requirements-dev.txt

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: pytest tests/ -v --cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests
        working-directory: ./frontend
        run: npm run test:ci

      - name: Build
        working-directory: ./frontend
        run: npm run build

  test-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./blockchain
        run: npm ci

      - name: Compile contracts
        working-directory: ./blockchain
        run: npx hardhat compile

      - name: Run tests
        working-directory: ./blockchain
        run: npx hardhat test

  deploy:
    needs: [test-backend, test-frontend, test-contracts]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend
        working-directory: ./backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster estate-x-prod \
            --service backend-service \
            --force-new-deployment

      - name: Create deployment
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.deployments.createDeployment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: context.ref,
              environment: 'production',
              required_contexts: [],
              auto_merge: false
            });
```

---

## Monitoring & Logging

### CloudWatch Setup

```
Log Groups:
├── /estateX/backend
├── /estateX/frontend
├── /estateX/blockchain
└── /estateX/database

Metrics:
├── CPU utilization
├── Memory usage
├── Disk I/O
├── Network throughput
├── API response time
├── Error rate
└── Database connections

Alarms:
├── CPU > 80% → Scale out
├── Memory > 85% → Alert
├── Error rate > 5% → PagerDuty
├── Database CPU > 90% → Alert
└── RDS connections > 80% → Alert
```

### Logging Configuration

**Backend Logs**:
```python
# config/logging.py
import logging
import json
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

**Log Aggregation**:
- CloudWatch Logs for AWS services
- Application logs to CloudWatch
- Retention: 30 days
- Searchable by request_id, user_id, action

### Performance Monitoring

```
Response Times:
- P50 (median): < 100ms
- P95: < 500ms
- P99: < 1000ms

Error Tracking:
- 4xx errors: < 1%
- 5xx errors: < 0.1%
- Blockchain failures: < 0.01%

Throughput:
- API requests: Monitor per endpoint
- Database queries: 10,000+ per second
- WebSocket connections: 1,000+ concurrent
```

---

## Scaling & Performance

### Auto Scaling Policy

```
EC2 Auto Scaling Group:
├── Min: 2 instances
├── Desired: 4 instances
├── Max: 10 instances
│
├── Scale Out (Add instances):
│   └── When: Avg CPU > 70% OR Avg Memory > 80%
│   └── Wait Period: 300 seconds
│   └── Cool Down: 300 seconds
│
└── Scale In (Remove instances):
    └── When: Avg CPU < 30% AND Avg Memory < 50%
    └── Wait Period: 600 seconds
```

### Database Scaling

```
Read Replicas:
├── Primary: us-east-1a (writes)
├── Standby: us-east-1b (automatic failover)
├── Read Replica: us-east-1c (analytics queries)
└── Read Replica: eu-west-1 (geographic distribution)

Query Optimization:
├── Index on frequently queried fields
├── Materialized views for analytics
├── Connection pooling (PgBouncer)
└── Archive historical data
```

### Caching Strategy

```
Redis Cache Layers:
├── Session: 24 hour TTL
├── User Preferences: 1 hour TTL
├── Project Listings: 5 minute TTL
├── Portfolio Data: 10 minute TTL
├── Distributed Locks: Temporary
└── Rate Limiting: Per minute
```

---

## Disaster Recovery

### Backup Strategy

```
Database Backups:
├── Frequency: Daily automated
├── Retention: 30 days
├── Type: Full backup + incremental
├── PITR: Enabled (30 days)
├── Cross-region: Yes (replicated to us-west-2)
└── Testing: Monthly restore test

RTO (Recovery Time Objective): < 1 hour
RPO (Recovery Point Objective): < 24 hours
```

### Failover Procedure

```
Automatic:
└── RDS Multi-AZ: Automatic failover (< 2 minutes)

Manual:
1. Detect failure
2. Update Route 53 (DNS)
3. Route traffic to standby region
4. Verify service health
5. Switch database to standby
6. Restore from backup if needed

Test Schedule: Monthly
```

### Disaster Recovery Plan

```
Tier 1 (Critical):
├── Database failover
├── Load balancer failover
└── Recovery: < 15 minutes

Tier 2 (Major):
├── Backend service restart
├── Cache rebuild
└── Recovery: < 1 hour

Tier 3 (Minor):
├── UI redeploy
├── Config update
└── Recovery: < 5 minutes
```

---

**Document Version**: 1.0  
**Last Updated**: March 6, 2026  
**Status**: Complete
