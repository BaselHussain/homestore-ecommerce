# Quickstart Guide: Store Gaps Fixes

## Overview
Implementation guide for the 005-store-gaps feature which addresses remaining gaps in the Homestore e-commerce application: order detail page, profile page completeness, contact page, returns/exchanges page, and products pagination.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Running Neon PostgreSQL database (with existing schema)
- Backend server running on http://localhost:5000
- Frontend development server running on http://localhost:3000

## Setup Commands

### 1. Start Backend Server
```bash
cd backend
npm install
npx prisma db push
npm start
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```

## Implementation Steps

### 1. Order Detail Page (`/orders/[id]`)

**Files to create:**
- `frontend/app/orders/[id]/page.tsx`

**Key Implementation Points:**
- Create dynamic route using `[id]` folder pattern
- Use `useAuth()` hook to protect route
- Fetch order using backend API: `GET /api/users/orders/:id`
- Display order details: items, quantities, prices, shipping address, status, tracking
- Follow existing UI patterns (LightSheenButton, AnimatedElement, card/border/rounded-xl)

### 2. Profile Page Address Management

**Files to update:**
- `frontend/app/profile/page.tsx` (if needed)
- `frontend/components/profile/AddressesTab.tsx` (or existing addresses section)

**Key Implementation Points:**
- Connect existing UI to `userApi.addAddress()` and `userApi.deleteAddress()`
- Handle API responses with success/error notifications using sonner
- Follow existing form patterns and validation
- Ensure address list refreshes after add/delete operations

### 3. Profile Page Password Change

**Files to update:**
- `frontend/app/profile/page.tsx` (if needed)
- `frontend/components/profile/PasswordTab.tsx` (or existing password section)

**Key Implementation Points:**
- Connect existing UI to `userApi.updatePassword()`
- Validate current password before allowing change
- Show generic error messages to prevent password enumeration
- Show success notification on completion

### 4. Contact Page (`/contact`)

**Files to create:**
- `frontend/app/contact/page.tsx`
- `backend/src/routes/contact.ts` (new route file)

**Key Implementation Points:**
- Create static page with contact form (name, email, message)
- Submit form to backend API: `POST /api/contact`
- Backend stores submission in database without sending email
- Show confirmation feedback to user

### 5. Returns & Exchanges Page (`/returns-exchanges`)

**Files to create:**
- `frontend/app/returns-exchanges/page.tsx`

**Key Implementation Points:**
- Create static informational page
- Follow existing design patterns (font-display headings, card/border/rounded-xl)
- Include return policy, exchange process, and how to initiate return

### 6. Products Pagination

**Files to update:**
- `frontend/app/products/page.tsx` (server component)
- `frontend/app/products/ProductsClientPage.tsx` (client component)

**Key Implementation Points:**
- Add pagination controls (prev/next buttons)
- Modify API calls to include page and limit parameters: `?page=1&limit=12`
- Update URL to reflect current page
- Follow existing UI patterns for consistency

## API Endpoints

### New Endpoints
- `GET /api/users/orders/:id` - Retrieve specific order details
- `POST /api/contact` - Submit contact form data

### Existing Endpoints Used
- `GET /api/users/orders` - List user orders
- `POST /api/users/addresses` - Add new address
- `DELETE /api/users/addresses/:id` - Delete address
- `PUT /api/users/password` - Update user password

## Testing

### Manual Testing Steps:
1. **Order Details:**
   - Log in as authenticated user
   - Go to `/orders` page
   - Click "View Details" on an order
   - Verify all order details are displayed correctly

2. **Address Management:**
   - Go to `/profile` page
   - Navigate to Addresses tab
   - Add a new address, verify it appears in list
   - Delete an address, verify it's removed

3. **Password Change:**
   - Go to `/profile` page
   - Navigate to Account tab
   - Enter current password and new password
   - Verify success message appears

4. **Contact Page:**
   - Go to `/contact` page
   - Fill out form and submit
   - Verify confirmation feedback

5. **Pagination:**
   - Go to `/products` page
   - Use pagination controls
   - Verify correct products load for each page

## Key Dependencies

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui, sonner
- **Backend**: Express.js, Prisma, Neon PostgreSQL
- **Auth**: JWT tokens, `useAuth()` hook from `frontend/contexts/AuthContext`
- **API**: `userApi` functions from `frontend/lib/api.ts`