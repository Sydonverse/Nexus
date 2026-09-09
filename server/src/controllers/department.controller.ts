import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { DepartmentRequest } from '../middleware/departmentGuard';

export const listDepartments = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        colorHex: true,
        _count: {
          select: {
            members: { where: { status: 'APPROVED' } },
            materials: true,
            assignments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ departments });
  } catch (error) {
    console.error('List departments error:', error);
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
};

export const getDepartment = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const details = await prisma.department.findUnique({
      where: { id: dept.id },
      include: {
        _count: {
          select: {
            members: { where: { status: 'APPROVED' } },
            materials: true,
            announcements: true,
            schedules: true,
            assignments: true,
          },
        },
      },
    });

    res.json({ department: details, memberRole: req.departmentMemberRole });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Failed to retrieve department details' });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, description, icon, colorHex } = req.body;

    if (!name || !slug || !description) {
      res.status(400).json({ error: 'Name, slug, and description are required' });
      return;
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: slug.toLowerCase().trim() }],
      },
    });

    if (existing) {
      res.status(409).json({ error: 'A department with this name or slug already exists' });
      return;
    }

    const newDept = await prisma.department.create({
      data: {
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        description: description.trim(),
        icon: icon || 'book-open',
        colorHex: colorHex || '#6366f1',
      },
    });

    res.status(201).json({ department: newDept });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

export const joinDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const dept = await prisma.department.findUnique({ where: { slug } });
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    // Check if user already enrolled in another department (enforce single department for tutors/interns)
    if (user.role !== 'ADMIN') {
      const existingMembership = await prisma.departmentMember.findFirst({
        where: { userId: user.id },
        include: { department: true },
      });

      if (existingMembership) {
        res.status(400).json({
          error: `You are already enrolled in ${existingMembership.department.name}. Users belong to one department only.`,
        });
        return;
      }
    }

    const memberRole = user.role === 'TUTOR' ? 'TUTOR' : 'INTERN';
    const membership = await prisma.departmentMember.create({
      data: {
        userId: user.id,
        departmentId: dept.id,
        role: memberRole,
        status: 'APPROVED',
      },
    });

    res.status(201).json({ message: 'Enrolled in department', membership });
  } catch (error) {
    console.error('Join department error:', error);
    res.status(500).json({ error: 'Failed to join department' });
  }
};
