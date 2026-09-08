import React, { useState } from 'react';
import {
  X,
  Upload,
  Calendar,
  Megaphone,
  KanbanSquare,
  Plus,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { ResourceCategory, TaskPriority, Task, DepartmentMemberContext } from '../types';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Upload Resource Modal
interface UploadResourceModalProps extends ModalBaseProps {
  onUpload: (formData: FormData) => Promise<void>;
  activeDept: DepartmentMemberContext;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('TUTORIAL');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('file', file);

      await onUpload(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Upload size={20} className="text-accent" />
            <h3 className="modal-title">Upload Learning Resource</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Resource Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. OWASP Security Assessment Lab Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-field textarea-field"
              rows={3}
              placeholder="Provide context on what this resource covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              >
                <option value="LECTURE">Lecture</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="EXERCISE">Exercise / Lab</option>
                <option value="REFERENCE">Reference Guide</option>
                <option value="TOOL">Tool / Script</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="lab, security, guide"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Attachment File * (any file type)</label>
            <div className="file-dropzone">
              <input
                type="file"
                required
                id="file-input"
                className="file-input-hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-input" className="file-dropzone-label">
                <Upload size={24} className="text-muted mb-2" />
                <span className="dropzone-text">
                  {file ? file.name : 'Click to select or drop file here'}
                </span>
                {file && (
                  <span className="text-muted text-xs">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !file || !title}>
              {loading ? 'Uploading...' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Post Announcement Modal
interface CreateAnnouncementModalProps extends ModalBaseProps {
  onCreate: (data: any) => Promise<void>;
}

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await onCreate({ title, content, priority, isPinned });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Megaphone size={20} className="text-accent" />
            <h3 className="modal-title">Post Announcement</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Announcement Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Mid-term CTF Challenge Registration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Content *</label>
            <textarea
              required
              className="input-field textarea-field"
              rows={4}
              placeholder="Write the detailed broadcast message for interns..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Priority</label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent (Red Alert)</option>
              </select>
            </div>

            <div className="form-group flex-1 flex-center">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <span>Pin to top of feed</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !title || !content}>
              {loading ? 'Posting...' : 'Broadcast to Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Schedule Class Modal
interface ScheduleClassModalProps extends ModalBaseProps {
  onSchedule: (data: any) => Promise<void>;
}

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('Tech Hub Room 2A');
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;

    setLoading(true);
    try {
      await onSchedule({
        title,
        description,
        startTime,
        endTime,
        location,
        meetingLink,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Calendar size={20} className="text-accent" />
            <h3 className="modal-title">Schedule New Training Class</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Session Topic / Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Hands-on Penetration Testing Workshop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Agenda / Description</label>
            <textarea
              className="input-field textarea-field"
              rows={3}
              placeholder="Session objectives and required tools..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Start Time *</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">End Time *</label>
              <input
                type="datetime-local"
                required
                className="input-field"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Physical Location</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Lab 2B / Tech Hub Auditorium"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Virtual Meeting Link (Zoom / Meet)</label>
            <input
              type="url"
              className="input-field"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !title || !startTime}>
              {loading ? 'Scheduling...' : 'Schedule Class & Notify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Create Project Modal
interface CreateProjectModalProps extends ModalBaseProps {
  onCreate: (data: any) => Promise<void>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [groupNames, setGroupNames] = useState('Group Alpha, Group Bravo');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      const groups = groupNames
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);

      await onCreate({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        groupNames: groups,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <KanbanSquare size={20} className="text-accent" />
            <h3 className="modal-title">Create Team Project</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Enterprise Security Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project Scope / Overview</label>
            <textarea
              className="input-field textarea-field"
              rows={3}
              placeholder="Detail the project goals and expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Date</label>
            <input
              type="date"
              className="input-field"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Working Groups (comma separated)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Group Alpha, Group Bravo, Frontend Team"
              value={groupNames}
              onChange={(e) => setGroupNames(e.target.value)}
            />
            <span className="text-muted text-xs">
              Interns in this department can be organized into these project groups.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !title}>
              {loading ? 'Creating...' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Create Task Modal
interface CreateTaskModalProps extends ModalBaseProps {
  projectId: string;
  onCreate: (data: any) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    try {
      await onCreate({ title, description, priority });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Plus size={20} className="text-accent" />
            <h3 className="modal-title">Add Project Task</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Conduct OSINT Subdomain Enumeration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Instructions</label>
            <textarea
              className="input-field textarea-field"
              rows={3}
              placeholder="Specify the requirements and expected output..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="input-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !title}>
              {loading ? 'Adding...' : 'Add Task to Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Submit Deliverables Modal (for Interns)
interface SubmitWorkModalProps extends ModalBaseProps {
  task: Task | null;
  onSubmitWork: (formData: FormData) => Promise<void>;
}

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitWork,
}) => {
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }
      await onSubmitWork(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileCheck size={20} className="text-accent" />
            <h3 className="modal-title">Submit Deliverables</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="submission-task-banner">
            <span className="text-muted text-xs">Submitting work for:</span>
            <div className="task-title-highlight">{task.title}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Submission Notes & Summary *</label>
            <textarea
              required
              className="input-field textarea-field"
              rows={4}
              placeholder="Describe your implementation, tests performed, and any findings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Completed Files / Reports</label>
            <input
              type="file"
              multiple
              className="input-field"
              onChange={(e) => setFiles(e.target.files)}
            />
            <span className="text-muted text-xs">
              Attach code zips, PDFs, scan logs, screenshots, or 3D models.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !notes}>
              {loading ? 'Submitting...' : 'Submit to Tutor for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Give Feedback Modal (for Tutors)
interface GiveFeedbackModalProps extends ModalBaseProps {
  task: Task | null;
  submissionId: string | null;
  onGiveFeedback: (data: { comment: string; verdict: string }) => Promise<void>;
}

export const GiveFeedbackModal: React.FC<GiveFeedbackModalProps> = ({
  isOpen,
  onClose,
  task,
  onGiveFeedback,
}) => {
  const [comment, setComment] = useState('');
  const [verdict, setVerdict] = useState<'APPROVED' | 'NEEDS_REVISION'>('APPROVED');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const latestSubmission = task.submissions?.[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    setLoading(true);
    try {
      await onGiveFeedback({ comment, verdict });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <CheckCircle size={20} className="text-accent" />
            <h3 className="modal-title">Review Deliverables & Feedback</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="submission-task-banner">
            <span className="text-muted text-xs">Reviewing submission for:</span>
            <div className="task-title-highlight">{task.title}</div>
            {latestSubmission && (
              <div className="submission-notes-quote mt-2">
                <span className="text-xs text-muted">
                  Submitted by {latestSubmission.submitter?.firstName}:
                </span>
                <p>"{latestSubmission.notes}"</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Review Verdict *</label>
            <div className="verdict-options-row">
              <label className={`verdict-btn ${verdict === 'APPROVED' ? 'active-approved' : ''}`}>
                <input
                  type="radio"
                  name="verdict"
                  value="APPROVED"
                  checked={verdict === 'APPROVED'}
                  onChange={() => setVerdict('APPROVED')}
                />
                <span>✅ Approve & Mark Done</span>
              </label>

              <label className={`verdict-btn ${verdict === 'NEEDS_REVISION' ? 'active-revision' : ''}`}>
                <input
                  type="radio"
                  name="verdict"
                  value="NEEDS_REVISION"
                  checked={verdict === 'NEEDS_REVISION'}
                  onChange={() => setVerdict('NEEDS_REVISION')}
                />
                <span>🔄 Request Revision</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Instructor Feedback Comment *</label>
            <textarea
              required
              className="input-field textarea-field"
              rows={4}
              placeholder="Provide constructive feedback, praise, or specific revision requests..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !comment}>
              {loading ? 'Submitting...' : 'Submit Evaluation & Notify Intern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
