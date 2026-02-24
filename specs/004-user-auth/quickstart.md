# Quickstart: Authentication & User Experience

## Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- Better Auth compatible environment

## Setup Authentication System

### 1. Install Dependencies
```bash
npm install @better-auth/react @better-auth/node @hookform/resolvers zod sonner react-hook-form
```

### 2. Initialize Better Auth Provider
Create `frontend/components/AuthProvider.tsx` with Better Auth context provider

### 3. Implement Protected Routes
Create `frontend/components/ProtectedRoute.tsx` that checks for valid authentication tokens

### 4. Create Auth Pages
- `frontend/app/login/page.tsx` - Login form with email/password
- `frontend/app/signup/page.tsx` - Registration form with validation
- `frontend/app/profile/page.tsx` - User dashboard

### 5. Update Existing Pages
Wrap cart, checkout, wishlist, and profile pages with ProtectedRoute component

## Environment Variables
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

## API Integration
- Update `frontend/lib/api.ts` to include JWT token in requests
- Implement token refresh mechanism for expired sessions
- Add logout functionality that clears tokens

## Testing the Implementation
1. Start the development server: `npm run dev`
2. Navigate to `/signup` to create a new account
3. Verify your email address (if required)
4. Log in at `/login`
5. Access protected routes like `/profile` to verify protection works
6. Test guest checkout flow on the cart page
7. Verify secure password reset functionality

## Key Components
- Auth context for global authentication state
- Form validation using React Hook Form and Zod
- Toast notifications for auth events
- Token storage and management utilities