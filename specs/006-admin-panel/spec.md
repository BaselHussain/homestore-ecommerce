# Feature Specification: Admin Panel

**Feature Branch**: `006-admin-panel`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "/sp.specify Spec 6 - Admin Panel

Core goal: Build a separate, secure, animated admin dashboard for Homestore e-commerce website using Next.js (admin routes), connected to the same Express.js backend and Neon DB.

Key requirements:
- Sidebar navigation with tabs: Dashboard, Products, Orders, Users, Categories, Coupons, Analytics, Settings
- Dashboard / Overview:
  - Total sales (today/week/month)
  - Total orders (pending/shipped/delivered/cancelled)
  - Total registered users
  - Low stock alerts (products < 5 stock)
  - Recent orders table (last 10)
- Products Management (CRUD):
  - List all products (table: name, price, stock, category, image thumbnail)
  - Add new product (form: name, description, price, stock, category, multiple images upload, variants JSON)
  - Edit product
  - Delete product (confirmation modal)
  - Search/filter products
- Orders Management:
  - All orders table (order ID, user email, total, status, date)
  - View order details (products, shipping address, payment status)
  - Change order status (pending → shipped → delivered → cancelled)
  - Refund simulation (mark as refunded)
- Users Management:
  - All users list (email, join date, total orders)
  - View user details (order history)
  - Ban/unban user (block from login/checkout)
- Analytics Section:
  - Charts/Graphs: Sales over time (line), Top products (bar), Order status (pie), User growth (line), Low stock (bar/table)
  - Use Recharts or Chart.js with shadcn/ui
- Invoices Section:
  - Generate daily/weekly/monthly invoices (PDF preview + download)
  - Invoice content: company name/logo, invoice number, date range, total revenue, tax (if any), order count, top products, simple order table
  - Use jsPDF or server-side PDF generation
  - Email simulation (console log or Nodemailer placeholder)
- Animations with Framer Motion:
  - Page reload/transition animations (fade-in, slide-up for content)
  - Scroll-triggered animations (fade-in cards/tables on scroll)
  - Sidebar collapse/expand animation
  - Button hover effects, modal open/close animation
  - Smooth loading states
- Use shadcn/ui for all UI (tables, cards, forms, modals, toasts, sidebar)
- Dark/light theme support
- Admin-only access (Better Auth role check: admin vs customer)

Constraints:
- Use existing backend from Spec 1 (add admin-only endpoints)
- No customer-facing UI changes here
- Responsive, professional admin look
- Simulated data if needed for charts/invoices

Success criteria:
- Admin login → sidebar shows all tabs
- Dashboard shows sales/orders/users stats + animated charts
- Products/Orders/Users CRUD works with smooth animations
- Page transitions and scroll animations feel modern (Framer Motion)
- Invoices generate PDF with correct data (daily/weekly/monthly)
- Non-admin users redirect to login/home

Use Context7 MCP for shadcn/ui admin dashboard, Recharts, Framer Motion page/scroll animations, jsPDF invoices, Better Auth role examples if needed.

Go."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Admin dashboard overview (Priority: P1)

As an authenticated admin user, I want to log in to the admin dashboard and see an overview of key business metrics including total sales, order status counts, registered users, and low stock alerts, so I can quickly understand the current state of the business.

**Why this priority**: Critical for admin workflow - provides immediate insight into business health and requires core authentication, data fetching, and visualization components that will be reused throughout the admin panel.

**Independent Test**: Can be fully tested by logging into the admin dashboard as an admin user and verifying that the dashboard page displays summary statistics for sales, orders, users, and low stock products. This provides immediate business value by giving admins a quick snapshot of operations.

**Acceptance Scenarios**:

1. **Given** admin user is authenticated and accesses the admin dashboard, **When** page loads, **Then** dashboard shows summary cards for total sales (today/week/month), total orders (by status), total registered users, and low stock alerts
2. **Given** there are recent orders in the system, **When** admin visits dashboard, **Then** dashboard shows table of recent orders (last 10) with basic information

---

### User Story 2 - Admin authentication and role management (Priority: P1)

As a system administrator, I want to ensure that only users with admin role can access the admin dashboard and its features, so that sensitive business data and operations remain secure.

**Why this priority**: Security is foundational - without proper authentication and authorization, no admin features should be accessible. This protects business data and prevents unauthorized operations.

**Independent Test**: Can be fully tested by attempting to access the admin dashboard with different user types (admin, regular user, unauthenticated) and verifying that only admin users can access the dashboard while others are redirected to login or home pages.

**Acceptance Scenarios**:

1. **Given** user has admin role, **When** they access admin routes, **Then** they are granted access to the dashboard and all admin features
2. **Given** user does not have admin role or is unauthenticated, **When** they access admin routes, **Then** they are redirected to login page or home page with appropriate error message

---

### User Story 3 - Products management (Priority: P2)

As an authenticated admin user, I want to manage the product catalog including viewing, adding, editing, and deleting products, so I can maintain accurate product information and inventory levels for the store.

**Why this priority**: Critical for inventory management - products are the core of the e-commerce business and admins need to maintain product data, prices, and stock levels.

**Independent Test**: Can be fully tested by navigating to the products management page in the admin dashboard and verifying that products can be listed, searched, added, edited, and deleted with appropriate UI feedback and data persistence.

**Acceptance Scenarios**:

1. **Given** admin is on products page, **When** they view the product list, **Then** they see a table with product name, price, stock, category, and image thumbnail
2. **Given** admin wants to add a new product, **When** they fill out the product form and submit, **Then** the new product is saved and appears in the product list
3. **Given** admin wants to edit an existing product, **When** they update the product information and save, **Then** the product is updated in the system

---

### User Story 4 - Orders management (Priority: P2)

As an authenticated admin user, I want to view and manage all orders in the system including changing order status and viewing order details, so I can track order fulfillment and resolve any issues.

**Why this priority**: Critical for order fulfillment workflow - admins need to track orders from pending to shipped/delivered and handle cancellations or refunds.

**Independent Test**: Can be fully tested by navigating to the orders management page and verifying that all orders are displayed in a table, order details can be viewed, and order status can be updated with appropriate system responses.

**Acceptance Scenarios**:

1. **Given** admin is on orders page, **When** they view the order list, **Then** they see a table with order ID, user email, total, status, and date
2. **Given** admin wants to update an order status, **When** they change the status from pending to shipped, **Then** the order status is updated in the system and reflected in the order list

---

### User Story 5 - Users management (Priority: P3)

As an authenticated admin user, I want to view and manage user accounts including viewing user details and managing user permissions, so I can maintain account security and handle user-related issues.

**Why this priority**: Important for user account management - admins need to view user information and handle special cases like account suspensions when necessary.

**Independent Test**: Can be fully tested by navigating to the users management page and verifying that users can be listed, user details can be viewed, and user permissions can be modified appropriately.

**Acceptance Scenarios**:

1. **Given** admin is on users page, **When** they view the user list, **Then** they see a table with user email, join date, and total orders
2. **Given** admin wants to view detailed user information, **When** they select a user, **Then** they can see user details and order history

---

### User Story 6 - Analytics and reporting (Priority: P3)

As an authenticated admin user, I want to view visual analytics and reports about sales trends, top products, and business metrics, so I can make informed business decisions and identify areas for improvement.

**Why this priority**: Valuable for business insights - provides data visualization that helps admins understand trends and performance patterns.

**Independent Test**: Can be fully tested by navigating to the analytics section and verifying that various charts and graphs render correctly with accurate data about sales, products, and user growth.

**Acceptance Scenarios**:

1. **Given** admin is on analytics page, **When** page loads, **Then** various charts display showing sales over time, top products, order status distribution, and user growth
2. **Given** there is sufficient data in the system, **When** admin views analytics, **Then** charts accurately reflect the underlying business data

---

### User Story 7 - Invoices generation (Priority: P4)

As an authenticated admin user, I want to generate and download invoices for business reporting and tax purposes, so I can maintain proper financial records and meet compliance requirements.

**Why this priority**: Important for financial operations - provides official documentation for business transactions that may be needed for accounting and legal purposes.

**Independent Test**: Can be fully tested by navigating to the invoices section and verifying that invoices can be generated for different time periods with correct data and downloaded in PDF format.

**Acceptance Scenarios**:

1. **Given** admin is on invoices page, **When** they generate an invoice for a time period, **Then** a PDF invoice is created with company information, order totals, and product details
2. **Given** an invoice is generated, **When** admin downloads it, **Then** a properly formatted PDF file is downloaded to their device

---

### User Story 8 - Admin UI and user experience (Priority: P4)

As an authenticated admin user, I want a responsive, animated, and professional admin interface with dark/light theme support, so I can efficiently manage the business with a modern and visually appealing experience.

**Why this priority**: Enhances admin productivity and user experience - smooth animations and professional UI make the admin panel more pleasant to use for extended periods.

**Independent Test**: Can be fully tested by navigating through the admin dashboard and verifying that page transitions, sidebar animations, and UI interactions work smoothly with appropriate loading states and visual feedback.

**Acceptance Scenarios**:

1. **Given** admin is using the dashboard, **When** they navigate between sections, **Then** page transitions include smooth animations and loading states
2. **Given** admin is on any admin page, **When** they interact with UI elements, **Then** animations provide appropriate feedback and the interface supports both dark and light themes

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when admin tries to delete a product that is currently in active orders?
- How does the system handle admin session timeout during long operations?
- What happens when admin tries to change order status to an invalid transition (e.g., shipped → pending)?
- How does the system handle large datasets in analytics charts or product listings?
- What happens when invoice generation fails due to system resources or data issues?
- How does the system handle concurrent admin users making changes to the same data?
- What happens when admin tries to ban a user that doesn't exist or is already banned?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST authenticate users via single admin role with full access to ensure only authorized users can access admin dashboard
- **FR-002**: System MUST provide a dashboard view showing summary statistics for sales (today/week/month), orders by status, registered users, and low stock alerts
- **FR-003**: System MUST allow admin users to view, search, and filter the complete product catalog with pagination
- **FR-004**: System MUST allow admin users to add new products with name, description, price, stock, category, images, and variants
- **FR-005**: System MUST allow admin users to edit existing product information and update inventory levels
- **FR-006**: System MUST provide confirmation dialogs before destructive actions like product deletion
- **FR-007**: System MUST allow admin users to view all orders in a sortable and filterable table format
- **FR-008**: System MUST allow admin users to update order status following logical business rules (e.g., pending → shipped → delivered, with restrictions on illogical transitions like delivered → shipped or cancelled → pending)
- **FR-009**: System MUST allow admin users to view detailed order information including products, shipping address, and payment status
- **FR-010**: System MUST allow admin users to view all registered users with their account information and order history
- **FR-011**: System MUST provide functionality to ban/unban users from accessing the system
- **FR-012**: System MUST provide various data visualization charts (line, bar, pie) for sales, products, and user metrics
- **FR-013**: System MUST generate PDF invoices for specified time periods (daily/weekly/monthly) with business information
- **FR-014**: System MUST provide smooth page transitions and scroll-triggered animations using Framer Motion
- **FR-015**: System MUST support both dark and light theme modes with automatic system preference detection
- **FR-016**: System MUST provide responsive design that works on desktop, tablet, and mobile devices
- **FR-017**: System MUST implement proper error handling and user feedback throughout the admin interface
- **FR-024**: System MUST maintain admin sessions for 8 hours before requiring re-authentication to balance security with usability for extended admin tasks
- **FR-018**: System MUST validate all admin inputs and provide appropriate error messages
- **FR-019**: System MUST maintain audit logs of critical admin actions (deletions, status changes, user bans)
- **FR-020**: System MUST ensure data consistency when multiple admins perform concurrent operations

*Example of marking unclear requirements:*

- **FR-021**: System MUST handle file uploads for product images with maximum file size of 10MB and support for JPG, PNG, and WebP formats, limited to 5 images per product
- **FR-022**: System MUST generate invoices with standard business information (company name, address, contact) and basic totals with manual tax entry option for admin to specify tax percentage or fixed amount
- **FR-023**: System MUST provide user banning functionality that prevents banned users from logging in and placing orders

### Key Entities *(include if feature involves data)*

- **Admin Dashboard**: Represents the main overview page showing business metrics including sales totals, order counts, user registrations, and low stock alerts
- **Product**: Represents an item in the store catalog with attributes like name, description, price, stock level, category, images, and variants
- **Order**: Represents a customer purchase with items, shipping address, status, payment information, and timeline
- **User**: Represents a registered customer with account information, order history, and access permissions
- **Analytics Data**: Represents business metrics and trends used for visualization in charts and reports
- **Invoice**: Represents a financial document containing business information, order details, totals, and tax calculations for specific time periods

## Clarifications

### Session 2026-03-03

- Q: Should there be different levels of admin access (e.g., super admin vs product manager vs order manager), or is it a single "admin" role with full access? → A: Single admin role with full access
- Q: Should invoices include automatic tax calculation, manual tax entry, or just be prepped to support tax in the future? → A: Manual tax entry - admin can optionally add tax percentage or fixed amount when generating invoices
- Q: What should be the default session timeout duration for admin users? → A: 8-hour session timeout - Long enough for extended admin work sessions but secure
- Q: Should the system enforce specific business rules on order status transitions? → A: Enforce logical status transitions only - Prevent illogical transitions like delivery reversal for security and data integrity
- Q: Should there be a limit on the total number of images per product? → A: Limit of 5 images per product - Good balance of product showcase and performance

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Admin users can access the dashboard and view key metrics within 3 seconds of login with 95% success rate
- **SC-002**: Admin users can complete product CRUD operations (add/edit/delete) with 90% success rate and receive appropriate confirmation feedback
- **SC-003**: Admin users can update order statuses and view order details with 95% accuracy and within 2 seconds per operation
- **SC-004**: Admin users can view user information and manage user accounts with 90% task completion rate
- **SC-005**: Analytics charts render and display accurate data within 2 seconds with 95% of charts showing correct information
- **SC-006**: Invoice generation completes successfully for 90% of attempts with properly formatted PDF output
- **SC-007**: Non-admin users are denied access to admin routes 100% of the time and redirected appropriately
- **SC-008**: Admin users report 80% satisfaction with UI responsiveness and animation smoothness in user experience surveys
