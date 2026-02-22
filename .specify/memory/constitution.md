<!--
Sync Impact Report:
Version change: N/A → 1.0.0
Modified principles: N/A (new constitution)
Added sections: All sections added
Removed sections: N/A
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (to be updated with constitution checks)
- ✅ .specify/templates/spec-template.md (to be updated with constitution checks)
- ✅ .specify/templates/tasks-template.md (to be updated with constitution checks)
Follow-up TODOs: None
-->
# Homestore E-Commerce Website Constitution

## Core Principles

### I. Educational Clarity
All project artifacts must prioritize educational clarity and accessibility. This includes: README.md with clear setup instructions (frontend + backend), CLAUDE.md with full agentic workflow, and all code must be readable, well-commented, and beginner-friendly. The project must serve as a learning resource for developers new to e-commerce development.

### II. Engineering Accuracy
Technical implementation must follow specific requirements: Frontend built with Next.js 16+ (App Router, TypeScript), Backend with Express.js, Database with Neon Serverless PostgreSQL, Authentication using Better Auth (email/password signup/signin, JWT tokens), Currency fixed as USD, and product descriptions generated using Claude. UI replication must copy the demo UI exactly as-is from the homestore-sparkle folder with no redesign or changes to existing demo elements. Reusable components must use shadcn/ui for consistency.

### III. Practical Applicability
The application must be practically deployable and maintainable. It must be runnable locally (npm run dev for frontend + node server.js for backend) and deployable (Vercel for frontend + Render for backend). It must be responsive, mobile-first, with elegant design that matches the demo exactly. Product images can initially use placeholders until provided.

### IV. Spec-Driven Development
Development must follow a structured spec-driven approach with three separate specs in order: 1) Backend & Database Setup (Express endpoints, Neon DB models for products/orders/cart/wishlist/users), 2) Frontend & Core Features (exact UI replication + product listing/PDP/cart/checkout/wishlist/search using shadcn/ui), 3) Authentication & User Experience (Better Auth integration, protected routes, user profile, simulated payment, related/recently viewed logic). Every feature must be traceable to spec.

### V. Ethical Responsibility
The application must prioritize ethical development practices: Secure authentication (JWT, hashed passwords), no unnecessary data collection, privacy-first checkout & user data handling. All user data must be handled with respect for privacy and security.

### VI. Reproducibility & Open Knowledge
The project must be fully reproducible and open: Public GitHub repository, reproducible with .env.example, npm, node, and all files version-controlled. The setup process must be straightforward and documented for any developer to replicate.

### VII. Zero Broken State
The system must maintain a working state at all times: Main branch always working, all PRs pass local testing, no crashes on normal usage (browse → PDP → add to cart → checkout → wishlist → profile). The application must be functional through core user flows at every stage of development.

## Additional Constraints

### Core Features
The application must implement: product listing/search, product detail page (PDP), add to cart, cart page, checkout, add to wishlist. These features must be fully functional before enhancements.

### High-Priority Enhancements
After exact UI replication, the following enhancements must be added:
1. User Profile / Account Dashboard (My Orders, saved addresses, password change)
2. Product Details Page (zoom images, variants if any, generated description, reviews, "Related Products" section, "Recently Viewed Products" section)
3. Cart Enhancements (quantity update, remove item, subtotal, coupon code simulation)
4. Checkout Flow (multi-step: cart review → shipping → payment → confirmation, guest checkout)
5. Related Products (on PDP: suggest 4–6 similar products by category/tags)
6. Recently Viewed Products (track last 5–10 viewed products, show on PDP/homepage)

### Payment Implementation
Payment gateway must be simulated/fake (Pay Now button → success message, order saved in DB, no real gateway yet).

## Development Workflow

### UI Replication Rule
The Vite React demo project in the homestore-sparkle folder must be replicated exactly as-is with no changes, redesigns, or removals of existing demo UI elements. This includes hero banner picture, header with categories, footer with pages like About/Contact/Privacy, overall layout, styling, colors, fonts, responsiveness, and component structure.

### Component Standards
All UI elements must use shadcn/ui components (buttons, cards, modals, tables, forms, dialogs, toasts, etc.) to maintain clean and consistent code.

### Testing Requirements
All features must have test coverage and pass validation before merging. The application must handle core user flows without crashes.

## Governance

The constitution serves as the authoritative source for all development decisions. All pull requests and code reviews must verify compliance with these principles. Amendments to the constitution require explicit documentation of changes, approval from project maintainers, and a migration plan for existing code. The constitution supersedes any conflicting practices or guidelines. All project artifacts must align with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-02-22 | **Last Amended**: 2026-02-22