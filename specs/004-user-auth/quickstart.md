# Quickstart: Authentication & User Experience

## Prerequisites
- Node.js 20.x or higher
- npm package manager
- Neon PostgreSQL database (DATABASE_URL configured)

## Setup Authentication System

### 1. Install Backend Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit
npm install -D @types/bcryptjs @types/jsonwebtoken
```

> Frontend has no new packages — `@hookform/resolvers`, `react-hook-form`, `zod`, `sonner`, `axios` are already installed.

### 2. Update Prisma Schema & Migrate
Add `name`, `email_verified`, `last_login_at` to `User`; make `user_id` nullable on `Order`; add `Address` and `PasswordResetToken` models.
```bash
cd backend
npx prisma migrate dev --name add-auth-models
npx prisma generate
```

### 3. Set Environment Variables

**backend/.env** (add to existing):
```env
JWT_SECRET=change-this-to-a-256-bit-random-secret-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REMEMBER_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local** (create):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 4. Backend: Security Module
Create `backend/src/lib/security.ts` — JWT sign/verify, bcrypt hash/compare, password strength validator.
See `.claude/skills/better-auth-jwt/SKILL.md` § Backend §3 for complete code.

### 5. Backend: Auth Middleware
Create `backend/src/middlewares/auth.ts` — `authenticate` middleware that validates `Authorization: Bearer <token>`.
See SKILL.md § Backend §4 for complete code.

### 6. Backend: Auth & User Routes
- `backend/src/routes/auth.ts` — signup, login (rate-limited), logout, forgot-password, reset-password
- `backend/src/routes/users.ts` — profile GET/PUT, orders GET, addresses POST
- Mount in `backend/src/server.ts`:
  ```typescript
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  ```

### 7. Frontend: Auth Utilities & Context
- `frontend/lib/auth.ts` — token storage (localStorage/sessionStorage), isAuthenticated, decodeToken
- `frontend/lib/api.ts` — fetch client with `Authorization: Bearer` header + 401 auto-logout
- `frontend/contexts/AuthContext.tsx` — AuthProvider + useAuth hook
- `frontend/lib/validations/auth.ts` — Zod v4 schemas for login/signup/forgot-password/reset-password

### 8. Frontend: Components & Pages
- `frontend/components/ProtectedRoute.tsx` — redirects to `/login?redirect=<path>` if not authenticated
- `frontend/app/login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`
- Wrap `frontend/app/layout.tsx` with `<AuthProvider>` + `<Toaster>`
- Wrap cart, checkout, wishlist, profile pages with `<ProtectedRoute>`
- Update `Header.tsx` with auth-aware user menu

### 9. Replace x-user-id Hack
Remove `getUserId()` header workaround from `cartController.ts`, `orderController.ts`, `wishlistController.ts`.
Apply `authenticate` middleware to protected route files instead.

## Testing the Implementation
1. Start backend: `npm run dev` (from `backend/`)
2. Start frontend: `npm run dev` (from `frontend/`)
3. Navigate to `/signup` — create account (auto-verified in MVP)
4. Log in at `/login` — test Remember Me checkbox
5. Access `/cart`, `/wishlist`, `/profile` — should be protected
6. Log out — should redirect to `/login`
7. Test forgot-password flow (check console for reset token in development)
8. Test guest checkout flow — add item → checkout → "Continue as Guest" → Pay Now → confirmation page

## Key Implementation Reference
All complete code is in `.claude/skills/better-auth-jwt/SKILL.md`.

## Security Notes
- Rate limit: 5 login attempts per IP per 15 minutes
- Generic errors: "Invalid credentials" (never reveal if email exists)
- Tokens: 24h default, 30d with "Remember me"
- Password reset tokens: 1-hour expiry, single-use, stored in DB
- MVP: no real SMTP — reset tokens logged to console in development
