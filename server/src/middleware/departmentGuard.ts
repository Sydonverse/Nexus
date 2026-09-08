import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/prisma';

export interface DepartmentContext {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
}

export interface DepartmentRequest extends AuthRequest {
  department?: DepartmentContext;
  departmentMemberRole?: string;
}

export const departmentAccessGuard = async (
  req: DepartmentRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ error: 'Department slug parameter is missing' });
      return;
    }

    const department = await prisma.department.findUnique({
      where: { slug: slug.toLowerCase() },
      select: { id: true, name: true, slug: true, colorHex: true, isActive: true },
    });

    if (!department || !department.isActive) {
      res.status(404).json({ error: 'Department not found or inactive' });
      return;
    }

    // Admins have access across all departments
    if (req.user.role === 'ADMIN') {
      req.department = department;
      req.departmentMemberRole = 'ADMIN';
      next();
      return;
    }

    // Check membership and approved status
    const membership = await prisma.departmentMember.findUnique({
      where: {
        userId_departmentId: {
          userId: req.user.id,
          departmentId: department.id,
        },
      },
    });

    if (!membership || membership.status !== 'APPROVED') {
      res.status(403).json({
        error: 'Access Denied: You are not an approved member of this department',
      });
      return;
    }

    req.department = department;
    req.departmentMemberRole = membership.role;
    next();
  } catch (error) {
    console.error('Department access guard error:', error);
    res.status(500).json({ error: 'Failed to verify department access permissions' });
  }
};
