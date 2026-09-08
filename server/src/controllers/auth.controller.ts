import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_jwt_secret_dev_key_2026_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'nexus_jwt_refresh_dev_key_2026_secure';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, departmentSlug } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'All fields (email, password, firstName, lastName) are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRole = role === 'TUTOR' ? 'TUTOR' : 'INTERN';

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: assignedRole,
      },
    });

    // If a department slug was provided during registration, auto-enroll or request join
    if (departmentSlug) {
      const dept = await prisma.department.findUnique({
        where: { slug: departmentSlug.toLowerCase() },
      });
      if (dept) {
        await prisma.departmentMember.create({
          data: {
            userId: newUser.id,
            departmentId: dept.id,
            role: assignedRole,
            // Interns join approved by default for easy onboarding in hackathon, or PENDING if desired
            status: 'APPROVED',
          },
        });
      }
    }

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        departmentMemberships: {
          where: { status: 'APPROVED' },
          include: {
            department: {
              select: { id: true, name: true, slug: true, colorHex: true, icon: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials or inactive account' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    let userDepartments: any[] = [];
    if (user.role === 'ADMIN') {
      const allDepts = await prisma.department.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, colorHex: true, icon: true },
        orderBy: { name: 'asc' },
      });
      userDepartments = allDepts.map((d) => ({
        ...d,
        memberRole: 'ADMIN',
      }));
    } else {
      userDepartments = user.departmentMemberships.map((m) => ({
        ...m.department,
        memberRole: m.role,
      }));
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        departments: userDepartments,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        departmentMemberships: {
          where: { status: 'APPROVED' },
          include: {
            department: {
              select: { id: true, name: true, slug: true, colorHex: true, icon: true },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let userDepartments: any[] = [];
    if (user.role === 'ADMIN') {
      const allDepts = await prisma.department.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, colorHex: true, icon: true },
        orderBy: { name: 'asc' },
      });
      userDepartments = allDepts.map((d) => ({
        ...d,
        memberRole: 'ADMIN',
      }));
    } else {
      userDepartments = user.departmentMemberships.map((m) => ({
        ...m.department,
        memberRole: m.role,
      }));
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        departments: userDepartments,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
