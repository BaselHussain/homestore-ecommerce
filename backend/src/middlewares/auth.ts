import { Request, Response, NextFunction } from 'express';
import { decodeAccessToken } from '../lib/security';

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
