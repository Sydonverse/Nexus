import { Response } from 'express';
import prisma from '../config/prisma';
import { DepartmentRequest } from '../middleware/departmentGuard';
import { getIO } from '../socket';

export const listMessages = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const { limit = '50', before } = req.query;
    const take = Math.min(parseInt(String(limit), 10) || 50, 100);

    const messages = await prisma.message.findMany({
      where: {
        departmentId: dept.id,
        ...(before ? { createdAt: { lt: new Date(String(before)) } } : {}),
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

export const sendMessage = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    const user = req.user;
    if (!dept || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { content, attachmentUrls, replyToId } = req.body;
    if (!content && !attachmentUrls) {
      res.status(400).json({ error: 'Message content or attachments required' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        departmentId: dept.id,
        senderId: user.id,
        content: content || '',
        attachmentUrls: attachmentUrls ? JSON.stringify(attachmentUrls) : null,
        replyToId: replyToId || null,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true },
        },
      },
    });

    // Broadcast through Socket.IO
    const io = getIO();
    if (io) {
      io.to(`dept:${dept.slug}`).emit('message:new', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
