# Implementation Plan: Authentication & User Experience

**Branch**: `004-user-auth` | **Date**: 2026-02-24 | **Spec**: [specs/004-user-auth/spec.md](../spec.md)
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure customer authentication using custom JWT (bcryptjs + jsonwebtoken) with email/password signup/signin and protected routes for cart, checkout, wishlist and profile pages. Includes user profile dashboard with order history and address management, simulated payment flow with guest checkout option, and proper token storage with security measures. Implementation follows the `better-auth-jwt` skill (`.claude/skills/better-auth-jwt/SKILL.md`) for all code patterns.

## Technical Context

**Language/Version**: TypeScript (frontend), TypeScript (backend), Node.js 20.x
**Primary Dependencies**: bcryptjs, jsonwebtoken, express-rate-limit (backend auth); react-hook-form, zod v4, sonner (frontend); Next.js 16+, React 19+, Tailwind CSS v4
**Storage**: Neon Serverless PostgreSQL (backend), localStorage (frontend client-side)
**Testing**: Jest, React Testing Library (frontend), Supertest (backend)
**Target Platform**: Web application (responsive, mobile-first)
**Project Type**: Web application with separate frontend (Next.js) and backend (Express.js)
**Performance Goals**: <100ms p95 auth response time, sub-2s profile page load, 95% successful auth flows
**Constraints**: JWT token management, secure credential handling, GDPR compliance for user data
**Scale/Scope**: Support 10k+ users with secure authentication, maintain 99.9% auth system availability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Compliance Verification:**

✅ **Educational Clarity**: Auth components will include clear documentation and comments for learning purposes
✅ **Engineering Accuracy**: Using Better Auth as specified in constitution for JWT-based authentication
✅ **Practical Applicability**: Implementation will work both locally and in deployment scenarios
✅ **Spec-Driven Development**: Following spec order with proper traceability from requirements
✅ **Ethical Responsibility**: Secure JWT handling, privacy-first auth flow, proper password requirements
✅ **Reproducibility & Open Knowledge**: All auth code will be version-controlled and documented
✅ **Zero Broken State**: Auth system will maintain working state during implementation with proper fallbacks

**Gates Status**: PASS - All constitution principles supported by planned implementation

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── components/
│   ├── AuthProvider.tsx          # Better Auth context provider
│   ├── ProtectedRoute.tsx        # Protected route wrapper component
│   └── auth/
│       ├── LoginForm.tsx         # Login form component with shadcn/ui
│       ├── SignupForm.tsx        # Signup form component with shadcn/ui
│       └── PasswordResetForm.tsx # Password reset component
├── app/
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── forgot-password/
│   │   └── page.tsx              # Forgot password page
│   ├── profile/
│   │   └── page.tsx              # User profile dashboard
│   ├── checkout/
│   │   └── confirmation/
│   │       └── page.tsx          # Order confirmation page
│   └── api/
│       └── auth/
│           ├── login/
│           ├── signup/
│           ├── logout/
│           └── reset-password/
├── lib/
│   ├── auth.ts                   # Auth utilities and token management
│   ├── api.ts                    # API client with JWT interceptor
│   └── types/
│       └── auth.ts               # Auth-related TypeScript types
└── contexts/
    └── AuthContext.tsx           # Authentication context

backend/
└── src/
    ├── lib/
    │   └── security.ts           # JWT + bcrypt + password utilities
    ├── middlewares/
    │   └── auth.ts               # authenticate middleware (Bearer token)
    └── routes/
        ├── auth.ts               # Auth API routes (signup, login, logout, reset)
        └── users.ts              # User profile API routes
```

**Structure Decision**: Web application with dedicated auth components in frontend and corresponding API endpoints in backend. Uses custom JWT (bcryptjs + jsonwebtoken) on the Express backend; all auth state managed client-side via AuthContext with localStorage/sessionStorage token storage.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| JWT State Management | Needed for secure authentication | Simpler session-based auth would require server-side state |
| Protected Route Component | Required for client-side auth protection | Simpler approach would not work with Next.js App Router |
