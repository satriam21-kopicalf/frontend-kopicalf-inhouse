# Frontend Project Analysis Documentation

**Project:** `frontend-kopicalf-inhouse`
**Last Updated:** 2026-09-16
**Tech Stack:** Next.js 16.3.3 · React 19.2.8 · TypeScript · Ant Design 6.6.4 · Turbopack

---

## 1. Project Overview

Internal management dashboard for Kopi Calf cafe chain. Connects to the FastAPI backend at `http://187.52.114.14:8000` (VPS production) to display sales reports, operational forms, and management tools.

---

## 2. Tech Stack Details

| Component | Version | Notes |
|-----------|---------|-------|
| Next.js | 16.3.3 | App Router, Turbopack bundler |
| React | 19.2.8 | Client components with 'use client' directive |
| TypeScript | ^5 | Strict mode assumed |
| Ant Design | 6.6.4 | UI component library |
| @ant-design/icons | ^6.3.4 | Icon set |
| Day.js | ^1.11.23 | Date manipulation |

---

## 3. Page Structure (26 Pages)

### Main Menu
- `app/main-menu/dashboard/page.tsx` — KPI overview
- `app/main-menu/recap-sales/page.tsx` — Sales recapitulation

### Operational - Forms (5 pages)
- `app/operational/form/pic-check-in/page.tsx`
- `app/operational/form/monitoring-outlet/page.tsx`
- `app/operational/form/monitoring-product/page.tsx`
- `app/operational/form/tool-heavy-tools/page.tsx`
- `app/operational/form/facility-request/page.tsx`

### Operational - Data (5 pages)
- `app/operational/data/pic-check-in/page.tsx`
- `app/operational/data/monitoring-outlet/page.tsx`
- `app/operational/data/monitoring-product/page.tsx`
- `app/operational/data/tool-heavy-tools/page.tsx`
- `app/operational/data/facility-request/page.tsx`

### Management (4 pages)
- `app/management/users/page.tsx`
- `app/management/department/page.tsx`
- `app/management/division/page.tsx`
- `app/management/approvals/page.tsx`

### Auth (4 pages)
- `app/auth/login/page.tsx`
- `app/auth/logout/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/reset-password/page.tsx`

### Other
- `app/account-profile/page.tsx`
- `app/page.tsx` (redirect)
- `app/layout.tsx`
- `app/globals.css`
- `app/not-found.tsx`

---

## 4. Component Inventory

### Layout Components

**`components/Layout.tsx`**
- Simple wrapper providing sidebar + children
- Imports Sidebar component

**`components/Sidebar.tsx`** (825 lines)
- Custom sidebar navigation with collapsible behavior
- Inline SVG icons (no external icon library dependency)
- Navigation sections: Main Menu, Operational - Form, Operational - Data, Management
- User profile dropdown with logout
- Responsive: mobile hamburger menu, desktop collapsible
- Active route highlighting
- Tooltip on collapsed state

**Icon Set (Custom SVG)**
```
dashboard, sales, clipboard, monitor, package, tools,
building, database, users, departments, user, logout,
bell, checkCircle, menu, chevronLeft, chevronRight,
chevronDown, settings, settings (duplicate)
```

### UI Pattern: Ant Design Components Used
- `Typography` (Title, Text)
- `Table` with `ColumnsType`
- `Card` with `Statistic`
- `Row`, `Col` (Grid)
- `Button` (types: primary, link, default)
- `Input`, `Input.Search`
- `Select` with `Select.Option`
- `Tag`
- `Space`
- `message`, `App` (notification context)

---

## 5. API Integration Patterns

### Authentication
- Bearer token in `Authorization` header
- Stored in `localStorage` or cookies
- Pattern: `Authorization: Bearer <token>`

### API Endpoints Consumed

**Auth**
- `POST /auth/login` — `{ username, password }`
- `POST /auth/logout`
- `GET /auth/me` — Current user info

**Reports**
- `GET /reports/{slug}` — Report data
- `GET /reports/{slug}/metadata` — Report metadata

**Sales**
- `GET /sales/recap` — Sales recapitulation
- `GET /sales/recap-detail` — Detailed sales (date range)

**COGS**
- `GET /cogs-ratio` — Cost ratio analysis

**Master Data**
- `GET /master/{entity}/rows` — Entity rows
- `GET /master/summary` — Master data summary
- `GET /master/bom-materials` — Bill of materials

**Stock & Waste**
- `GET /stock/system`
- `GET /stock-opname`
- `GET /waste`

**Internal Admin**
- `GET /internal/employees`
- `GET /internal/users`
- `GET /internal/roles`

---

## 6. Build Status

**Status:** ✅ BUILD SUCCESSFUL (28 static pages generated)

### Build Errors Fixed (History)
1. **`Card styles={{ body: { padding: 0 }}}` — Turbopack parsing error**
   - **Fix:** Changed to `bodyStyle={{ padding: 0 }}` (Ant Design v6 API)

2. **`Icons.checkCircle does not exist` — TypeScript error**
   - **Fix:** Added inline SVG checkCircle definition to `Sidebar.tsx`

### Dev Server
```bash
npm run dev     # Development with Turbopack
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint check
```

---

## 7. Project Structure

```
frontend-kopicalf-inhouse/
├── app/                          # Next.js App Router
│   ├── management/               # Management pages
│   │   ├── approvals/
│   │   ├── department/
│   │   ├── division/
│   │   └── users/
│   ├── main-menu/               # Main menu pages
│   │   ├── dashboard/
│   │   └── recap-sales/
│   ├── operational/             # Operational pages
│   │   ├── form/               # Form submission
│   │   └── data/              # Data viewing
│   ├── auth/                   # Authentication pages
│   ├── account-profile/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Layout.tsx
│   └── Sidebar.tsx
├── public/
│   └── assets/
│       └── calf-logo.png       # Logo image
├── package.json
├── next.config.ts
├── tsconfig.json
└── .eslintrc.json
```

---

## 8. Configuration

### Environment Variables (Expected)
```env
NEXT_PUBLIC_API_URL=http://187.52.114.14:8000
```

### Next.js Config
- Turbopack enabled for dev
- Image optimization configured
- Experimental React 19 features enabled

---

## 9. Known Issues & Recommendations

### Current
- All pages use mock/static data (no API integration yet)
- No authentication flow implemented
- `calf-logo.png` placeholder required in `public/assets/`

### Recommended Improvements
1. **API Client Layer** — Create `lib/api.ts` with typed fetch wrappers
2. **Auth Context** — Implement auth state management with React Context
3. **Error Handling** — Add global error boundaries
4. **Loading States** — Add skeleton/spinner for async data
5. **Responsive Table** — Ant Design Table needs responsive column hiding
6. **Real Data Integration** — Wire up backend API endpoints

---

## 10. Dependencies

```json
{
  "@ant-design/icons": "^6.3.4",
  "antd": "^6.6.4",
  "dayjs": "^1.11.23",
  "next": "16.3.3",
  "react": "19.2.8",
  "react-dom": "19.2.8"
}
```

Dev: `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `typescript`
