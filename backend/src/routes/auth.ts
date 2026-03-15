import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
  generateResetToken,
  validatePasswordStrength,
} from '../lib/security';
import { sendPasswordReset } from '../lib/email';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { z } from 'zod';

const router = Router();

// Login: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup: 10 accounts per hour per IP
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password: 3 requests per hour per IP (prevents email spam)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, error: 'Too many password reset requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reset password: 5 attempts per 15 minutes per IP (prevents token guessing)
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many attempts. Please try again in 15 minutes.' },
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
router.post('/signup', signupLimiter, async (req: Request, res: Response) => {
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

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ success: false, error: 'An account with this email already exists. Please sign in instead.' });
    return;
  }

  const password_hash = await hashPassword(password);
  await prisma.user.create({
    data: { email: normalizedEmail, password_hash, name, email_verified: true },
  });

  res.status(201).json({ success: true, message: 'Account created. Please log in.' });
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

  await prisma.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });

  // Block banned users from logging in
  if (user.isBanned) {
    res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    return;
  }

  const token = createAccessToken(user.id, user.email, rememberMe);

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// POST /api/auth/logout (authenticated)
router.post('/logout', authenticate, (_req: AuthRequest, res: Response) => {
  // JWT is stateless — client discards the token
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me (authenticated) — returns current user with role
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, role: true, isBanned: true },
  });
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ success: false, error: 'Account suspended' });
    return;
  }
  res.json({ success: true, user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, async (req: Request, res: Response) => {
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

  // Invalidate existing unused tokens
  await prisma.passwordResetToken.updateMany({
    where: { user_id: user.id, used: false },
    data: { used: true },
  });

  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { user_id: user.id, token, expires_at: expiresAt },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordReset(normalizedEmail, resetUrl);

  res.json(successResponse);
});

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordLimiter, async (req: Request, res: Response) => {
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
