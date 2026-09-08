import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/roleGuard';
import { departmentAccessGuard } from '../middleware/departmentGuard';
import { upload } from '../middleware/upload';

import {
  listDepartments,
  getDepartment,
  createDepartment,
  joinDepartment,
  getMembers,
  updateMemberStatus,
} from '../controllers/department.controller';

import {
  listResources,
  uploadResource,
  downloadResource,
  deleteResource,
} from '../controllers/resource.controller';

import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller';

import {
  listSchedules,
  createSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller';

import {
  listProjects,
  getProjectById,
  createProject,
  createGroup,
  assignGroupMember,
  createTask,
  updateTaskStatus,
  submitTaskWork,
  giveSubmissionFeedback,
} from '../controllers/project.controller';

import { listMessages, sendMessage } from '../controllers/message.controller';

const router = Router();

// Base department routes
router.get('/', authenticate, listDepartments);
router.post('/', authenticate, requireRoles(['ADMIN']), createDepartment);
router.post('/:slug/join', authenticate, joinDepartment);

// Department-scoped routes (strictly protected by departmentAccessGuard)
router.get('/:slug', authenticate, departmentAccessGuard, getDepartment);
router.get('/:slug/members', authenticate, departmentAccessGuard, getMembers);
router.patch('/:slug/members/:memberId', authenticate, departmentAccessGuard, updateMemberStatus);

// Resources
router.get('/:slug/resources', authenticate, departmentAccessGuard, listResources);
router.post('/:slug/resources', authenticate, departmentAccessGuard, upload.single('file'), uploadResource);
router.get('/:slug/resources/download/:filename', authenticate, downloadResource);
router.delete('/:slug/resources/:id', authenticate, departmentAccessGuard, deleteResource);

// Announcements
router.get('/:slug/announcements', authenticate, departmentAccessGuard, listAnnouncements);
router.post('/:slug/announcements', authenticate, departmentAccessGuard, createAnnouncement);
router.delete('/:slug/announcements/:id', authenticate, departmentAccessGuard, deleteAnnouncement);

// Schedules
router.get('/:slug/schedules', authenticate, departmentAccessGuard, listSchedules);
router.post('/:slug/schedules', authenticate, departmentAccessGuard, createSchedule);
router.delete('/:slug/schedules/:id', authenticate, departmentAccessGuard, deleteSchedule);

// Projects
router.get('/:slug/projects', authenticate, departmentAccessGuard, listProjects);
router.post('/:slug/projects', authenticate, departmentAccessGuard, createProject);
router.get('/:slug/projects/:projectId', authenticate, departmentAccessGuard, getProjectById);
router.post('/:slug/projects/:projectId/groups', authenticate, departmentAccessGuard, createGroup);
router.post('/:slug/projects/:projectId/groups/:groupId/members', authenticate, departmentAccessGuard, assignGroupMember);
router.post('/:slug/projects/:projectId/tasks', authenticate, departmentAccessGuard, createTask);
router.patch('/:slug/projects/:projectId/tasks/:taskId/status', authenticate, departmentAccessGuard, updateTaskStatus);
router.post(
  '/:slug/projects/:projectId/tasks/:taskId/submissions',
  authenticate,
  departmentAccessGuard,
  upload.array('files', 5),
  submitTaskWork
);
router.post(
  '/:slug/projects/:projectId/tasks/:taskId/submissions/:submissionId/feedback',
  authenticate,
  departmentAccessGuard,
  giveSubmissionFeedback
);

// Messages
router.get('/:slug/messages', authenticate, departmentAccessGuard, listMessages);
router.post('/:slug/messages', authenticate, departmentAccessGuard, sendMessage);

export default router;
