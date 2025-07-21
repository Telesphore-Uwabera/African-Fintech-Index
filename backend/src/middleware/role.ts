import { Request, Response, NextFunction } from 'express';

export function requireRole(role: string) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

export function requireAnyRole(roles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
} 