import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { notifyDepartmentMembers, notifyAllUsers } from '../services/notification.service';
import { getIO } from '../socket';

export const listAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const dept = await prisma.department.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    // Return both department-specific announcements AND global announcements (departmentId is null)
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ departmentId: dept.id }, { departmentId: null }],
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
        department: {
          select: { id: true, name: true, slug: true, colorHex: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ announcements });
  } catch (error) {
    console.error('List announcements error:', error);
    res.status(500).json({ error: 'Failed to retrieve announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { title, content, priority, isPinned, isGlobal } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only tutors and admin can create announcements
    if (user.role !== 'TUTOR' && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Only tutors and administrators can post announcements' });
      return;
    }

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    let targetDeptId: string | null = null;
    let targetDeptSlug: string | null = null;

    // If admin explicitly makes it global OR slug is 'global'
    if (user.role === 'ADMIN' && (isGlobal || slug === 'global')) {
      targetDeptId = null;
    } else {
      const dept = await prisma.department.findUnique({
        where: { slug },
        select: { id: true, slug: true, name: true },
      });
      if (!dept) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      targetDeptId = dept.id;
      targetDeptSlug = dept.slug;
    }

    const announcement = await prisma.announcement.create({
      data: {
        departmentId: targetDeptId,
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'NORMAL',
        isPinned: !!isPinned,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
        department: {
          select: { id: true, name: true, slug: true, colorHex: true },
        },
      },
    });

    // Real-time broadcast
    const io = getIO();
    if (io) {
      if (targetDeptSlug) {
        io.to(`dept:${targetDeptSlug}`).emit('announcement:new', announcement);
      } else {
        io.emit('announcement:new', announcement);
      }
    }

    // Send push notification
    const notificationPayload = {
      type: 'ANNOUNCEMENT',
      title: `📢 Announcement: ${announcement.title}`,
      body: announcement.content,
      actionUrl: '/announcements',
      departmentId: targetDeptId,
    };

    if (targetDeptId) {
      await notifyDepartmentMembers(targetDeptId, notificationPayload, user.id);
    } else {
      await notifyAllUsers(notificationPayload, user.id);
    }

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (user.role !== 'TUTOR' && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Only tutors and administrators can delete announcements' });
      return;
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { department: { select: { slug: true } } },
    });

    if (!announcement) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    if (user.role !== 'ADMIN' && announcement.authorId !== user.id) {
      res.status(403).json({ error: 'Forbidden: You can only delete your own announcements' });
      return;
    }

    await prisma.announcement.delete({ where: { id } });

    const io = getIO();
    if (io) {
      if (announcement.department) {
        io.to(`dept:${announcement.department.slug}`).emit('announcement:deleted', { id });
      } else {
        io.emit('announcement:deleted', { id });
      }
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
