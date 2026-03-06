import { Request, Response, NextFunction } from 'express';
import { decodeAccessToken } from '../lib/security';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Optional: sets userId/userEmail if token present, but never blocks unauthenticated requests
export const optionalAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const { payload } = decodeAccessToken(authHeader.slice(7));
    if (payload) {
      req.userId = payload.sub;
      req.userEmail = payload.email;
    }
  }
  next();
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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

  // Check if user is banned
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { isBanned: true } });
  if (user?.isBanned) {
    res.status(403).json({ success: false, error: 'Account suspended' });
    return;
  }

  next();
};
