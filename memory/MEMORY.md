# Project Memory

## Project: Homestore E-Commerce

### Tech Stack (Active)
- **Backend**: TypeScript + Node.js 20.x + Express 4.x
- **ORM**: Prisma 5.x with Neon Serverless PostgreSQL
- **Validation**: Zod
- **Runtime tools**: tsx (dev), nodemon
- **@types/express**: Must use `^4.17.x` (NOT v5) — v5 types break ParamsDictionary to `string | string[]`

### Key Paths
- Backend source: `backend/src/`
- Prisma schema: `backend/prisma/schema.prisma`
- Migration files: `backend/prisma/migrations/`
- Seed script: `backend/prisma/seed.ts`
- Feature specs: `specs/001-backend-setup/`
- PHR history: `history/prompts/001-backend-setup/`

### Implemented Features (001-backend-setup)
- All 5 Prisma models: User, Product, Cart, Wishlist, Order
- REST endpoints: `/api/products`, `/api/cart`, `/api/wishlist`, `/api/orders`
- Health check: `GET /health`
- DB migration applied (20260222053038_init), 8 products seeded
- Auth: not yet implemented — user identity via `x-user-id` header (MVP only)

### Known Patterns
- `getUserId(req)` helper: extracts `x-user-id` header, handles `string | string[]`
- Cart: immediate stock reservation on add; 24h expiry restores stock
- Orders: state machine transitions validated in orderController
- Error format: `{ error: { message, statusCode } }`

### Pitfalls to Avoid
- Do NOT use `@types/express@^5` — use `^4.17.21` to match Express 4
- Prisma `$transaction` needed for any stock+cart atomic operations
- Neon URL is in `backend/.env` (git-ignored) — never commit it
