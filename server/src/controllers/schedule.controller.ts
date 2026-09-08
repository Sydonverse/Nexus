import { Response } from 'express';
import prisma from '../config/prisma';
import { DepartmentRequest } from '../middleware/departmentGuard';
import { sendDepartmentPushNotification } from '../utils/push';

export const listSchedules = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const schedules = await prisma.classSchedule.findMany({
      where: { departmentId: dept.id },
      include: {
        scheduler: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ schedules });
  } catch (error) {
    console.error('List schedules error:', error);
    res.status(500).json({ error: 'Failed to retrieve schedules' });
  }
};

export const createSchedule = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    const user = req.user;
    if (!dept || !user) {
      res.status(401).json({ error: 'Unauthorized or missing department' });
      return;
    }

    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Only tutors or admins can schedule department classes' });
      return;
    }

    const { title, description, startTime, endTime, location, meetingLink } = req.body;
    if (!title || !startTime || !endTime) {
      res.status(400).json({ error: 'Title, startTime, and endTime are required' });
      return;
    }

    const schedule = await prisma.classSchedule.create({
      data: {
        departmentId: dept.id,
        scheduledById: user.id,
        title,
        description: description || '',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || 'Tech Hub Main Hall',
        meetingLink: meetingLink || null,
      },
      include: {
        scheduler: { select: { firstName: true, lastName: true } },
      },
    });

    const dateStr = new Date(startTime).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    sendDepartmentPushNotification({
      departmentId: dept.id,
      title: `🗓️ Class Scheduled: ${title}`,
      body: `Class session scheduled for ${dateStr} at ${location || 'Tech Hub'}`,
      actionUrl: `/departments/${dept.slug}/schedule`,
      type: 'CLASS_SCHEDULE',
      excludeUserId: user.id,
    }).catch((err) => console.error('Push error:', err));

    res.status(201).json({ schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

export const deleteSchedule = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Permission denied to delete schedule' });
      return;
    }

    await prisma.classSchedule.delete({ where: { id } });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};
