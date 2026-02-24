---
name: better-auth-jwt
description: Implement JWT-based authentication with Express.js backend and Next.js frontend. Covers signup (with name), login (remember me), logout, password reset, user profile, address management, and guest checkout. Uses Prisma ORM with PostgreSQL (Neon). Adapted for homestore e-commerce spec.
---

# Better Auth JWT Authentication Skill (Homestore Edition)

Comprehensive JWT authentication for Express.js + Next.js with Prisma + NeonDB. Implements all auth requirements from `specs/004-user-auth/spec.md`.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────┐  POST /api/auth/signup   ┌─────────────┐            │
│  │  Frontend   │ ──────────────────────► │   Backend   │            │
│  │  (Next.js)  │                          │ (Express.js)│            │
│  │             │ ◄────────────────────── │             │            │
│  │             │  { token, user }         │             │            │
│  └──────┬──────┘                          └──────┬──────┘            │
│         │                                        │                    │
│         │ localStorage/sessionStorage (rememberMe)│ bcrypt + JWT      │
│         │                                        │ Prisma + Neon     │
│         ▼                                        ▼                    │
│  ┌─────────────┐  Authorization: Bearer   ┌─────────────┐            │
│  │ AuthContext │ ──────────────────────► │ authenticate │           │
│  │  Provider   │  GET /api/users/profile  │ middleware   │           │
│  └─────────────┘                          └─────────────┘            │
└──────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16+ (App Router) | React Context, protected routes |
| Backend | Express.js | REST API with Zod validation |
| Database | NeonDB (PostgreSQL) | via Prisma ORM |
| ORM | Prisma | Type-safe queries & schema |
| Password | bcryptjs | Secure password hashing (cost 12) |
| Token | jsonwebtoken | JWT creation and validation |
| Rate Limiting | express-rate-limit | Auth endpoint protection |
| Forms | react-hook-form + zod | Validated auth forms |
| Notifications | sonner | Toast notifications |

## Security Spec (from spec.md clarifications)

- **Password**: min 8 chars, uppercase, lowercase, number, special char
- **Rate limit**: 5 attempts per 15 minutes per IP (NOT 1 minute)
- **Errors**: Generic "Invalid credentials" — never reveal if email exists
- **Remember me**: `localStorage` (persistent) vs `sessionStorage` (session-only)
- **Token expiry**: 24h normal, 30 days with "remember me"
- **Email verification**: Simulated (no real SMTP needed for MVP)
- **Password reset**: Time-limited tokens (1 hour), stored in DB

---

## Backend Implementation

### 1. Environment Variables

```bash
# .env (add to existing)
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-chars
JWT_EXPIRES_IN=24h
JWT_REMEMBER_EXPIRES_IN=30d
```

```bash
# .env.example (add to existing)
JWT_SECRET=change-this-to-a-256-bit-random-secret
JWT_EXPIRES_IN=24h
JWT_REMEMBER_EXPIRES_IN=30d
```

### 2. Prisma Schema (update backend/prisma/schema.prisma)

```prisma
// Add fields to existing User model
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  password_hash  String
  name           String    @default("")
  email_verified Boolean   @default(false)
  last_login_at  DateTime?
  created_at     DateTime  @default(now())

  cart               Cart[]
  wishlist           Wishlist[]
  orders             Order[]
  addresses          Address[]
  password_reset_tokens PasswordResetToken[]

  @@map("users")
}

// Add guest_email to Order (make user_id optional for guest checkout)
model Order {
  id               String   @id @default(cuid())
  user_id          String?  @map("userId")   // nullable for guest orders
  guest_email      String?  @map("guestEmail")
  total_amount     Decimal  @db.Decimal(10, 2) @map("totalAmount")
  status           String   @default("pending")
  tracking_number  String?  @map("trackingNumber")
  shipping_address Json     @map("shippingAddress")
  items            Json
  created_at       DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@map("orders")
}

// New: Address model
model Address {
  id         String   @id @default(cuid())
  user_id    String   @map("userId")
  label      String   @default("Home")
  street     String
  city       String
  state      String
  zip_code   String   @map("zipCode")
  country    String   @default("US")
  is_default Boolean  @default(false) @map("isDefault")
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("addresses")
}

// New: Password reset tokens
model PasswordResetToken {
  id         String   @id @default(cuid())
  user_id    String   @map("userId")
  token      String   @unique
  expires_at DateTime @map("expiresAt")
  used       Boolean  @default(false)
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}
```

### 3. Security Module (JWT + bcrypt)

```typescript
// src/lib/security.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable must be set');

export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

export const createAccessToken = (userId: string, email: string, rememberMe = false): string => {
  const expiresIn = rememberMe
    ? (process.env.JWT_REMEMBER_EXPIRES_IN || '30d')
    : (process.env.JWT_EXPIRES_IN || '24h');

  return jwt.sign({ sub: userId, email }, JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn,
  } as jwt.SignOptions);
};

export type DecodeResult =
  | { payload: JwtPayload; error: null }
  | { payload: null; error: 'expired-token' | 'invalid-signature' | 'malformed-token' | 'invalid-token' };

export const decodeAccessToken = (token: string): DecodeResult => {
  try {
    const payload = jwt.verify(token, JWT_SECRET!, { algorithms: ['HS256'] }) as JwtPayload;
    return { payload, error: null };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') return { payload: null, error: 'expired-token' };
    if (err.name === 'JsonWebTokenError') {
      const msg = err.message?.toLowerCase() ?? '';
      if (msg.includes('signature')) return { payload: null, error: 'invalid-signature' };
      return { payload: null, error: 'malformed-token' };
    }
    return { payload: null, error: 'invalid-token' };
  }
};

export const hashPassword = async (plain: string): Promise<string> => bcrypt.hash(plain, 12);

export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);

export const generateResetToken = (): string => crypto.randomBytes(32).toString('hex');

export const validatePasswordStrength = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (password.length > 128) return { valid: false, message: 'Password must not exceed 128 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password))
    return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true, message: '' };
};
```

### 4. Auth Middleware

```typescript
// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { decodeAccessToken } from '../lib/security';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, error: 'Authorization header required' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
    res.status(401).json({ success: false, error: 'Invalid authorization format. Use: Bearer <token>' });
    return;
  }

  const { payload, error } = decodeAccessToken(parts[1]!);

  if (!payload) {
    res.status(401).json({ success: false, error: error === 'expired-token' ? 'Token expired' : 'Invalid token' });
    return;
  }

  req.userId = payload.sub;
  req.userEmail = payload.email;
  next();
};
```

### 5. Auth Routes

```typescript
// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { createAccessToken, hashPassword, verifyPassword, generateResetToken, validatePasswordStrength } from '../lib/security';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

// Rate limiter: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, error: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  name: z.string().min(1, 'Name is required').max(100),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const parsed = SignupSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    res.status(400).json({ success: false, error: firstError?.message || 'Invalid input' });
    return;
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const { valid, message } = validatePasswordStrength(password);
  if (!valid) {
    res.status(400).json({ success: false, error: message });
    return;
  }

  // Check if email exists (generic error to prevent enumeration)
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    // Return success to prevent email enumeration
    res.status(201).json({ success: true, message: 'Verification email sent' });
    return;
  }

  const password_hash = await hashPassword(password);
  await prisma.user.create({
    data: { email: normalizedEmail, password_hash, name, email_verified: false },
  });

  // In production: send verification email here
  // For MVP: auto-verify (or skip verification step)
  res.status(201).json({ success: true, message: 'Verification email sent' });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message || 'Invalid input' });
    return;
  }

  const { email, password, rememberMe } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Generic error — never reveal if email exists
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  const passwordValid = await verifyPassword(password, user.password_hash);
  if (!passwordValid) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  // Update last login
  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });

  const token = createAccessToken(user.id, user.email, rememberMe);

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// POST /api/auth/logout (authenticated)
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  // JWT is stateless — client should discard the token
  // In production: add token to a blocklist
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Always respond success to prevent email enumeration
  const successResponse = { success: true, message: 'Password reset email sent if account exists' };

  if (!user) {
    res.json(successResponse);
    return;
  }

  // Invalidate any existing unused tokens
  await prisma.passwordResetToken.updateMany({
    where: { user_id: user.id, used: false },
    data: { used: true },
  });

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { user_id: user.id, token, expires_at: expiresAt },
  });

  // In production: send email with reset link containing token
  // e.g., `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  console.log(`[AUTH] Password reset token for ${normalizedEmail}: ${token}`);

  res.json(successResponse);
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, error: 'Token and new password are required' });
    return;
  }

  const { valid, message } = validatePasswordStrength(newPassword);
  if (!valid) {
    res.status(400).json({ success: false, error: message });
    return;
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken || resetToken.used || resetToken.expires_at < new Date()) {
    res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    return;
  }

  const password_hash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.user_id }, data: { password_hash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
  ]);

  res.json({ success: true, message: 'Password reset successfully' });
});

export default router;
```

### 6. Users Routes

```typescript
// src/routes/users.ts
import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/security';
import prisma from '../lib/prisma';
import { z } from 'zod';

const router = Router();
router.use(authenticate); // All user routes require auth

// GET /api/users/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { addresses: true },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      addresses: user.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        street: a.street,
        city: a.city,
        state: a.state,
        zipCode: a.zip_code,
        country: a.country,
        isDefault: a.is_default,
      })),
    },
  });
});

// PUT /api/users/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  const UpdateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email().optional(),
  });

  const parsed = UpdateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
    return;
  }

  const { name, email } = parsed.data;
  const updateData: { name?: string; email?: string } = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email.toLowerCase().trim();

  const updated = await prisma.user.update({ where: { id: req.userId }, data: updateData });

  res.json({
    success: true,
    user: { id: updated.id, email: updated.email, name: updated.name },
  });
});

// GET /api/users/orders
router.get('/orders', async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { user_id: req.userId },
    orderBy: { created_at: 'desc' },
  });

  res.json({
    success: true,
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total_amount),
      currency: 'USD',
      createdAt: o.created_at.toISOString(),
      trackingNumber: o.tracking_number || null,
      items: o.items,
      shippingAddress: o.shipping_address,
    })),
  });
});

// POST /api/users/addresses
router.post('/addresses', async (req: AuthRequest, res: Response) => {
  const AddressSchema = z.object({
    label: z.string().default('Home'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().default('US'),
    isDefault: z.boolean().default(false),
  });

  const parsed = AddressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0]?.message });
    return;
  }

  const { label, street, city, state, zipCode, country, isDefault } = parsed.data;

  // If new address is default, unset others
  if (isDefault) {
    await prisma.address.updateMany({
      where: { user_id: req.userId },
      data: { is_default: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      user_id: req.userId!,
      label, street, city, state,
      zip_code: zipCode,
      country,
      is_default: isDefault,
    },
  });

  res.status(201).json({
    success: true,
    address: {
      id: address.id,
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country,
      isDefault: address.is_default,
    },
  });
});

export default router;
```

### 7. Update server.ts

```typescript
// Add to existing backend/src/server.ts
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// In app.use() section, add:
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```

### 8. Update .env

```bash
# Add to backend/.env
JWT_SECRET=change-this-to-a-256-bit-random-secret-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REMEMBER_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:3000
```

### 9. Install Backend Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## Frontend Implementation

### 1. Environment Variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 2. Auth Utilities (lib/auth.ts)

```typescript
// frontend/lib/auth.ts
export interface StoredUser {
  id: string;
  email: string;
  name: string;
}

// Storage key constants
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'auth_user';
const STORAGE_TYPE_KEY = 'auth_storage'; // 'local' | 'session'

const getStorage = (): Storage => {
  if (typeof window === 'undefined') return null as any;
  const type = localStorage.getItem(STORAGE_TYPE_KEY);
  return type === 'session' ? sessionStorage : localStorage;
};

export const setAuthData = (token: string, user: StoredUser, rememberMe: boolean): void => {
  const storage = rememberMe ? localStorage : sessionStorage;
  // Always track which storage is active
  localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getStorage()?.getItem(TOKEN_KEY) ?? null;
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = getStorage()?.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STORAGE_TYPE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export interface JwtPayload {
  sub: string;
  email: string;
  exp?: number;
  iat?: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]!;
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token ? !isTokenExpired(token) : false;
};
```

### 3. API Client (lib/api.ts)

```typescript
// frontend/lib/api.ts
import { getToken, clearAuthData } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return response;
};
```

### 4. Auth Context (contexts/AuthContext.tsx)

```tsx
// frontend/contexts/AuthContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthData, getToken, getStoredUser, clearAuthData, isAuthenticated as checkAuth, StoredUser } from '@/lib/auth';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<StoredUser>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from storage on mount
  useEffect(() => {
    const token = getToken();
    if (token && checkAuth()) {
      const storedUser = getStoredUser();
      if (storedUser) setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const response = await apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await response.json();
    const userData: StoredUser = { id: data.user.id, email: data.user.email, name: data.user.name };

    setAuthData(data.token, userData, rememberMe);
    setUser(userData);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const response = await apiClient('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Signup failed');
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    if (token) {
      // Fire-and-forget logout to backend
      apiClient('/api/auth/logout', { method: 'POST' }).catch(() => {});
    }
    clearAuthData();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<StoredUser>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

### 5. AuthProvider Wrapper (components/AuthProvider.tsx)

```tsx
// frontend/components/AuthProvider.tsx
// Re-export from context for convenience
export { AuthProvider, useAuth } from '@/contexts/AuthContext';
```

### 6. ProtectedRoute Component

```tsx
// frontend/components/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Preserve intended destination
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        router.push(`${redirectTo}?redirect=${encodeURIComponent(path)}`);
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

### 7. Zod Schemas for Forms (lib/validations/auth.ts)

Note: This project uses Zod v4. Use `z.string().nonempty()` is deprecated; use `.min(1)` instead.

```typescript
// frontend/lib/validations/auth.ts
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, 'Must contain at least one special character');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
```

### 8. Login Page

```tsx
// frontend/app/login/page.tsx
'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, LoginValues } from '@/lib/validations/auth';

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      toast.success('Welcome back!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-wider text-foreground uppercase">
            HomeStore
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">Sign in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register('rememberMe')}
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
```

### 9. Signup Page

```tsx
// frontend/app/signup/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { signupSchema, SignupValues } from '@/lib/validations/auth';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(p) },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup, login } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupValues) => {
    try {
      await signup(data.email, data.password, data.name);
      // Auto-login after signup
      await login(data.email, data.password, false);
      toast.success('Account created! Welcome to HomeStore.');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-wider text-foreground uppercase">
            HomeStore
          </Link>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                {...register('name')}
                id="name"
                type="text"
                autoComplete="name"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="Jane Smith"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className={`flex items-center gap-1.5 text-xs ${req.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <Check className="w-3 h-3" />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 10. Forgot Password Page

```tsx
// frontend/app/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validations/auth';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });

    if (!response.ok) {
      toast.error('Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-wider text-foreground uppercase">HomeStore</Link>
          <h1 className="mt-6 text-2xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">We&apos;ll send you a link to reset your password.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 11. Update Layout (add AuthProvider)

```tsx
// frontend/app/layout.tsx — wrap with AuthProvider
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner'; // use sonner for all auth toasts

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="...">
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 12. Wrap Protected Pages

```tsx
// frontend/app/cart/page.tsx — add ProtectedRoute wrapper
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CartPage() {
  return (
    <ProtectedRoute>
      {/* existing cart content */}
    </ProtectedRoute>
  );
}

// Same pattern for: app/checkout/page.tsx, app/wishlist/page.tsx, app/profile/page.tsx
```

### 13. Update Header (auth-aware)

```tsx
// In components/Header.tsx — add user menu
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

// Inside Header component:
const { user, isAuthenticated, logout } = useAuth();

// In the icons section, add before cart icon:
{isAuthenticated ? (
  <div className="relative group hidden md:flex">
    <button className="p-2 hover:text-primary transition-colors" aria-label="Account">
      <User className="w-5 h-5" />
    </button>
    <div className="absolute top-full right-0 w-48 mt-2 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <div className="p-1">
        <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground rounded-md hover:bg-accent transition-colors">
          <User className="w-4 h-4" /> My Profile
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  </div>
) : (
  <Link href="/login" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors p-2">
    <User className="w-5 h-5" /> Sign in
  </Link>
)}
```

---

## Required Backend Dependencies

```bash
npm install bcryptjs jsonwebtoken express-rate-limit
npm install -D @types/bcryptjs @types/jsonwebtoken
```

## File Structure

```
backend/src/
├── lib/
│   ├── prisma.ts           # Existing Prisma client
│   └── security.ts         # NEW: JWT + bcrypt + password utilities
├── middlewares/
│   ├── errorHandler.ts     # Existing
│   └── auth.ts             # NEW: Bearer token authentication middleware
├── routes/
│   ├── auth.ts             # NEW: signup, login, logout, forgot/reset password
│   ├── users.ts            # NEW: profile, orders, addresses
│   └── ...                 # Existing routes
└── server.ts               # Updated: register new routes

frontend/
├── app/
│   ├── login/page.tsx      # NEW
│   ├── signup/page.tsx     # NEW
│   ├── forgot-password/page.tsx  # NEW
│   ├── profile/page.tsx    # NEW (US2)
│   └── checkout/confirmation/page.tsx  # NEW (US3)
├── contexts/
│   └── AuthContext.tsx     # NEW: auth state management
├── components/
│   ├── AuthProvider.tsx    # NEW: re-export wrapper
│   ├── ProtectedRoute.tsx  # NEW: redirect if not authenticated
│   └── Header.tsx          # UPDATED: auth-aware user menu
├── lib/
│   ├── auth.ts             # NEW: token storage utilities
│   ├── api.ts              # NEW: authenticated fetch client
│   └── validations/
│       └── auth.ts         # NEW: Zod schemas for all auth forms
└── app/layout.tsx          # UPDATED: wrap with AuthProvider + Sonner
```

## Prisma Migration Commands

```bash
cd backend

# After updating schema.prisma:
npx prisma migrate dev --name add-auth-fields
# OR for development (direct push without migration history):
npx prisma db push

# Regenerate Prisma client:
npx prisma generate
```

## Notes & Gotchas

1. **Zod v4**: This project uses `zod@4.x`. The `zodResolver` from `@hookform/resolvers/zod` works with Zod v4. No API changes needed for basic schemas.
2. **Prisma vs Drizzle**: The skill originally used Drizzle — this project uses Prisma. All DB operations use `prisma` client from `./lib/prisma`.
3. **Rate Limiter**: Spec requires 15-minute window (not 1 minute). Always use `windowMs: 15 * 60 * 1000`.
4. **Order model**: Changed `user_id` from required to optional (`String?`) to support guest checkout (US3).
5. **Sonner**: Use `sonner` (already installed) not `@radix-ui/react-toast` for auth notifications.
6. **useSearchParams**: Must wrap in `<Suspense>` in Next.js App Router (done in Login page).
7. **Email verification**: For MVP, skip actual email sending. Users are auto-verified on signup. Log reset tokens to console in development.
8. **Generic errors**: Never say "email not found" — always "Invalid credentials" on login, always "email sent if account exists" on forgot-password.
