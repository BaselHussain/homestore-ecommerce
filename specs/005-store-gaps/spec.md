# Feature Specification: Store Gaps Fixes

**Feature Branch**: `005-store-gaps`
**Created**: 2026-03-01
**Status**: Draft
**Input**: User description: "Feature name: 005-store-gaps

Fix remaining gaps in the HomeStore e-commerce frontend and backend to make the store production-ready (excluding payment integration).

Critical gaps:
1. Order detail page — \"View Details\" button on /orders currently does nothing. Need /orders/[id] page showing full order summary: items list, quantities, prices, shipping address, order status,
tracking number if available.

2. Profile page completeness — /profile page has tabs for Orders, Addresses, and Account. Addresses tab (add/delete saved addresses via POST /api/users/addresses and DELETE /api/users/addresses/:id)
and password change (PUT /api/users/password) need to be verified working and any broken UI fixed.

Minor gaps:
3. /contact page — basic contact page with a contact form (name, email, message fields). Form submits but no real email sending needed (console.log or toast confirmation is fine for MVP).

4. /returns-exchanges page — static informational page covering return policy, exchange process, and how to initiate a return. No backend needed.

5. Products pagination — /products currently fetches all 100 products at once. Add pagination (12 products per page) with prev/next controls. Backend already supports page/limit params.

Tech stack: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, Express.js backend, Prisma + Neon PostgreSQL. Auth via JWT (useAuth hook). API calls via userApi/ordersApi from
frontend/lib/api.ts"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View order details (Priority: P1)

As an authenticated user, I want to click on the "View Details" button in my order history to see the complete details of a specific order, including items purchased, quantities, prices, shipping address, status, and tracking information.

**Why this priority**: Critical for user experience - users need to access details of their orders to track their purchases and resolve any issues.

**Independent Test**: Can be fully tested by navigating to /orders, clicking "View Details" button for an order, and verifying the detailed order page displays all relevant information. This adds value by enabling order tracking functionality.

**Acceptance Scenarios**:

1. **Given** user is on /orders page, **When** user clicks "View Details" button for an order, **Then** user is redirected to /orders/[id] page showing detailed order information
2. **Given** user is on order detail page, **When** page loads, **Then** order items, quantities, prices, shipping address, status, and tracking number are displayed

---

### User Story 2 - Manage saved addresses (Priority: P1)

As an authenticated user, I want to add new shipping addresses to my account and delete existing addresses from the /profile page addresses tab, so I can have multiple shipping options.

**Why this priority**: Critical for checkout experience - users need to manage their shipping addresses to have flexibility in where orders are delivered.

**Independent Test**: Can be fully tested by navigating to /profile, going to Addresses tab, adding a new address, verifying it appears in the list, and deleting an address, verifying it's removed. This adds value by enabling address management.

**Acceptance Scenarios**:

1. **Given** user is on profile addresses tab, **When** user adds a new address, **Then** address is saved to their account and appears in the address list
2. **Given** user has multiple addresses saved, **When** user deletes an address, **Then** address is removed from their account and no longer appears in the list

---

### User Story 3 - Change password (Priority: P1)

As an authenticated user, I want to securely change my account password from the /profile page account tab, so I can maintain account security.

**Why this priority**: Critical for security - users need to be able to update their password if they suspect compromise or want to refresh it.

**Independent Test**: Can be fully tested by navigating to /profile, going to Account tab, entering current password and new password, submitting form, and verifying success message appears. This adds value by enabling password security management.

**Acceptance Scenarios**:

1. **Given** user is on profile account tab, **When** user enters correct current password and valid new password, **Then** password is updated and success message is shown
2. **Given** user enters incorrect current password, **When** user submits form, **Then** error message is shown and password remains unchanged

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when user tries to view an order that doesn't belong to them?
- How does the system handle invalid or expired authentication when accessing protected pages?
- What happens when contact form submission fails due to network issues?
- How does pagination behave when there are fewer products than the page size?
- What happens when a user tries to delete their last saved address?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide an order detail page at /orders/[id] showing complete order information including items, quantities, prices, shipping address and status
- **FR-002**: System MUST allow authenticated users to add new shipping addresses to their profile via /profile addresses tab
- **FR-003**: System MUST allow authenticated users to delete saved shipping addresses from their profile via /profile addresses tab
- **FR-004**: System MUST allow authenticated users to securely change their account password via /profile account tab
- **FR-005**: System MUST provide a contact form page at /contact with name, email, and message fields
- **FR-006**: System MUST provide a static returns and exchanges policy page at /returns-exchanges
- **FR-007**: System MUST implement pagination on /products page showing 12 products per page with navigation controls
- **FR-008**: System MUST authenticate users via JWT token for accessing protected routes (order details, profile management)
- **FR-009**: System MUST validate current password when changing password to ensure security
- **FR-010**: System MUST show appropriate error messages when form submissions fail

### Key Entities *(include if feature involves data)*

- **Order**: Represents a user's purchase containing items list, quantities, prices, shipping address, status, and tracking information
- **Address**: Represents a user's shipping address with street, city, state, zip code, country, and optional label
- **Contact Form**: Represents user inquiry with name, email, and message fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view detailed information for any of their orders by clicking "View Details" button within 2 seconds
- **SC-002**: Users can successfully add, view, and delete shipping addresses from their profile with 95% success rate
- **SC-003**: Users can change their account password successfully with 95% success rate after entering correct current password
- **SC-004**: 90% of users can successfully submit contact form with appropriate confirmation message
- **SC-005**: Users can navigate through product catalog via pagination without page load times exceeding 3 seconds
- **SC-006**: 95% of users can access returns and exchanges policy information within 1 second of visiting the page

## Clarifications

### Session 2026-03-01

- Q: Should users be able to access orders that don't belong to them? → A: No, users can only access their own orders, and only their own orders appear on the /orders page
- Q: Should the password change form provide specific feedback about current password validity? → A: No, show generic error to avoid password enumeration attacks
- Q: What should happen to contact form submissions? → A: Store in database for potential follow-up
- Q: How should pagination controls behave when there are fewer products than page size? → A: Show pagination controls but disable next/previous buttons when at limits
- Q: How should address deletion work if it's the user's last saved address? → A: Allow deletion but validate at checkout that user has at least one address saved

### Functional Requirements Update

- **FR-011**: System MUST ensure users can only view and access orders that belong to their authenticated account
- **FR-012**: System MUST show generic error messages for password change failures to prevent password enumeration attacks
- **FR-013**: System MUST store contact form submissions in database for potential follow-up
- **FR-014**: System MUST show pagination controls but disable navigation buttons when at page limits
- **FR-015**: System MUST validate user has at least one address saved during checkout process
