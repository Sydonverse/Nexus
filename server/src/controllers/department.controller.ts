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
            resources: true,
            projects: true,
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
            resources: true,
            announcements: true,
            schedules: true,
            projects: true,
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

    const normalizedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name }, { slug: normalizedSlug }],
      },
    });

    if (existing) {
      res.status(409).json({ error: 'A department with this name or slug already exists' });
      return;
    }

    const department = await prisma.department.create({
      data: {
        name,
        slug: normalizedSlug,
        description,
        icon: icon || 'code',
        colorHex: colorHex || '#6366f1',
      },
    });

    res.status(201).json({ department });
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

    const department = await prisma.department.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const existing = await prisma.departmentMember.findUnique({
      where: {
        userId_departmentId: {
          userId: user.id,
          departmentId: department.id,
        },
      },
    });

    if (existing) {
      res.status(409).json({ error: `You have already applied or belong to this department (status: ${existing.status})` });
      return;
    }

    const membership = await prisma.departmentMember.create({
      data: {
        userId: user.id,
        departmentId: department.id,
        role: user.role === 'TUTOR' ? 'TUTOR' : 'INTERN',
        status: 'APPROVED',
      },
    });

    res.status(201).json({ message: 'Joined department successfully', membership });
  } catch (error) {
    console.error('Join department error:', error);
    res.status(500).json({ error: 'Failed to join department' });
  }
};

export const getMembers = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const members = await prisma.departmentMember.findMany({
      where: { departmentId: dept.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
};

export const updateMemberStatus = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const { status, role } = req.body; // status: APPROVED | REJECTED, role: TUTOR | INTERN

    const updated = await prisma.departmentMember.update({
      where: { id: memberId },
      data: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json({ message: 'Member status updated', member: updated });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member status' });
  }
};
