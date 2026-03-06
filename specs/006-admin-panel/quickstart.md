# Quickstart Guide: Admin Panel

## Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- Existing Homestore e-commerce project setup (backend running with Better Auth)

## Setup Instructions

### 1. Install Required Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install admin panel specific dependencies
npm install framer-motion recharts jspdf @types/jspdf
```

### 2. Create Admin Folder Structure
```bash
# Create admin directory structure
mkdir -p frontend/admin
mkdir -p frontend/admin/{products,orders,users,analytics,invoices}
mkdir -p frontend/components/admin
mkdir -p frontend/components/admin/Charts
mkdir -p frontend/lib
mkdir -p frontend/contexts
```

### 3. Backend API Endpoints
Add the following admin-only API endpoints to your existing backend:

```javascript
// backend/src/routes/admin.js
// (This will be implemented during the task phase)
```

### 4. Run the Application
```bash
# Start the frontend development server
npm run dev

# Or if using the existing project setup:
cd frontend
npm run dev
```

## Admin Panel Access

1. Ensure you have an admin user account created (with admin role)
2. Navigate to `http://localhost:3000/admin` (or your deployment URL)
3. Login with your admin credentials
4. The admin dashboard will load with animated transitions

## Key Features Overview

### Dashboard
- View summary statistics (sales, orders, users, low stock)
- See recent orders table
- Access all admin sections via sidebar

### Products Management
- View all products in a searchable table
- Add new products with images and variants
- Edit existing product information
- Delete products with confirmation

### Orders Management
- View all orders with status, customer, and totals
- Update order status (pending → shipped → delivered)
- View order details including items and shipping address

### Users Management
- View all registered users
- See user order history
- Ban/unban users to prevent login/checkout

### Analytics
- View sales trends over time
- See top products by sales
- Track order status distribution
- Monitor user growth

### Invoices
- Generate daily, weekly, or monthly invoices
- Download PDF invoices
- Manual tax entry capability

## Animation Features
- Page transitions with fade-in/slide-up effects
- Scroll-triggered animations for cards and tables
- Smooth sidebar collapse/expand
- Animated buttons and modal interactions
- Loading state transitions

## Admin Security
- Role-based access control (admin only)
- 8-hour session timeout
- Automatic redirect for non-admin users
- Audit logging for critical actions