export type UserRole = 'ADMIN' | 'TUTOR' | 'INTERN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string | null;
  departments?: DepartmentMemberContext[];
}

export interface DepartmentMemberContext {
  id: string;
  name: string;
  slug: string;
  colorHex: string;
  icon: string;
  memberRole: 'TUTOR' | 'INTERN' | 'ADMIN';
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  colorHex: string;
  isActive: boolean;
  _count?: {
    members: number;
    resources: number;
    projects: number;
    announcements?: number;
    schedules?: number;
  };
}

export interface DepartmentMember {
  id: string;
  userId: string;
  departmentId: string;
  role: 'TUTOR' | 'INTERN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
}

export type ResourceCategory =
  | 'ALL'
  | 'LECTURE'
  | 'TUTORIAL'
  | 'EXERCISE'
  | 'REFERENCE'
  | 'TOOL'
  | 'OTHER';

export interface Resource {
  id: string;
  departmentId: string;
  uploadedById: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  category: ResourceCategory;
  tags?: string | null;
  isPinned: boolean;
  createdAt: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface Announcement {
  id: string;
  departmentId: string;
  authorId: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  isPinned: boolean;
  createdAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export interface ClassSchedule {
  id: string;
  departmentId: string;
  scheduledById: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink?: string | null;
  createdAt: string;
  scheduler?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  submittedById: string;
  notes: string;
  fileUrls: string; // JSON string
  submittedAt: string;
  submitter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  feedbacks: SubmissionFeedback[];
}

export interface SubmissionFeedback {
  id: string;
  submissionId: string;
  reviewerId: string;
  comment: string;
  verdict: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  projectGroupId?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  sortOrder: number;
  projectGroup?: {
    id: string;
    name: string;
  } | null;
  assignments: TaskAssignment[];
  submissions: TaskSubmission[];
}

export interface ProjectGroup {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  members: {
    id: string;
    groupId: string;
    userId: string;
    role: 'LEAD' | 'MEMBER';
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl?: string | null;
    };
  }[];
}

export interface Project {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
  startDate?: string | null;
  dueDate?: string | null;
  createdAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  groupsCount?: number;
  groups?: ProjectGroup[];
  tasks?: Task[];
  stats: {
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    inReviewTasks: number;
    todoTasks: number;
    percentComplete: number;
  };
}

export interface ChatMessage {
  id: string;
  departmentId: string;
  senderId: string;
  content: string;
  attachmentUrls?: string | null;
  replyToId?: string | null;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export interface AppNotification {
  id: string;
  recipientId: string;
  departmentId?: string | null;
  type: 'ANNOUNCEMENT' | 'CLASS_SCHEDULE' | 'PROJECT_UPDATE' | 'TASK_ASSIGNED' | 'FEEDBACK' | 'MESSAGE' | 'RESOURCE';
  title: string;
  body: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  department?: {
    id: string;
    name: string;
    slug: string;
    colorHex: string;
  } | null;
}
