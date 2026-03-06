# Implementation Plan: Admin Panel

**Branch**: `006-admin-panel` | **Date**: 2026-03-03 | **Spec**: specs/006-admin-panel/spec.md
**Input**: Feature specification from `/specs/006-admin-panel/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a separate, secure, animated admin dashboard for Homestore e-commerce website using Next.js (admin routes), connected to the same Express.js backend and Neon DB. The admin panel will include dashboard overview, products management (CRUD), orders management (status updates), users management (ban/unban), analytics charts, and invoice generation with Framer Motion animations and shadcn/ui components. The system will implement single admin role access control with 8-hour session timeout for security.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 14+ App Router, Node.js 20.x
**Primary Dependencies**: Next.js, React, Framer Motion, Recharts, shadcn/ui, Better Auth, jsPDF, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL (existing from spec 1)
**Testing**: Manual testing for admin functionality (no automated tests specified)
**Target Platform**: Web application (admin dashboard)
**Project Type**: Web application with frontend-only admin routes
**Performance Goals**: <3 seconds for dashboard load, <2 seconds for order status updates, 95% success rate for admin operations
**Constraints**: Admin-only access (role-based), 8-hour session timeout, 10MB max image size, 5 images per product, responsive design for desktop/tablet

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Educational Clarity: Admin UI will use clear, well-documented components with shadcn/ui
- ✅ Engineering Accuracy: Will use Next.js 14+ App Router, TypeScript, existing backend, Better Auth for admin role
- ✅ Practical Applicability: Admin dashboard will be responsive and mobile-friendly for extended use
- ✅ Spec-Driven Development: Following spec-driven approach with proper planning and implementation
- ✅ Ethical Responsibility: Secure admin authentication with role-based access control
- ✅ Reproducibility & Open Knowledge: All admin functionality will be in version-controlled code
- ✅ Zero Broken State: Admin routes will have proper authentication checks to prevent unauthorized access

## Project Structure

### Documentation (this feature)

```text
specs/006-admin-panel/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
admin/                          # Separate Next.js 16 app (root level)
├── app/
│   ├── layout.tsx              # Root admin layout with animated sidebar
│   ├── page.tsx                # Dashboard overview (/ route)
│   ├── products/
│   │   └── page.tsx            # Products CRUD (/products route)
│   ├── orders/
│   │   └── page.tsx            # Orders management (/orders route)
│   ├── users/
│   │   └── page.tsx            # Users management (/users route)
│   ├── analytics/
│   │   └── page.tsx            # Analytics charts (/analytics route)
│   └── invoices/
│       └── page.tsx            # Invoice generation (/invoices route)
├── components/
│   ├── Sidebar.tsx             # Animated collapse/expand sidebar
│   ├── DashboardStats.tsx      # Animated cards for dashboard stats
│   ├── Charts/
│   │   ├── SalesLineChart.tsx  # Sales line chart (Recharts)
│   │   ├── TopProductsChart.tsx
│   │   ├── OrderStatusChart.tsx
│   │   └── UserGrowthChart.tsx
│   ├── ProductForm.tsx         # Add/edit product form
│   └── InvoicesGenerator.tsx  # Date picker + PDF button
├── lib/
│   ├── framerVariants.ts       # Reusable animation variants
│   └── api.ts                  # API client for backend calls
└── contexts/
    └── AdminAuthContext.tsx    # Admin auth state + role check

backend/src/routes/
└── admin/                      # New admin-only backend routes
    ├── admin.ts                # Router entry point (mounts all sub-routes)
    ├── stats.ts                # GET /api/admin/stats
    ├── products.ts             # CRUD /api/admin/products
    ├── orders.ts               # GET + PATCH /api/admin/orders
    ├── users.ts                # GET + PATCH /api/admin/users
    ├── analytics.ts            # GET /api/admin/analytics
    └── invoices.ts             # GET + POST /api/admin/invoices
```

**Structure Decision**: Admin panel is a **separate Next.js 16 app** at root level (`admin/` directory), completely isolated from the customer-facing `frontend/`. This allows independent deployment and zero risk of affecting customer UI. Backend admin API endpoints are added to the existing Express.js backend under `/api/admin/*` with admin role middleware protection.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple admin pages | Admin functionality requires separate sections for dashboard, products, orders, users, analytics, invoices | Single page would be too complex and hard to navigate for admin tasks |
