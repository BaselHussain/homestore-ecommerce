import { Request, Response, NextFunction } from 'express';
import { decodeAccessToken } from '../lib/security';
import prisma from '../lib/prisma';

export interface AdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function adminOnly(req: AdminRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Admin access required' });
      return;
    }

    const token = authHeader.substring(7);
    const { payload, error } = decodeAccessToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: error === 'expired-token' ? 'Token expired' : 'Invalid token',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isBanned: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    if (user.isBanned) {
      res.status(403).json({ success: false, error: 'Account suspended' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden', message: 'Admin access required' });
      return;
    }

    req.adminUser = user;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}
