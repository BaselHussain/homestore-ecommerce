# Research Document: Store Gaps Fixes

## Overview
Research for implementing the remaining gaps in the HomeStore e-commerce application: order detail page, profile page completeness, contact page, returns/exchanges page, and products pagination.

## Decision: Order Detail Page Implementation
**Rationale:** Based on the spec requirement to create an order detail page at `/orders/[id]` showing complete order information. The existing orders page fetches all user orders via `userApi.getOrders()` so the detail page can either fetch all orders and filter client-side, or make a new API call for a single order.

**Recommended Approach:** Create a new backend endpoint `GET /api/users/orders/:id` to fetch a single order by ID for better performance and security. The frontend will use this endpoint in the `/orders/[id]` page to fetch the specific order details.

**Alternatives considered:**
- Client-side filtering: Fetch all orders and filter by ID - less secure and inefficient
- Reuse existing endpoint: Fetch all orders and filter on frontend - potential security/privacy issue

## Decision: Profile Page Address Management
**Rationale:** The existing profile page has address management UI that needs to be connected to backend. The spec requires add/delete address functionality using existing `userApi.addAddress()` and `userApi.deleteAddress()` API calls.

**Recommended Approach:** Wire up the existing UI components to use the existing API functions from `frontend/lib/api.ts`. Follow existing patterns for error handling and success notifications using sonner toast.

**Alternatives considered:**
- Redesign UI: Would require more changes than necessary
- Create new API endpoints: Unnecessary since existing ones are already implemented

## Decision: Profile Page Password Change
**Rationale:** The existing profile page has a password change UI that needs to be connected to backend. The spec requires secure password change functionality using existing `userApi.updatePassword()` API call.

**Recommended Approach:** Connect existing UI to the existing API function with proper validation and error handling. Follow security best practices by showing generic error messages to prevent password enumeration.

**Alternatives considered:**
- Create complex password strength requirements: Would be over-engineering
- Add additional confirmation steps: Existing single confirmation is adequate

## Decision: Contact Page Implementation
**Rationale:** The spec requires a basic contact page with name, email, message fields. The form should submit but no real email sending is needed for MVP.

**Recommended Approach:** Create a static page with a form that submits to a new backend endpoint `/api/contact`. The backend endpoint will store the submission in the database and return a success response without actually sending an email. Use existing form patterns and styling.

**Alternatives considered:**
- Use external service like formspree: Would add unnecessary dependency
- Pure client-side only: Would not allow for follow-up on inquiries

## Decision: Returns & Exchanges Page Implementation
**Rationale:** The spec requires a static informational page covering return policy, exchange process, and how to initiate a return with no backend needed.

**Recommended Approach:** Create a static page with content that follows existing design patterns (font-display headings, card/border/rounded-xl patterns, etc.). Use existing component patterns for layout and styling.

**Alternatives considered:**
- Dynamic content from DB: Unnecessary complexity for static policy information
- External link to policy: Would break design consistency

## Decision: Products Pagination Implementation
**Rationale:** The spec requires implementing pagination on the products page showing 12 products per page with navigation controls. The backend already supports page/limit params.

**Recommended Approach:** Update the existing `ProductsClientPage.tsx` to add pagination controls and modify the API calls to include page and limit parameters. The backend already supports `?page=1&limit=12` so just need to implement the UI controls and state management.

**Alternatives considered:**
- Infinite scroll: Would be more complex to implement than simple pagination
- Load more button: Would still require page state management

## Technical Considerations

1. **Authentication**: All user-specific pages (order details, profile) will use the existing `useAuth()` hook for protection
2. **Styling Consistency**: All new components will follow existing patterns (LightSheenButton, AnimatedElement, etc.)
3. **API Consistency**: Use existing patterns from `frontend/lib/api.ts` for all API calls
4. **Error Handling**: Follow existing patterns for notifications using sonner
5. **Loading States**: Use existing patterns with Loader2 spinner or Skeleton components