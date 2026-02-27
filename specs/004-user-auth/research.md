# Research: User Authentication & User Experience

## Decision: Custom JWT Implementation Strategy
**Rationale**: Custom JWT (bcryptjs + jsonwebtoken + express-rate-limit) is the chosen approach. It provides full control over auth flow, is simpler to debug in a split Express/Next.js architecture, and the `better-auth-jwt` skill provides complete, production-ready code for this exact stack. Better Auth SDK was evaluated but rejected due to architecture mismatch with a separate Express backend.
**Alternatives considered**:
- Better Auth SDK - Designed for Next.js full-stack; requires proxy layer or experimental Express adapter when using a separate backend
- NextAuth.js - More complex, primarily for Next.js full-stack
- Auth0/Firebase - Overkill for this project's scope; adds external dependency

## Decision: Protected Route Implementation
**Rationale**: Using a wrapper component approach provides flexibility and clear separation of concerns without complicating Next.js routing.
**Alternatives considered**:
- Next.js middleware - Would add complexity to all routes
- Server-side auth checks - Would impact performance
- Custom hook approach - Less maintainable for multiple protected routes

## Decision: Token Storage Strategy
**Rationale**: localStorage provides good persistence while being accessible to JavaScript for seamless auth state management.
**Alternatives considered**:
- HTTP-only cookies - Would require more complex API architecture
- SessionStorage - Would not persist across tabs/browsers
- Memory storage - Would lose on page refresh

## Decision: Password Validation Implementation
**Rationale**: Using zod schema validation with React Hook Form provides both client-side validation and good UX with password strength meter.
**Alternatives considered**:
- Pure regex validation - Less maintainable
- Server-side only validation - Poor user experience
- Custom validation library - Unnecessary complexity

## Decision: Guest Checkout Implementation
**Rationale**: Using a boolean flag approach in checkout flow allows for flexible implementation without complex branching.
**Alternatives considered**:
- Separate guest checkout flow - Would duplicate code
- Session-based guest flow - More complex state management
- Anonymous user accounts - Overcomplicated for this use case

## Decision: Password Reset Flow
**Rationale**: Email verification with time-limited secure links provides a standard, secure mechanism that users are familiar with.
**Alternatives considered**:
- SMS verification - Would require additional infrastructure
- Security questions - Less secure than email verification
- Support-based reset - Poor user experience

## Security Considerations
- JWT token expiration/renewal mechanisms
- Rate limiting on auth endpoints
- Secure password hashing in backend
- CORS configuration for API endpoints
- XSS protection for stored tokens
- CSRF protection for form submissions