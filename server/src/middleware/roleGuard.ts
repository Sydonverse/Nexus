import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role`,
      });
      return;
    }

    next();
  };
};
