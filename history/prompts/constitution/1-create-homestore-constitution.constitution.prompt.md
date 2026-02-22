---
id: 1
title: create-homestore-constitution
stage: constitution
date: 2026-02-22
surface: agent
model: if/qwen3-coder-plus
feature: none
branch: main
user: Claude Opus 4.6
command: sp.constitution
labels: [constitution, setup, project]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Homestore E-Commerce Website (Customer Side)

Project: Build a full-stack e-commerce website named "Homestore" with Next.js frontend, Express.js backend, and Neon Serverless PostgreSQL database.

Core rule: The Vite React demo project is already present in the root folder (homestore-sparkle). Replicate its UI and structure **exactly as-is** (hero banner picture, header with categories, footer with pages like About/Contact/Privacy, overall layout, styling, colors, fonts, responsiveness, component structure). Do not change, redesign, or remove any existing demo UI elements — copy it 100%. Then enhance it by adding missing e-commerce features and improvements.

Core purpose: Create a modern, user-friendly e-commerce customer experience using spec-driven development.

Constitution Check (must PASS all):

I. Educational Clarity
- README.md with clear setup instructions (frontend + backend)
- CLAUDE.md with full agentic workflow
- All code readable, well-commented, beginner-friendly

II. Engineering Accuracy
- Frontend: Next.js 16+ (App Router, TypeScript)
- Backend: Express.js
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (email/password signup/signin, JWT tokens)
- Currency: USD (fixed)
- Product descriptions: Generate using Claude (no real descriptions provided)
- UI replication: Copy demo UI **exactly as-is** from the homestore-sparkle folder (hero banner, header categories, footer pages, layout, styling, responsiveness — do not redesign or change existing demo elements)
- Reusable components: Use **shadcn/ui** for all UI elements (buttons, cards, modals, tables, forms, dialogs, toasts, etc.) to keep code clean and consistent
- Core features: product listing/search, product detail page (PDP), add to cart, cart page, checkout, add to wishlist
- High-priority enhancements (add after exact UI replication):
  1. User Profile / Account Dashboard (My Orders, saved addresses, password change)
  2. Product Details Page (zoom images, variants if any, generated description, reviews, "Related Products" section, "Recently Viewed Products" section)
  3. Cart Enhancements (quantity update, remove item, subtotal, coupon code simulation)
  4. Checkout Flow (multi-step: cart review → shipping → payment → confirmation, guest checkout)
  5. Related Products (on PDP: suggest 4–6 similar products by category/tags)
  6. Recently Viewed Products (track last 5–10 viewed products, show on PDP/homepage)
- Payment gateway: Simulated/fake (Pay Now button → success message, order saved in DB, no real gateway yet)

III. Practical Applicability
- Runnable locally: npm run dev (frontend) + node server.js (backend)
- Deployable: Vercel (frontend) + Render (backend)
- Responsive, mobile-first, elegant design matching demo exactly
- Product images provided later — use placeholders until then

IV. Spec-Driven Development
- Three separate specs in this order:
  1. Backend & Database Setup (Express endpoints, Neon DB models for products/orders/cart/wishlist/users)
  2. Frontend & Core Features (exact UI replication from homestore-sparkle demo + product listing/PDP/cart/checkout/wishlist/search using shadcn/ui)
  3. Authentication & User Experience (Better Auth integration, protected routes, user profile, simulated payment, related/recently viewed logic)
- Every feature traceable to spec
- All implementation via Claude Code only

V. Ethical Responsibility
- Secure authentication (JWT, hashed passwords)
- No unnecessary data collection
- Privacy-first checkout & user data handling

VI. Reproducibility & Open Knowledge
- Public GitHub repository
- Reproducible with .env.example, npm, node
- All files version-controlled

VII. Zero Broken State
- Main branch always working
- All PRs pass local testing
- No crashes on normal usage (browse → PDP → add to cart → checkout → wishlist → profile)

Deliverables:
- constitution.md (this file)
- specs/ folder with 3 sub-specs (backend-db, frontend-features, auth-ux)
- frontend/ and backend/ folders
- README.md with full setup
- CLAUDE.md with workflow

Go.

## Response snapshot

Created the project constitution file at `.specify/memory/constitution.md` with all seven core principles as specified in the requirements. The constitution includes:

I. Educational Clarity - Prioritizing educational clarity and accessibility
II. Engineering Accuracy - Specific technical requirements and UI replication rules
III. Practical Applicability - Deployment and maintainability requirements
IV. Spec-Driven Development - Structured development approach with three specs
V. Ethical Responsibility - Security and privacy focus
VI. Reproducibility & Open Knowledge - Open and reproducible development
VII. Zero Broken State - Maintaining working state at all times

The constitution also includes additional constraints, development workflow rules, and governance sections.

## Outcome

- ✅ Impact: Created complete project constitution with all required principles
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md
- 🔁 Next prompts: Create specs based on constitution
- 🧠 Reflection: Constitution successfully captures all requirements from user input

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): standard
- Next experiment (smallest change to try): Begin spec creation based on constitution