import { Response } from 'express';
import prisma from '../config/prisma';
import { DepartmentRequest } from '../middleware/departmentGuard';
import { sendUserPushNotification, sendDepartmentPushNotification } from '../utils/push';

export const listProjects = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const projects = await prisma.project.findMany({
      where: { departmentId: dept.id },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
        groups: {
          include: {
            members: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
        tasks: {
          select: { id: true, status: true, projectGroupId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectsWithProgress = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === 'DONE').length;
      const inProgressTasks = p.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const inReviewTasks = p.tasks.filter((t) => t.status === 'IN_REVIEW').length;
      const todoTasks = p.tasks.filter((t) => t.status === 'TODO').length;
      const percentComplete = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        status: p.status,
        startDate: p.startDate,
        dueDate: p.dueDate,
        createdAt: p.createdAt,
        creator: p.creator,
        groupsCount: p.groups.length,
        groups: p.groups,
        stats: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          inReviewTasks,
          todoTasks,
          percentComplete,
        },
      };
    });

    res.json({ projects: projectsWithProgress });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: 'Failed to retrieve projects' });
  }
};

export const getProjectById = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const dept = req.department;
    if (!dept) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        groups: {
          include: {
            members: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
              },
            },
          },
        },
        tasks: {
          include: {
            projectGroup: { select: { id: true, name: true } },
            assignments: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              },
            },
            submissions: {
              include: {
                submitter: { select: { id: true, firstName: true, lastName: true } },
                feedbacks: {
                  include: {
                    reviewer: { select: { id: true, firstName: true, lastName: true } },
                  },
                },
              },
              orderBy: { submittedAt: 'desc' },
            },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!project || project.departmentId !== dept.id) {
      res.status(404).json({ error: 'Project not found in this department' });
      return;
    }

    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === 'DONE').length;
    const inProgressTasks = project.tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReviewTasks = project.tasks.filter((t) => t.status === 'IN_REVIEW').length;
    const todoTasks = project.tasks.filter((t) => t.status === 'TODO').length;
    const percentComplete = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.json({
      project: {
        ...project,
        stats: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          inReviewTasks,
          todoTasks,
          percentComplete,
        },
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to retrieve project details' });
  }
};

export const createProject = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const dept = req.department;
    const user = req.user;
    if (!dept || !user) {
      res.status(401).json({ error: 'Unauthorized or missing department' });
      return;
    }

    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Only tutors or admins can create projects' });
      return;
    }

    const { title, description, startDate, dueDate, groupNames } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Project title is required' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        departmentId: dept.id,
        createdById: user.id,
        title,
        description: description || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Create initial groups if provided
    if (Array.isArray(groupNames) && groupNames.length > 0) {
      for (const gName of groupNames) {
        if (gName.trim()) {
          await prisma.projectGroup.create({
            data: {
              projectId: project.id,
              name: gName.trim(),
            },
          });
        }
      }
    }

    sendDepartmentPushNotification({
      departmentId: dept.id,
      title: `🚀 New Project: ${title}`,
      body: `A new department project "${title}" has been launched. Check your workspace.`,
      actionUrl: `/departments/${dept.slug}/projects/${project.id}`,
      type: 'PROJECT_UPDATE',
      excludeUserId: user.id,
    }).catch(() => {});

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const createGroup = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const group = await prisma.projectGroup.create({
      data: {
        projectId,
        name,
        description: description || null,
      },
    });

    res.status(201).json({ group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create project group' });
  }
};

export const assignGroupMember = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const member = await prisma.projectGroupMember.upsert({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      update: { role: role || 'MEMBER' },
      create: {
        groupId,
        userId,
        role: role || 'MEMBER',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(201).json({ member });
  } catch (error) {
    console.error('Assign group member error:', error);
    res.status(500).json({ error: 'Failed to assign group member' });
  }
};

export const createTask = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, dueDate, projectGroupId, assignedUserIds } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        projectGroupId: projectGroupId || null,
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Assign users to task
    if (Array.isArray(assignedUserIds) && assignedUserIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assignedUserIds.map((uId: string) => ({
          taskId: task.id,
          userId: uId,
        })),
      });

      // Notify assigned users
      for (const uId of assignedUserIds) {
        sendUserPushNotification({
          userId: uId,
          title: `📌 New Task Assigned: ${title}`,
          body: `You have been assigned to task "${title}".`,
          actionUrl: `/departments/${req.department?.slug}/projects/${projectId}`,
          type: 'TASK_ASSIGNED',
        }).catch(() => {});
      }
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTaskStatus = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // TODO | IN_PROGRESS | IN_REVIEW | DONE

    if (!['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(status)) {
      res.status(400).json({ error: 'Invalid task status' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: { project: { select: { id: true, title: true } } },
    });

    res.json({ task });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

export const submitTaskWork = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { notes } = req.body;
    let fileUrls: string[] = [];

    // Check if files were uploaded via multipart form
    if (req.files && Array.isArray(req.files)) {
      fileUrls = (req.files as Express.Multer.File[]).map(
        (f) => `/api/v1/departments/${req.department?.slug}/resources/download/${f.filename}`
      );
    } else if (req.file) {
      fileUrls = [`/api/v1/departments/${req.department?.slug}/resources/download/${req.file.filename}`];
    } else if (req.body.fileUrls) {
      try {
        fileUrls = JSON.parse(req.body.fileUrls);
      } catch (e) {
        fileUrls = [req.body.fileUrls];
      }
    }

    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        submittedById: user.id,
        notes: notes || 'Work submitted for tutor review.',
        fileUrls: JSON.stringify(fileUrls),
      },
      include: {
        submitter: { select: { firstName: true, lastName: true } },
      },
    });

    // Automatically set task status to IN_REVIEW
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_REVIEW' },
    });

    res.status(201).json({ message: 'Deliverables submitted successfully', submission });
  } catch (error) {
    console.error('Submit task work error:', error);
    res.status(500).json({ error: 'Failed to submit deliverables' });
  }
};

export const giveSubmissionFeedback = async (req: DepartmentRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only Tutors and Admins can evaluate submissions
    if (user.role !== 'ADMIN' && req.departmentMemberRole !== 'TUTOR') {
      res.status(403).json({ error: 'Only tutors or admins can review work and give feedback' });
      return;
    }

    const { comment, verdict } = req.body; // APPROVED | NEEDS_REVISION | REJECTED

    if (!comment || !verdict) {
      res.status(400).json({ error: 'Comment and verdict (APPROVED | NEEDS_REVISION | REJECTED) are required' });
      return;
    }

    const feedback = await prisma.submissionFeedback.create({
      data: {
        submissionId,
        reviewerId: user.id,
        comment,
        verdict,
      },
      include: {
        submission: {
          include: {
            task: { select: { id: true, title: true, projectId: true } },
            submitter: { select: { id: true, firstName: true } },
          },
        },
      },
    });

    // Update Task status according to tutor verdict
    const newStatus = verdict === 'APPROVED' ? 'DONE' : 'IN_PROGRESS';
    await prisma.task.update({
      where: { id: feedback.submission.taskId },
      data: { status: newStatus },
    });

    // Notify the submitter
    sendUserPushNotification({
      userId: feedback.submission.submittedById,
      title: `📝 Feedback Received: ${feedback.submission.task.title}`,
      body: `Tutor ${user.firstName} marked your submission as "${verdict}": "${comment}"`,
      actionUrl: `/departments/${req.department?.slug}/projects/${feedback.submission.task.projectId}`,
      type: 'FEEDBACK',
    }).catch(() => {});

    res.status(201).json({ message: 'Feedback recorded', feedback });
  } catch (error) {
    console.error('Give feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
};
