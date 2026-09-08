import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../config/prisma';
import { DepartmentRequest } from '../middleware/departmentGuard';
import { sendDepartmentPushNotification } from '../utils/push';

export const listResources = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const { category, search } = req.query;

    const resources = await prisma.resource.findMany({
      where: {
        departmentId: dept.id,
        ...(category && category !== 'ALL' ? { category: String(category) } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: String(search) } },
                { description: { contains: String(search) } },
                { tags: { contains: String(search) } },
              ],
            }
          : {}),
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ resources });
  } catch (error) {
    console.error('List resources error:', error);
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
};

export const uploadResource = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    const user = req.user;
    if (!dept || !user) {
      res.status(401).json({ error: 'Unauthorized or missing department' });
      return;
    }

    // Only Tutors or Admins can upload learning resources
    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Only tutors or admins can upload department learning resources' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'A file is required for resource upload' });
      return;
    }

    const { title, description, category, tags } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const fileUrl = `/api/v1/departments/${dept.slug}/resources/download/${file.filename}`;

    const resource = await prisma.resource.create({
      data: {
        departmentId: dept.id,
        uploadedById: user.id,
        title,
        description: description || '',
        fileUrl,
        fileName: file.originalname,
        fileMimeType: file.mimetype,
        fileSizeBytes: file.size,
        category: category || 'OTHER',
        tags: tags || null,
        isPinned: false,
      },
      include: {
        uploader: { select: { firstName: true, lastName: true } },
      },
    });

    // Notify interns in this department
    sendDepartmentPushNotification({
      departmentId: dept.id,
      title: `New Resource: ${title}`,
      body: `${user.firstName} uploaded a new ${category || 'learning'} resource in ${dept.name}`,
      actionUrl: `/departments/${dept.slug}/resources`,
      type: 'RESOURCE',
      excludeUserId: user.id,
    }).catch((err) => console.error('Push error:', err));

    res.status(201).json({ message: 'Resource uploaded successfully', resource });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ error: 'Failed to upload resource' });
  }
};

export const downloadResource = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found on server' });
      return;
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

export const deleteResource = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Only creator or admin or tutor can delete
    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR' && resource.uploadedById !== user.id) {
      res.status(403).json({ error: 'Permission denied to delete this resource' });
      return;
    }

    await prisma.resource.delete({ where: { id } });
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
