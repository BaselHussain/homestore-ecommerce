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
