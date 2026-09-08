import { Response } from 'express';
import prisma from '../config/prisma';
import { DepartmentRequest } from '../middleware/departmentGuard';
import { sendDepartmentPushNotification } from '../utils/push';

export const listAnnouncements = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const announcements = await prisma.announcement.findMany({
      where: { departmentId: dept.id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
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

export const createAnnouncement = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    const user = req.user;
    if (!dept || !user) {
      res.status(401).json({ error: 'Unauthorized or missing department' });
      return;
    }

    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Only tutors or admins can post department announcements' });
      return;
    }

    const { title, content, priority, isPinned } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        departmentId: dept.id,
        authorId: user.id,
        title,
        content,
        priority: priority || 'NORMAL',
        isPinned: Boolean(isPinned),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
      },
    });

    // Send push notification specifically to interns in this department
    sendDepartmentPushNotification({
      departmentId: dept.id,
      title: `📢 ${dept.name} Announcement: ${title}`,
      body: content.length > 120 ? `${content.substring(0, 117)}...` : content,
      actionUrl: `/departments/${dept.slug}/announcements`,
      type: 'ANNOUNCEMENT',
      excludeUserId: user.id,
    }).catch((err) => console.error('Push error:', err));

    res.status(201).json({ announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const deleteAnnouncement = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Permission denied to delete announcement' });
      return;
    }

    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
