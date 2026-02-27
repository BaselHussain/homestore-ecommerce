# Tasks: Authentication & User Experience

**Feature**: Authentication & User Experience
**Branch**: 004-user-auth
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)
**Created**: 2026-02-24 | **Status**: Draft

## Implementation Strategy

**Approach**: MVP-first implementation following spec priority (P1 → P2 → P3). Each user story includes complete implementation from UI to backend.

**MVP Scope**: User Story 1 (Authentication and Protected Features) - Complete auth system with signup/login and protected routes.

**Dependencies**: User Story 2 (Profile) requires User Story 1 (Auth). User Story 3 (Guest Checkout) is independent but requires checkout flow from existing features.

## Phase 1: Setup Tasks

**Goal**: Initialize authentication system and install required dependencies

- [X] T001 Install auth dependencies — backend: `npm install bcryptjs jsonwebtoken express-rate-limit && npm install -D @types/bcryptjs @types/jsonwebtoken`; frontend: no new packages needed (@hookform/resolvers, zod, sonner already installed)
- [X] T001b Create backend/src/lib/security.ts — JWT sign/verify (createAccessToken, decodeAccessToken), bcrypt hash/compare (hashPassword, verifyPassword), generateResetToken, validatePasswordStrength
- [X] T002 [P] Create frontend/contexts/AuthContext.tsx for authentication state management
- [X] T003 [P] Create frontend/components/AuthProvider.tsx with Better Auth context provider
- [X] T004 [P] Create frontend/lib/auth.ts with authentication utilities and token management functions
- [X] T005 [P] Create frontend/lib/types/auth.ts with TypeScript types for auth-related entities
- [X] T006 Create backend/src/middlewares/auth.ts with `authenticate` middleware and `AuthRequest` interface (Bearer token validation via jsonwebtoken)
- [X] T007 Setup environment variables: add JWT_SECRET, JWT_EXPIRES_IN, JWT_REMEMBER_EXPIRES_IN, FRONTEND_URL to backend/.env and backend/.env.example; create frontend/.env.local with NEXT_PUBLIC_API_BASE_URL

## Phase 2: Foundational Tasks

**Goal**: Build foundational components required for all user stories

- [X] T008 [P] Create frontend/lib/api.ts with JWT interceptor for API calls
- [X] T009 [P] Create frontend/components/ProtectedRoute.tsx component wrapper for protected pages
- [X] T010 [P] Create frontend/components/auth/LoginForm.tsx with email/password and validation
- [X] T011 [P] Create frontend/components/auth/SignupForm.tsx with validation and password strength meter
- [X] T012 [P] Create frontend/components/auth/PasswordResetForm.tsx component
- [X] T013 [P] Implement password validation with zod in frontend/lib/auth.ts
- [X] T014 [P] Create backend/src/routes/auth.ts with authentication API routes (signup, login with rate limiter, logout, forgot-password, reset-password)
- [X] T015 [P] Create backend/src/routes/users.ts with user profile API endpoints (profile GET/PUT, orders GET, addresses POST — all behind authenticate middleware)

## Phase 3: [US1] Authenticate and Access Protected Features

**Goal**: Implement core authentication flow with protected routes for cart, checkout, wishlist, profile

**Independent Test**: Can be fully tested by signing up a new user, logging in, and accessing protected routes like cart and wishlist. Delivers value by enabling personalized shopping experience.

**Acceptance Scenarios**:
1. **Given** user is on homepage, **When** user navigates to protected route like cart, **Then** user is redirected to login page
2. **Given** user is on login page, **When** user enters valid credentials and submits, **Then** user is redirected to intended page with authenticated session
3. **Given** user has valid session, **When** user accesses protected route, **Then** user can view and interact with protected features

- [X] T016 [P] [US1] Create frontend/app/login/page.tsx with login form and redirect logic
- [X] T017 [P] [US1] Create frontend/app/signup/page.tsx with signup form and account verification
- [X] T018 [P] [US1] Create frontend/app/forgot-password/page.tsx with password reset functionality
- [X] T019 [US1] Wrap cart page with ProtectedRoute component to require authentication
- [X] T020 [US1] Wrap checkout page with ProtectedRoute component to require authentication (reverted in Phase 5 for guest checkout)
- [X] T021 [US1] Wrap wishlist page with ProtectedRoute component to require authentication
- [X] T022 [US1] Wrap profile page with ProtectedRoute component to require authentication
- [X] T023 [US1] Implement token storage with options for both persistent ("Remember me") and session-only
- [X] T024 [US1] Add loading states and error handling for auth interactions with generic error messages
- [X] T025 [US1] Implement logout functionality that clears tokens and redirects to home
- [X] T026 [US1] Add Sonner toast notifications for auth events (login success, error messages)
- [X] T027 [US1] Test auth flow: signup → login → access protected routes

## Phase 4: [US2] Manage User Profile & Orders

**Goal**: Implement user profile dashboard with order history and account management options

**Independent Test**: Can be tested by logging in as an existing user and navigating to profile page to view orders and edit account details. Delivers value by providing account management and order tracking.

**Acceptance Scenarios**:
1. **Given** authenticated user is logged in, **When** user visits profile page, **Then** user can view their orders with status (pending, shipped, delivered)
2. **Given** authenticated user is on profile page, **When** user updates personal information, **Then** changes are saved and reflected in the system
3. **Given** authenticated user is on profile page, **When** user adds or edits an address, **Then** address is saved and available for future orders

- [X] T028 [P] [US2] Create frontend/app/profile/page.tsx with user profile dashboard layout
- [X] T029 [P] [US2] Implement GET /api/users/profile endpoint to fetch user information
- [X] T030 [P] [US2] Implement PUT /api/users/profile endpoint to update user information
- [X] T031 [P] [US2] Implement GET /api/users/orders endpoint to fetch order history
- [X] T032 [P] [US2] Implement POST /api/users/addresses endpoint to add new addresses
- [X] T033 [US2] Display user profile information (name, email) on profile page
- [X] T034 [US2] Display order history with status (pending, shipped, delivered) on profile page
- [X] T035 [US2] Implement address management (add/edit/delete) functionality
- [X] T036 [US2] Implement change password functionality with email verification
- [X] T037 [US2] Implement order tracking simulation (showing status transitions)
- [X] T038 [US2] Add loading states and error handling for profile page interactions
- [X] T039 [US2] Test profile management flow: login → view orders → update info → add address

## Phase 5: [US3] Guest Checkout with Simulated Payment

**Goal**: Implement guest checkout option and simulated payment flow with confirmation page

**Independent Test**: Can be tested by adding items to cart as an unauthenticated user and completing the guest checkout flow. Delivers value by enabling purchases without requiring account creation.

**Acceptance Scenarios**:
1. **Given** unauthenticated user has items in cart, **When** user clicks checkout, **Then** user can proceed as guest with appropriate flow
2. **Given** user is in checkout process, **When** user completes payment simulation, **Then** user receives success message and order confirmation
3. **Given** user completed guest checkout, **When** user views confirmation, **Then** order details are displayed with tracking information

- [X] T040 [P] [US3] Create frontend/app/checkout/confirmation/page.tsx for order confirmation
- [X] T041 [P] [US3] Implement POST /api/orders endpoint to save order information to DB
- [X] T042 [US3] Add guest checkout toggle option to checkout flow
- [X] T043 [US3] Implement simulated payment flow with "Pay Now" button and success message
- [X] T044 [US3] Update checkout to handle both authenticated and guest user flows
- [X] T045 [US3] Show confirmation page with order summary and tracking information
- [X] T046 [US3] Implement order status changes (pending → confirmed) in simulated payment
- [X] T047 [US3] Add Sonner toast notifications for checkout events
- [X] T048 [US3] Test guest checkout flow: add items → checkout as guest → simulate payment → confirmation

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Complete implementation with security, performance, and quality enhancements

- [X] T049 Add rate limiting for auth endpoints (max 5 attempts per IP per 15 minutes)
- [X] T050 Implement token expiration handling with seamless re-authentication
- [X] T051 Add security headers and CSRF protection for auth forms
- [X] T052 Implement proper error boundaries for auth components
- [X] T053 Add loading states and skeleton screens for protected routes
- [X] T054 Implement proper session management and token refresh mechanisms
- [X] T055 Add comprehensive error handling for network issues during auth processes
- [X] T056 Update existing checkout flow to support guest checkout option
- [X] T057 Add analytics/tracking for auth-related user actions
- [X] T058 Performance optimization: lazy load auth components when needed
- [X] T059 Update UI components to use shadcn/ui for auth forms and profile sections
- [X] T060 Security review: Verify password requirements (min 8 chars with upper/lower/number/special)
- [X] T061 Final testing: Complete user flows for all three user stories
- [X] T062 Documentation: Update README with authentication setup instructions

## Dependencies & Parallel Execution

### User Story Dependencies:
- [US2] depends on [US1] (Profile requires authentication system)
- [US3] is independent but requires checkout flow from existing features

### Parallel Execution Opportunities:
- Tasks T002-T005 in Phase 1 can run in parallel
- Tasks T008-T015 in Phase 2 can run in parallel
- Tasks T016-T018 in Phase 3 can run in parallel
- Tasks T029-T032 in Phase 4 can run in parallel
- Tasks T040-T041 in Phase 5 can run in parallel

### Blocking Relationships:
- ProtectedRoute component (T009) must be completed before wrapping protected pages (T019-T022)
- AuthContext (T002) must be completed before ProtectedRoute (T009)
- API routes (T014-T015) must be completed before frontend profile implementation (T028-T037)