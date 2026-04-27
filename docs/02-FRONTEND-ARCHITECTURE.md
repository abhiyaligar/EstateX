# Frontend Architecture Documentation

**EstateX: Trade Properties Like Stocks**

---

## Table of Contents

1. [Frontend Overview](#frontend-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Page Routing](#page-routing)
7. [UI/UX Components](#uiux-components)
8. [API Integration](#api-integration)
9. [Authentication Flow](#authentication-flow)
10. [Performance Optimization](#performance-optimization)
11. [Responsive Design](#responsive-design)
12. [Web3 Integration](#web3-integration)
13. [Error Handling & Validation](#error-handling--validation)

---

## Frontend Overview

The EstateX frontend is a modern, responsive web application built with **Vite 6** and **React 19**, designed to serve three distinct user types with specialized interfaces:

1. **Investor Dashboard**: Browse projects, manage investments, track portfolio
2. **Builder Portal**: Create projects, manage fundraising, track construction progress
3. **Admin Console**: Approve projects, verify KYC, monitor compliance

The application is fully responsive, works on mobile devices, and integrates **Supabase Auth** for both traditional and social (OAuth) login.

---

## Technology Stack

### Core Framework
```
Vite 6
├── React 19 (UI component library)
├── Single Page Application (SPA) architecture
├── React Router 7 for client-side routing
└── Tailwind CSS 4 for utility-first styling
```

### Styling & UI
```
Tailwind CSS 3.4
├── Utility-first CSS framework
├── Custom component library
├── Responsive breakpoints
├── Dark mode support
└── Animation utilities

UI Components:
├── Headless UI (dialogs, dropdowns)
├── Radix UI (accessible primitives)
├── React Icons (icon library)
└── Heroicons (premium icons)
```

### Data Visualization
```
Chart.js 4.0
├── Line charts (ROI trends)
├── Bar charts (portfolio breakdown)
├── Pie charts (asset allocation)
├── Candlestick charts (price history)
└── Custom chart plugins
```

### Web3 & Blockchain
```
Web3.js 1.10
├── Wallet connection (MetaMask, WalletConnect)
├── Smart contract interaction
├── Balance queries
├── Transaction signing
└── Event listening

ethers.js (alternative)
├── Smaller bundle size
├── Better TypeScript support
└── Modern API design
```

### State Management
```
Redux Toolkit 1.9 (Primary)
├── Redux store setup
├── Slices for features
├── Thunks for async operations
├── Redux DevTools integration
└── Middleware setup

Zustand (Alternative)
├── Lightweight state management
├── No boilerplate
├── Perfect for UI state
└── Hook-based API
```

### Data Fetching & Caching
```
React Query 3.39
├── Server state management
├── Automatic caching
├── Background refetching
├── Optimistic updates
└── Pagination support

SWR 2.0 (Alternative)
├── Built-in caching
├── Real-time data
├── Focus refetch
└── Suspense support

Supabase Client SDK
├── Real-time presence & listeners
├── Push-based data flow
└── Zero-polling architecture
```

### Form Management
```
React Hook Form 7.48
├── Minimal re-renders
├── Easy integration with validation
├── Built-in HTML5 validation
├── File upload support
└── Multi-step form support

Zod or Yup
├── Schema validation
├── Type inference
├── Error messages
└── Custom validators
```

### Testing
```
Jest (Unit testing)
├── Component testing
├── Utility function testing
└── Snapshot testing

React Testing Library
├── User-centric testing
├── DOM interaction testing
└── Accessibility testing

Cypress or Playwright
├── End-to-end testing
├── User flow testing
└── Visual regression testing
```

### Build & Dev Tools
```
TypeScript 5.0
├── Static type checking
├── IDE autocomplete
├── Build-time error detection
└── Self-documenting code

Webpack 5 (Built-in with Next.js)
├── Code splitting
├── Module bundling
└── Asset optimization

ESLint + Prettier
├── Code linting
├── Code formatting
└── Consistency enforcement
```

---

## Project Structure

```
estateX-frontend/
│
├── public/                          # Static assets
│   ├── images/                      # Logo, icons, illustrations
│   ├── documents/                   # Sample PDFs
│   └── fonts/                       # Custom fonts
│
├── src/
│   ├── app/                         # Next.js 14 app directory
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   │
│   │   ├── (public)/                # Public routes
│   │   │   ├── about/
│   │   │   ├── features/
│   │   │   ├── pricing/
│   │   │   ├── blog/
│   │   │   └── contact/
│   │   │
│   │   ├── (auth)/                  # Auth routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── kyc/
│   │   │
│   │   ├── (investor)/              # Investor protected routes
│   │   │   ├── dashboard/
│   │   │   ├── marketplace/
│   │   │   │   ├── [projectId]/
│   │   │   │   └── search/
│   │   │   ├── portfolio/
│   │   │   ├── investments/
│   │   │   ├── secondary-market/
│   │   │   │   ├── buy/
│   │   │   │   └── sell/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── notifications/
│   │   │
│   │   ├── (builder)/               # Builder protected routes
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   │   ├── create/
│   │   │   │   ├── [projectId]/
│   │   │   │   └── [projectId]/edit/
│   │   │   ├── fundraising/
│   │   │   ├── investors/
│   │   │   ├── milestone-tracking/
│   │   │   ├── revenue/
│   │   │   ├── settings/
│   │   │   └── documents/
│   │   │
│   │   ├── (admin)/                 # Admin protected routes
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── kyc-queue/
│   │   │   ├── projects/
│   │   │   ├── approvals/
│   │   │   ├── compliance/
│   │   │   ├── disputes/
│   │   │   ├── reporting/
│   │   │   └── settings/
│   │   │
│   │   └── api/                     # Backend API routes (optional)
│   │       ├── auth/
│   │       └── webhooks/
│   │
│   ├── components/                  # Reusable components
│   │   ├── common/                  # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx          # Professional collapsible navigation
│   │   │   ├── SidebarItem.tsx      # Dynamic sidebar menu items
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── forms/                   # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── KYCForm.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── InvestmentForm.tsx
│   │   │   └── EditProfileForm.tsx
│   │   │
│   │   ├── charts/                  # Data visualization
│   │   │   ├── PortfolioChart.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── AllocationChart.tsx
│   │   │   └── PriceChart.tsx
│   │   │
│   │   ├── investor/                # Investor-specific components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── InvestmentModal.tsx
│   │   │   ├── PortfolioCard.tsx
│   │   │   ├── MarketplaceFilter.tsx
│   │   │   └── ROICalculator.tsx
│   │   │
│   │   ├── builder/                 # Builder-specific components
│   │   │   ├── ProjectDashboard.tsx     # High-density portfolio management
│   │   │   ├── MilestoneTracker.tsx     # Milestone progress and verification
│   │   │   ├── FundraisingProgress.tsx  # Live IPO subscription tracking
│   │   │   ├── BuilderWallet.tsx        # Business ledger and withdrawal UI
│   │   │   ├── InvestorList.tsx         # Detailed cap table for projects
│   │   │   └── DocumentUpload.tsx       # RERA and construction certificates
│   │   │
│   │   ├── admin/                   # Admin-specific components
│   │   │   ├── KYCQueue.tsx
│   │   │   ├── ApprovalPanel.tsx
│   │   │   ├── ComplianceChecker.tsx
│   │   │   ├── DisputePanel.tsx
│   │   │   └── AnalyticsDashboard.tsx
│   │   │
│   │   └── web3/                    # Blockchain components
│   │       ├── WalletConnect.tsx
│   │       ├── NetworkSelector.tsx
│   │       ├── TokenBalance.tsx
│   │       └── TransactionStatus.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Authentication
│   │   ├── useApi.ts                # API fetching
│   │   ├── useWallet.ts             # Web3 wallet
│   │   ├── usePortfolio.ts          # Portfolio data
│   │   ├── useProjects.ts           # Project data
│   │   ├── useNotifications.ts      # Toast/alerts
│   │   ├── useDebounce.ts           # Debounce logic
│   │   └── usePagination.ts         # Pagination
│   │
│   ├── services/                    # API service layer
│   │   ├── api.ts                   # Axios instance
│   │   ├── auth.service.ts          # Auth endpoints
│   │   ├── projects.service.ts      # Project endpoints
│   │   ├── investments.service.ts   # Investment endpoints
│   │   ├── kyc.service.ts           # KYC endpoints
│   │   ├── payments.service.ts      # Payment endpoints
│   │   ├── analytics.service.ts     # Analytics endpoints
│   │   └── blockchain.service.ts    # Web3 endpoints
│   │
│   ├── store/                       # Redux store
│   │   ├── index.ts                 # Store configuration
│   │   │
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   ├── projectsSlice.ts
│   │   │   ├── portfolioSlice.ts
│   │   │   ├── notificationSlice.ts
│   │   │   ├── uiSlice.ts
│   │   │   └── walletSlice.ts
│   │   │
│   │   └── thunks/
│   │       ├── authThunks.ts
│   │       ├── projectThunks.ts
│   │       ├── investmentThunks.ts
│   │       └── analyticsThunks.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── constants.ts             # App constants
│   │   ├── validators.ts            # Form validators
│   │   ├── formatters.ts            # Data formatting
│   │   ├── storage.ts               # Local storage helpers
│   │   ├── api-helpers.ts           # API utilities
│   │   ├── crypto.ts                # Encryption utilities
│   │   ├── blockchain-helpers.ts    # Web3 utilities
│   │   └── date-helpers.ts          # Date formatting
│   │
│   ├── types/                       # TypeScript types
│   │   ├── index.ts                 # Central types export
│   │   ├── api.types.ts             # API response types
│   │   ├── models.types.ts          # Domain models
│   │   ├── forms.types.ts           # Form data types
│   │   ├── wallet.types.ts          # Web3 types
│   │   └── components.types.ts      # Component prop types
│   │
│   ├── middleware/                  # Next.js middleware
│   │   ├── auth.middleware.ts       # Route protection
│   │   ├── errorHandler.ts          # Error handling
│   │   └── logger.ts                # Request logging
│   │
│   ├── config/                      # Configuration
│   │   ├── theme.ts                 # Tailwind theme
│   │   ├── env.ts                   # Environment variables
│   │   ├── api-config.ts            # API configuration
│   │   ├── blockchain-config.ts     # Web3 configuration
│   │   └── supabaseClient.js        # Supabase Realtime setup
│   │
│   ├── styles/                      # Global styles
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── animations.css
│   │
│   └── lib/                         # Library setup
│       ├── axios.ts                 # Axios configuration
│       ├── web3.ts                  # Web3 provider setup
│       ├── redux.ts                 # Redux configuration
│       └── react-query.ts           # React Query setup
│
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (gitignored)
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
├── package-lock.json                # Dependency lock file
└── README.md                        # Frontend README
```

---

## Component Architecture

### Component Hierarchy

```
RootLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   ├── UserMenu
│   └── WalletConnect
│
├── MainContent
│   ├── Sidebar (conditional)
│   └── Page Content
│       └── [Page-specific components]
│
└── Footer
```

### Component Categories

#### 1. Base Components (Atomic)
- **Button**: Primary, secondary, tertiary, danger variants
- **Input**: Text, email, password, number fields
- **Select**: Dropdown selection component
- **Checkbox**: Toggle checkbox component
- **Radio**: Radio button group
- **Textarea**: Multi-line text input
- **Label**: Form label component

#### 2. Composite Components (Molecules)
- **FormGroup**: Label + Input + Error message
- **Card**: Container component with header/footer. Recently updated to support **full prop-spreading**, enabling consistent event handling (e.g., `onClick`) and custom styling across all sub-components (`CardHeader`, `CardContent`, `CardFooter`).
- **Modal**: Dialog with overlay
- **Table**: Data table with sorting/filtering
- **Tabs**: Tabbed interface
- **Accordion**: Collapsible sections
- **Breadcrumb**: Navigation trail
- **Alert**: Alert/warning messages
- **Badge**: Label/tag component
- **Spinner**: Loading indicator

#### 3. Feature Components (Organisms)
- **Header**: Top navigation bar
- **Sidebar**: Left navigation panel. Recently updated to be **fully collapsible** with persistence (stores state in local storage) and role-based menu generation.
- **Secondary Market Terminal**: A specialized high-density trading interface utilizing Supabase Realtime for sub-100ms updates to orderbooks and trade history. Recently updated to include **Real-time Ticker Sync**, ensuring the header's market value reflects the absolute last execution price without page refreshes.
- **Footer**: Bottom footer
- **ProjectCard**: Project listing card
- **InvestmentForm**: Multi-step investment form
- **PortfolioChart**: Portfolio performance visualization
- **KYCForm**: Identity verification form

#### 4. Page Components (Templates)
- **DashboardLayout**: Dashboard page wrapper
- **InvestorDashboard**: Investor main dashboard
- **BuilderDashboard**: Builder main dashboard
- **AdminDashboard**: Admin main dashboard
- **MarketplacePage**: Project listing page
- **PortfolioPage**: Portfolio management page

---

## State Management

### Redux Store Structure

```
store/
├── auth/
│   ├── state: {user, token, isAuthenticated, role}
│   ├── actions: LOGIN, LOGOUT, SET_USER, REFRESH_TOKEN
│   └── selectors: selectUser, selectToken, selectRole
│
├── user/
│   ├── state: {profile, preferences, notifications, settings}
│   ├── actions: UPDATE_PROFILE, UPDATE_PREFERENCES
│   └── selectors: selectProfile, selectPreferences
│
├── portfolio/
│   ├── state: {holdings, totalValue, roi, distributions}
│   ├── actions: FETCH_HOLDINGS, UPDATE_HOLDING
│   └── selectors: selectTotalValue, selectROI, selectHoldings
│
├── projects/
│   ├── state: {list, current, filters, pagination}
│   ├── actions: FETCH_PROJECTS, SET_FILTERS
│   └── selectors: selectFilteredProjects, selectCurrentProject
│
├── notifications/
│   ├── state: {toasts, alerts, badges}
│   ├── actions: ADD_TOAST, REMOVE_TOAST, CLEAR_ALERTS
│   └── selectors: selectToasts, selectBadges
│
├── ui/
│   ├── state: {sidebarOpen, theme, language}
│   ├── actions: TOGGLE_SIDEBAR, SET_THEME
│   └── selectors: selectTheme, selectSidebarOpen
│
└── wallet/
    ├── state: {address, balance, chainId, isConnected}
    ├── actions: CONNECT_WALLET, DISCONNECT_WALLET
    └── selectors: selectWalletAddress, selectBalance
```

### Context API Usage (for UI state)

```
Contexts:
├── AuthContext: Authentication state
├── ThemeContext: Dark/light mode
├── NotificationContext: Toast notifications
└── LanguageContext: i18n support
```

---

## Page Routing

### Route Structure

```
/ (Home)
├── /about
├── /features
├── /pricing
├── /blog
├── /contact
│
├── /login
├── /signup
├── /forgot-password
├── /reset-password/[token]
├── /kyc
│
├── /investor/ (Protected)
│   ├── /dashboard
│   ├── /marketplace
│   │   ├── /[projectId]
│   │   └── /search?q=...
│   ├── /portfolio
│   ├── /investments
│   ├── /secondary-market
│   │   ├── /buy
│   │   └── /sell
│   ├── /analytics
│   ├── /settings
│   └── /notifications
│
├── /builder/ (Protected)
│   ├── /dashboard
│   ├── /projects
│   │   ├── /create
│   │   ├── /[projectId]
│   │   └── /[projectId]/edit
│   ├── /fundraising
│   ├── /investors
│   ├── /milestone-tracking
│   ├── /revenue
│   ├── /settings
│   └── /documents


└── /admin/ (Protected, role-based)
    ├── /dashboard
    ├── /users
    ├── /kyc-queue
    ├── /projects
    ├── /approvals
    ├── /compliance
    ├── /disputes
    ├── /support         # Integrated Resolution Terminal for investor queries
    ├── /reporting
    └── /settings
```

### Route Protection

```typescript
// Middleware.ts
- Check JWT token validity
- Verify user role against route permissions
- Redirect unauthorized users
- Handle token refresh
```

---

## UI/UX Components

### Design System Components

#### Typography
```
- H1, H2, H3, H4, H5, H6 (Headings)
- Subtitle1, Subtitle2 (Subtitles)
- Body1, Body2 (Body text)
- Caption, Overline (Small text)
```

#### Colors
```
Primary: #2563eb (Blue)
Secondary: #10b981 (Green)
Danger: #ef4444 (Red)
Warning: #f59e0b (Amber)
Success: #10b981 (Green)
Background: #ffffff (White)
Surface: #f9fafb (Light gray)
Text: #111827 (Dark gray)
Muted: #6b7280 (Medium gray)
```

#### Spacing
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

#### Shadows
```
sm: 0 1px 2px 0 rgba(0,0,0,0.05)
md: 0 4px 6px -1px rgba(0,0,0,0.1)
lg: 0 10px 15px -3px rgba(0,0,0,0.1)
xl: 0 20px 25px -5px rgba(0,0,0,0.1)
```

### Common UI Patterns

1. **Search with Filters**
   - Search bar with debounced input
   - Multi-select filter dropdowns
   - Filter chips display
   - Clear filters button

2. **Data Table**
   - Sortable columns
   - Paginated rows
   - Selectable rows
   - Bulk actions

3. **Form Submission**
   - Real-time field validation
   - Submit button with loading state
   - Success/error messages
   - Auto-save draft (optional)

4. **Modal Dialogs**
   - Overlay background
   - Escape key to close
   - Focus trap inside modal
   - Smooth animations

---

## API Integration

### HTTP Client Setup

```typescript
// services/api.ts
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    throw error;
  }
);
```

### API Service Example

```typescript
// services/investments.service.ts
export const investmentsService = {
  async createInvestment(projectId: string, amount: number) {
    return axiosInstance.post('/investments', {
      project_id: projectId,
      amount: amount,
    });
  },

  async getPortfolio() {
    return axiosInstance.get('/investments/portfolio');
  },

  async getInvestmentHistory() {
    return axiosInstance.get('/investments/history');
  },
};
```

### React Query Usage

```typescript
// Component
import { useQuery, useMutation } from 'react-query';
import { investmentsService } from '@/services';

function PortfolioPage() {
  const { data: portfolio, isLoading } = useQuery(
    'portfolio',
    () => investmentsService.getPortfolio(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const createInvestmentMutation = useMutation(
    (data) => investmentsService.createInvestment(data.projectId, data.amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('portfolio');
        toast.success('Investment created successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }
  );

  return (
    <div>
      {isLoading ? <Spinner /> : <PortfolioChart data={portfolio} />}
    </div>
  );
}
```

---

## Authentication Flow

### Login Process (Traditional)

1. User enters email & password → Click Login
2. Frontend validates input
3. POST /api/auth/login {email, password}
4. Backend validates credentials via Supabase
5. Backend returns JWT token
6. Frontend stores token in localStorage and AuthContext
7. Redirect to Dashboard

### Login Process (Google OAuth)

1. User clicks "Continue with Google"
2. Frontend triggers `supabase.auth.signInWithOAuth`
3. Redirect to Google Consent Screen
4. User approves → Redirect back to `/auth/callback`
5. `AuthCallback.jsx` detects session and calls POST `/auth/oauth-sync`
6. Backend ensures local PostgreSQL `users` record exists
7. Frontend redirects to Dashboard

### Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/investor')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/investor/:path*', '/builder/:path*', '/admin/:path*'],
};
```

---

## Performance Optimization

### 1. Code Splitting & Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const PortfolioChart = dynamic(
  () => import('@/components/charts/PortfolioChart'),
  { loading: () => <Spinner />, ssr: false }
);
```

### 2. Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/images/project.jpg"
  alt="Project"
  width={800}
  height={600}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### 3. Caching Strategies

```
- Static pages: ISR (revalidate every 3600s)
- API responses: React Query (staleTime 5 mins)
- User data: Redux store
- Images: Next.js image optimization
```

### 4. Bundle Size Optimization

```
- Code splitting by route
- Minification and compression
- Tree-shaking unused code
- Lazy load heavy libraries (Chart.js, D3)
```

### 5. Font Optimization

```typescript
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ weight: ['600', '700'] });
```

---

## Responsive Design

### Breakpoints

```
sm: 640px   (Mobile)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Wide)
2xl: 1536px (Ultra-wide)
```

### Mobile-First Approach

```html
<!-- Mobile layout by default -->
<div class="grid grid-cols-1">
  <!-- md and up: 2 columns -->
  <div class="md:grid-cols-2">
    <!-- Content -->
  </div>
</div>
```

### Responsive Components

```typescript
// Sidebar collapses on mobile
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      <nav className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        {/* Navigation items */}
      </nav>
    </>
  );
}
```

---

## Web3 Integration

### Wallet Connection

```typescript
// hooks/useWallet.ts
export function useWallet() {
  const dispatch = useDispatch();
  
  async function connectWallet() {
    if (!window.ethereum) {
      alert('MetaMask not installed');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      dispatch(setWalletAddress(accounts[0]));
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        dispatch(setWalletAddress(accounts[0]));
      });
      
      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        dispatch(setChainId(chainId));
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }
  
  return { connectWallet };
}
```

### Smart Contract Interaction

```typescript
// services/blockchain.service.ts
import Web3 from 'web3';

const web3 = new Web3(process.env.NEXT_PUBLIC_RPC_URL);

export const blockchainService = {
  async getTokenBalance(walletAddress: string, tokenAddress: string) {
    const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return web3.utils.fromWei(balance, 'ether');
  },

  async createBuyOrder(tokenAddress: string, amount: string) {
    const contract = new web3.eth.Contract(TOKEN_ABI, tokenAddress);
    const tx = contract.methods.transfer(MARKETPLACE_ADDRESS, amount);
    return tx.send({ from: window.ethereum.selectedAddress });
  },
};
```

---

## Error Handling & Validation

### Form Validation with Zod

```typescript
import { z } from 'zod';

const investmentSchema = z.object({
  projectId: z.string().min(1, 'Project required'),
  amount: z.number().min(10000, 'Minimum Rs. 10,000'),
  acceptTerms: z.boolean().refine(val => val === true),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;
```

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
async function safeApiCall(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission denied
      toast.error('You do not have permission to perform this action');
    } else {
      // Show generic error
      toast.error(error.response?.data?.message || 'An error occurred');
    }
    throw error;
  }
}
```

---

## Performance Metrics

### Target Metrics

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5 seconds |
| Largest Contentful Paint (LCP) | < 2.5 seconds |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to Interactive (TTI) | < 3 seconds |
| Bundle Size | < 200 KB (gzipped) |
| Transaction Feedback | < 100 ms (Optimistic/Async) |

---

**Last Updated**: April 17, 2026  
**Status**: Complete (High-Performance Real-time Update)
