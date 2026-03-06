# Research Summary: Admin Panel

## Technology Decisions

### Charts: Recharts vs Chart.js
**Decision**: Recharts
**Rationale**: Better integration with React and Framer Motion animations, simpler API for the chart types needed (line, bar, pie), better TypeScript support
**Alternatives considered**: Chart.js with React wrapper, D3.js, Nivo

### PDF Generation: jsPDF vs pdfkit
**Decision**: jsPDF
**Rationale**: Client-side PDF generation fits the requirement (frontend generation), simpler implementation for invoice format, good browser compatibility
**Alternatives considered**: pdfkit (server-side), react-pdf, HTML to PDF libraries

### Sidebar: shadcn/ui vs Custom
**Decision**: shadcn/ui with Framer Motion animations
**Rationale**: Consistent with project's use of shadcn/ui components, leverages existing styling, easy to animate with Framer Motion
**Alternatives considered**: Custom implementation, Radix UI, Headless UI

### Role Check: Middleware vs Wrapper Component
**Decision**: Wrapper component approach
**Rationale**: Provides more flexibility for handling admin authentication, easier to integrate with existing Better Auth implementation, allows for better error handling
**Alternatives considered**: Next.js middleware, API route protection

## Admin-Specific Implementation Details

### Admin Authentication & Authorization
- Leverage Better Auth for role-based access control
- Implement admin role check in wrapper component
- 8-hour session timeout as specified in requirements
- Redirect non-admin users to login page

### Dashboard Components
- Summary cards for sales metrics (today/week/month)
- Order status counts (pending/shipped/delivered/cancelled)
- User registration counts
- Low stock alerts (products < 5 stock)
- Recent orders table (last 10 orders)

### Products Management Features
- CRUD operations for products
- Table with name, price, stock, category, thumbnail
- Search and filter capabilities
- Add/edit forms with validation
- 5 image limit per product with 10MB max size
- Confirmation modal for deletions

### Orders Management Features
- Table with order ID, user email, total, status, date
- Order status updates (following logical transitions only)
- Order details view (products, shipping address, payment status)
- Refund simulation capability

### Users Management Features
- Table with email, join date, total orders
- User details view (order history)
- Ban/unban functionality (prevents login/checkout)

### Analytics Implementation
- Sales over time (line chart)
- Top products (bar chart)
- Order status (pie chart)
- User growth (line chart)
- Low stock visualization (bar/table)

### Invoices Generation
- Date range selector (daily/weekly/monthly)
- PDF generation with company information
- Manual tax entry capability
- Preview and download functionality
- Email simulation (console log placeholder)

### Animation Strategy
- Page transitions: fade-in/slide-up on load
- Scroll-triggered: fade-in cards/tables when in view
- Sidebar: smooth collapse/expand
- Buttons/modals: hover scale, open/close animation
- Loading states: smooth transitions

### Performance Considerations
- Pagination for large product/order lists
- Memoization for expensive components
- Lazy loading for charts and tables
- Throttling for scroll-triggered animations
- Efficient data fetching with caching