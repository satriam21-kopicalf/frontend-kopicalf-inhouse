# Frontend Documentation - Kopi Calf In-House Dashboard

**Project:** `frontend-kopicalf-inhouse`
**Tech Stack:** Next.js 16.3.3 · React 19.2.8 · TypeScript · Ant Design 6.6.4 · dayjs · Geist Font
**Purpose:** Internal operational dashboard for Kopi Calf F&B chain — tracks sales, branch performance, COGS, stock, and waste across multiple outlets and central kitchens.
**Brand Colors:**
- Primary: `#0D2B5E` (Navy)
- Positive: `#2e7d32` (Green)
- Negative: `#DC4A2D` (Red)

---

## 1. Project Structure

```
frontend-kopicalf-inhouse/
├── app/
│   ├── layout.tsx          # Root layout: Ant Design ConfigProvider, fonts, global styles
│   ├── page.tsx           # Root redirect → /dashboard
│   ├── globals.css         # Global CSS reset and base styles
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard page: KPIs, branch performance, quick summary
│   └── sales/
│       └── page.tsx       # Sales page: data table with filters
├── components/
│   └── NavBar.tsx          # Sticky navigation bar with dropdown menu
├── public/
│   └── assets/
│       └── calf-logo.png   # Brand logo
└── package.json
```

---

## 2. Tech Stack Details

### Core Framework
- **Next.js 16.3.3** — App Router, `'use client'` pages
- **React 19.2.8** — Component library
- **TypeScript** — Strict typing throughout

### UI Library
- **Ant Design 6.6.4** (`antd`) — Component library
- **@ant-design/icons** — Icon library
  - Icons used: `DashboardOutlined`, `ShoppingCartOutlined`, `LogoutOutlined`, `DownOutlined`, `ShopOutlined`, `CheckCircleOutlined`, `ClockCircleOutlined`, `FileTextOutlined`, `DollarOutlined`, `RiseOutlined`
- **dayjs** — Date manipulation

### Fonts
- **Geist** (Vercel) — Primary font family via CSS import in `layout.tsx`

---

## 3. Root Layout (`app/layout.tsx`)

The root layout configures Ant Design globally:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#0D2B5E',
      colorSuccess: '#2e7d32',
      colorError: '#DC4A2D',
      borderRadius: 8,
      fontFamily: 'Geist, sans-serif',
    },
    components: {
      Table: { headerBg: '#F8FAFC' },
      Card: { paddingLG: 20 },
    },
  }}
>
```

### Key Configurations:
- **Primary color:** `#0D2B5E` (Navy)
- **Success color:** `#2e7d32` (Green)
- **Error color:** `#DC4A2D` (Red)
- **Border radius:** 8px
- **Font family:** Geist
- **Table header background:** `#F8FAFC`
- **Card padding:** 20px

---

## 4. Navigation (`components/NavBar.tsx`)

### Structure
- **Header:** Sticky position, white background, 1px bottom border
- **Logo:** Kopi Calf logo with "OP" badge
- **Dropdown Menu:** Click-triggered, bottom-right placement

### Navigation Items
| Key | Label | Icon | Route |
|-----|-------|------|-------|
| `dashboard` | Dashboard | `DashboardOutlined` | `/` |
| `sales` | Sales | `ShoppingCartOutlined` | `/sales` |
| `logout` | Logout | `LogoutOutlined` | `#` |

### Styling
- Active item: Navy text (`#0D2B5E`), light gray background (`#F5F5F5`), font weight 600
- Inactive item: Gray text (`#8C8C8C`), transparent background
- Logout: Red text (`#DC4A2D`)
- Dropdown shadow: `box-shadow: 0 6px 16px -8px rgba(0,0,0,0.08)...`

### Menu Header
Dark navy header (`#0D2B5E`) with white text displaying:
- Label: "NAVIGATION" (uppercase, letter-spacing 1.5)
- Title: "Kopi Calf"

---

## 5. Dashboard Page (`app/dashboard/page.tsx`)

### KPI Cards (Row of 4, responsive: xs=24, sm=12, lg=6)

| Title | Icon | Suffix | Color | Background |
|-------|------|--------|-------|------------|
| Total Bills | `ShoppingCartOutlined` | "orders" | `#0D2B5E` | `#EEF2F9` |
| Total Lines | `FileTextOutlined` | "items" | `#1E5799` | `#EEF2F9` |
| Nett Sales | `DollarOutlined` | — | `#2e7d32` | `#E8F5E9` |
| Avg Bill | `RiseOutlined` | — | `#DC4A2D` | `#FFF5F4` |

### Change Indicators
- Positive (green `#2e7d32`): e.g., `+12%`
- Negative (red `#DC4A2D`): e.g., `-3%`

### Alert Banner
- Type: `info`
- Message: "Data penjualan diperbarui hingga 14 Sep 2026"
- Description: "Total 1.248 bills tercatat dari 5 branch aktif. Periode: 1 Aug – 14 Sep 2026."

### Branch Performance Card
- Title: "Branch Performance" with `ShopOutlined` icon
- Lists 5 branches with:
  - Avatar (navy background with `ShopOutlined`)
  - Branch name and sales amount
  - Status tag: "Active" (green) or "Idle" (default)
  - Bill count in navy

### Quick Summary Card
- Title: "Quick Summary" with `CheckCircleOutlined`
- Progress bars for:
  - Revenue Target: 78%, Navy stroke
  - COGS Ratio: 65%, Green stroke
  - Waste Control: 92%, Red stroke

### Recent Activity Card
- Title: "Recent Activity" with `ClockCircleOutlined`
- Lists 4 recent activities with icons and timestamps

---

## 6. Sales Page (`app/sales/page.tsx`)

### Filter Controls (Row layout)
- **Search:** Input for bill/sales no/menu search
- **Branch:** Select dropdown (All Branches, Kopi Calf Cipete, Kopi Calf Bandung)
- **Category:** Select dropdown (All Categories, Beverage, Food)
- **Status:** Select dropdown (All Status, Completed, Void)
- **Date Range:** From/To inputs with arrow separator
- **Export Button:** Navy background, full width

### Table Columns
| Column | Width | Render |
|--------|-------|--------|
| Date | 90px | Monospace font |
| Sales No | 110px | Monospace font |
| Bill No | 100px | Monospace font |
| Branch | 120px | Plain text |
| Menu | 130px | Plain text |
| Category | 90px | Ant Design Tag |
| Qty | 50px | Right-aligned |
| Price | 80px | Right-aligned, formatted as "Rp X,XXX" |
| Total | 90px | Right-aligned, formatted as "Rp X,XXX" |
| Nett | 90px | Right-aligned, green if positive, red if negative |
| Status | 75px | Tag: green="success" for completed, red="error" for void |

### Table Configuration
- **Pagination:** pageSize 10, showSizeChanger, options: [10, 50, 100]
- **Scroll:** Horizontal scroll enabled at 900px
- **Size:** Small
- **Bordered:** false

---

## 7. Global Styles (`app/globals.css`)

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #F8FAFC;
}
```

---

## 8. Brand Color System

### Primary Palette
| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#0D2B5E` | Primary actions, headers, active states |
| Blue Light | `#1E5799` | Secondary blue accents |
| Gray Light | `#EEF2F9` | Light backgrounds |

### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#2e7d32` | Positive changes, completed status, revenue |
| Success Light | `#E8F5E9` | Success backgrounds |
| Danger | `#DC4A2D` | Negative changes, void status, waste |
| Danger Light | `#FFF5F4` | Danger backgrounds |
| Neutral | `#8C8C8C` | Inactive icons, secondary text |
| Border | `#EBEBEB` | Dividers, card borders |

### Layout Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#F0F2F5` | Page background (Dashboard) |
| Surface | `#F8FAFC` | Card backgrounds, Table headers |
| White | `#FFFFFF` | Navbar, dropdown backgrounds |

---

## 9. API Integration Patterns

### Backend API Base URL
The frontend connects to the backend at `http://localhost:8000` (development) or the VPS deployment URL in production.

### Key API Endpoints

#### Health Check
```
GET /health → { "status": "ok", "service": "calf-backend" }
```

#### Reports
```
GET /api/v1/reports/summary       → Report staging stats
GET /api/v1/reports              → List all reports
GET /api/v1/reports/{slug}       → Run a specific report
GET /api/v1/reports/{slug}/metadata → Report metadata
```

#### Master Data
```
GET /api/v1/master/summary        → Master data summary (esb_data schema)
GET /api/v1/master/{entity}/rows → Paginated rows from master tables
GET /api/v1/master/product-uoms  → Product UOM variants
GET /api/v1/master/bom-materials → BOM material lines
```

#### COGS Analysis
```
GET /api/v1/cogs-ratio?period=YYYY-MM        → COGS ratio for all branches
GET /api/v1/cogs-ratio/periods               → Available COGS periods
GET /api/v1/cogs-ratio/trend                 → COGS trend across periods
GET /api/v1/cogs-ratio/{branch_id}           → Branch-specific COGS
```

#### Stock & Waste
```
GET /api/v1/stock-opname              → List stock opname records
GET /api/v1/stock-opname/summary     → Stock opname KPI summary
GET /api/v1/stock-opname/pending-count → Pending opname count
GET /api/v1/waste                    → List waste records
GET /api/v1/waste/summary           → Waste KPI summary
GET /api/v1/stock/system             → Product x branch stock matrix
```

#### Authentication
```
POST /api/v1/auth/login   → Login with email/password
GET  /api/v1/auth/me     → Get current user
POST /api/v1/auth/logout → Logout
```

### Request Headers
- `Authorization: Bearer <token>` — For authenticated endpoints
- `x-user-id` — User identifier for audit trails

---

## 10. Development Commands

```bash
npm run dev    # Start development server (port 3000)
npm run build # Production build
npm run lint  # ESLint check
```

---

## 11. Environment Configuration

Required environment variables (typically in `.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 12. Deployment Notes

The frontend is a Next.js static/SSR application. For production:
1. Run `npm run build`
2. Deploy to any Node.js hosting (Vercel, Hostinger VPS, etc.)
3. Set `NEXT_PUBLIC_API_URL` to the backend VPS URL (`http://187.52.114.14:8000`)

---

## 13. Component Usage Guidelines

### Ant Design Components Used
| Component | Usage |
|-----------|-------|
| `Layout`, `Content` | Page structure |
| `Typography` | Text components (Title, Text) |
| `Card` | KPI cards, section containers |
| `Row`, `Col` | Grid layout |
| `Statistic` | KPI value display |
| `Progress` | Target/limit progress bars |
| `Tag` | Status badges, category labels |
| `Space` | Spacing between elements |
| `Avatar` | Branch icons |
| `Alert` | Info banners |
| `Table` | Sales data grid |
| `Input.Search` | Search functionality |
| `Select` | Filter dropdowns |
| `Button` | Actions |
| `Dropdown`, `Menu` | Navigation dropdown |
| `Spin` | Loading states (imported but not actively used) |

### Custom Styling Patterns
- Inline styles for one-off layouts
- CSS variables for theme tokens
- `borderRadius: 12` for cards
- `box-shadow: 0 1px 4px rgba(0,0,0,0.06)` for subtle card elevation
