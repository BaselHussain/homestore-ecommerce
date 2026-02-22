# Implementation Plan: Backend & Database Setup

**Branch**: `001-backend-setup` | **Date**: 2026-02-22 | **Spec**: [link to spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-setup/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan implements the Express.js backend and Neon PostgreSQL database for the Homestore e-commerce website, including models, endpoints, and basic CRUD operations for products, orders, cart, and wishlist as specified in the feature specification. The implementation will use TypeScript, Prisma ORM, and follow the required folder structure with proper controllers, routes, and middleware.

## Technical Context

**Language/Version**: TypeScript with Node.js 20.x
**Primary Dependencies**: Express.js, Prisma, @prisma/client, dotenv, cors, zod (for validation)
**Storage**: Neon Serverless PostgreSQL database with Prisma ORM
**Testing**: Manual via Postman (automated tests to be added in future spec)
**Target Platform**: Linux/Mac/Windows server environments for deployment on Render
**Project Type**: Web application (backend API service)
**Performance Goals**: Handle 100+ concurrent requests, API response under 500ms
**Constraints**: USD currency fixed, immediate stock reservation, 24-hour cart expiration
**Scale/Scope**: Support basic e-commerce operations, up to 10k products initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Educational Clarity**: The backend will be well-commented with clear documentation and setup instructions in README.md
2. **Engineering Accuracy**: Implementation follows exact requirements - Express.js with TypeScript, Neon PostgreSQL, Prisma ORM
3. **Practical Applicability**: Backend will be deployable on Render and locally runnable with node server.js
4. **Spec-Driven Development**: Following the exact specification from spec.md with all required endpoints and models
5. **Ethical Responsibility**: Secure password hashing to be implemented in Spec 3
6. **Reproducibility & Open Knowledge**: All code will be in version control with .env.example for setup
7. **Zero Broken State**: All endpoints will return correct data with proper error handling

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-setup/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── server.js                    # Express app entry point
├── package.json               # Dependencies: express, prisma, @prisma/client, dotenv, cors, zod
├── .env.example              # DATABASE_URL and other environment variables
├── prisma/
│   ├── schema.prisma          # Prisma models: User, Product, Cart, Wishlist, Order
│   └── migrations/            # Auto-generated migration files
├── controllers/
│   ├── productController.js   # Product-related business logic
│   ├── cartController.js      # Cart-related business logic
│   ├── wishlistController.js  # Wishlist-related business logic
│   └── orderController.js     # Order-related business logic
├── routes/
│   ├── products.js            # Product API routes
│   ├── cart.js                # Cart API routes
│   ├── wishlist.js            # Wishlist API routes
│   └── orders.js              # Order API routes
└── middlewares/
    └── errorHandler.js        # Global error handling middleware
```

**Structure Decision**: The web application structure is selected since we're building a backend API service that will serve the frontend. The backend directory contains all necessary components for the Express.js server with proper separation of concerns through controllers, routes, and middleware.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [N/A] | [No violations found] | [All constitution requirements satisfied] |

## Phase Completion Status

### Phase 0: Outline & Research
- [x] Research unknowns identified from Technical Context
- [x] Research agents dispatched for technology choices
- [x] Findings consolidated in `research.md`
- [x] All NEEDS CLARIFICATION items resolved

### Phase 1: Design & Contracts
- [x] Entities extracted from feature spec → `data-model.md`
- [x] API contracts generated from functional requirements → `/contracts/`
- [x] Quickstart guide created → `quickstart.md`
- [x] Agent context updated via `.specify/scripts/bash/update-agent-context.sh`
