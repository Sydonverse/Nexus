import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Send,
  MessageSquareQuote,
  Paperclip,
  ExternalLink,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Project,
  Task,
  TaskStatus,
  DepartmentMemberContext,
} from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeDept: DepartmentMemberContext;
  isTutorOrAdmin: boolean;
  onOpenCreateProject: () => void;
  onOpenCreateTask: (projectId: string) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  onOpenSubmitWork: (projectId: string, task: Task) => void;
  onOpenFeedback: (projectId: string, task: Task, submissionId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeDept,
  isTutorOrAdmin,
  onOpenCreateProject,
  onOpenCreateTask,
  onUpdateTaskStatus,
  onOpenSubmitWork,
  onOpenFeedback,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'TODO', title: 'To Do', color: '#94a3b8' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
    { id: 'IN_REVIEW', title: 'In Review / Submitted', color: '#f59e0b' },
    { id: 'DONE', title: 'Done / Approved', color: '#10b981' },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="badge badge-urgent">Critical</span>;
      case 'HIGH':
        return <span className="badge badge-important">High</span>;
      case 'MEDIUM':
        return <span className="badge badge-normal">Medium</span>;
      default:
        return <span className="badge">Low</span>;
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!currentProject) return;
    if (newStatus === 'DONE') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    onUpdateTaskStatus(currentProject.id, taskId, newStatus);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Project Management & Progress Tracker</h1>
          <p className="view-subtitle">
            Collaborative department workspaces, working groups, task delegation, and submission feedback review.
          </p>
        </div>
        <div className="view-header-actions">
          {isTutorOrAdmin && (
            <button className="btn-primary" onClick={onOpenCreateProject}>
              <Plus size={16} />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <KanbanSquare size={48} className="text-muted" />
          <h3>No projects in this department</h3>
          <p className="text-muted">
            Tutors can launch team projects and assign intern groups.
          </p>
          {isTutorOrAdmin && (
            <button className="btn-primary mt-4" onClick={onOpenCreateProject}>
              <Plus size={16} />
              <span>Launch First Project</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Project Selector Tabs */}
          {projects.length > 1 && (
            <div className="project-tabs-bar">
              {projects.map((p) => (
                <button
                  key={p.id}
                  className={`project-tab-btn ${p.id === currentProject.id ? 'active' : ''}`}
                  onClick={() => setSelectedProjectId(p.id)}
                  style={
                    p.id === currentProject.id
                      ? { borderColor: activeDept.colorHex, color: 'var(--text-primary)' }
                      : {}
                  }
                >
                  <span>{p.title}</span>
                  <span className="tab-progress-badge">
                    {p.stats?.percentComplete || 0}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Active Project Card Overview */}
          {currentProject && (
            <div className="project-summary-box glass-panel">
              <div className="summary-left">
                <div className="summary-status-row">
                  <span className="badge badge-normal">{currentProject.status}</span>
                  <span className="summary-date">
                    Due:{' '}
                    {currentProject.dueDate
                      ? new Date(currentProject.dueDate).toLocaleDateString()
                      : 'Ongoing'}
                  </span>
                </div>
                <h2 className="summary-project-title">{currentProject.title}</h2>
                <p className="summary-project-desc">{currentProject.description}</p>
              </div>

              <div className="summary-right">
                <div className="progress-card-metric">
                  <div className="metric-header">
                    <span className="metric-label">Overall Completion</span>
                    <span className="metric-val">
                      {currentProject.stats?.percentComplete || 0}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${currentProject.stats?.percentComplete || 0}%`,
                        background: `linear-gradient(90deg, ${activeDept.colorHex}, #10b981)`,
                      }}
                    />
                  </div>
                  <div className="metric-sub">
                    {currentProject.stats?.doneTasks} of {currentProject.stats?.totalTasks} tasks
                    approved
                  </div>
                </div>

                {isTutorOrAdmin && (
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => onOpenCreateTask(currentProject.id)}
                  >
                    <Plus size={14} />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Working Groups Pill Row */}
          {currentProject?.groups && currentProject.groups.length > 0 && (
            <div className="working-groups-row">
              <span className="groups-label">Assigned Working Groups:</span>
              <div className="groups-chips">
                {currentProject.groups.map((g) => (
                  <div key={g.id} className="group-chip glass-panel">
                    <Users size={14} className="text-accent" />
                    <span className="group-chip-title">{g.name}</span>
                    <div className="group-member-avatars">
                      {g.members?.map((m) => (
                        <div
                          key={m.id}
                          className="member-mini-avatar"
                          title={`${m.user.firstName} ${m.user.lastName} (${m.role})`}
                        >
                          {m.user.firstName[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="kanban-board">
            {columns.map((col) => {
              const columnTasks = (currentProject?.tasks || []).filter(
                (t) => t.status === col.id
              );

              return (
                <div key={col.id} className="kanban-column glass-panel">
                  <div className="column-header">
                    <div className="column-title-box">
                      <div
                        className="column-color-indicator"
                        style={{ background: col.color }}
                      />
                      <span className="column-title">{col.title}</span>
                    </div>
                    <span className="column-count-badge">{columnTasks.length}</span>
                  </div>

                  <div className="column-tasks-list">
                    {columnTasks.length === 0 ? (
                      <div className="empty-column-placeholder">
                        <span>No tasks in {col.title}</span>
                      </div>
                    ) : (
                      columnTasks.map((task) => {
                        const latestSubmission = task.submissions?.[0];
                        const latestFeedback = latestSubmission?.feedbacks?.[0];

                        return (
                          <div key={task.id} className="task-card glass-panel glass-panel-hover">
                            <div className="task-top">
                              {getPriorityBadge(task.priority)}
                              {task.projectGroup && (
                                <span className="task-group-badge">
                                  {task.projectGroup.name.split('(')[0]}
                                </span>
                              )}
                            </div>

                            <h4 className="task-title">{task.title}</h4>
                            <p className="task-desc">{task.description}</p>

                            {/* Assigned Members */}
                            {task.assignments && task.assignments.length > 0 && (
                              <div className="task-assignees">
                                {task.assignments.map((a) => (
                                  <div
                                    key={a.id}
                                    className="assignee-badge"
                                    title={`Assigned: ${a.user.firstName} ${a.user.lastName}`}
                                  >
                                    <div className="assignee-avatar">
                                      {a.user.firstName[0]}
                                    </div>
                                    <span>{a.user.firstName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Submission Status Indicator */}
                            {latestSubmission && (
                              <div className="task-submission-notice">
                                <Paperclip size={13} className="text-accent" />
                                <span>Deliverables Submitted</span>
                                {latestFeedback && (
                                  <span
                                    className={`badge badge-${
                                      latestFeedback.verdict === 'APPROVED' ? 'normal' : 'important'
                                    } text-xs ml-auto`}
                                  >
                                    {latestFeedback.verdict}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Feedback comment display if any */}
                            {latestFeedback && (
                              <div className="task-feedback-snippet">
                                <MessageSquareQuote size={13} className="text-muted" />
                                <span>Tutor: "{latestFeedback.comment}"</span>
                              </div>
                            )}

                            {/* Task Action Row */}
                            <div className="task-actions-row">
                              {/* Intern can submit deliverables */}
                              {col.id !== 'DONE' && (
                                <button
                                  className="btn-secondary btn-xs"
                                  onClick={() => onOpenSubmitWork(currentProject.id, task)}
                                  title="Submit completed work or code deliverables"
                                >
                                  <Send size={12} />
                                  <span>Submit Work</span>
                                </button>
                              )}

                              {/* Tutor can review submission and give feedback */}
                              {isTutorOrAdmin && latestSubmission && col.id === 'IN_REVIEW' && (
                                <button
                                  className="btn-primary btn-xs"
                                  onClick={() =>
                                    onOpenFeedback(
                                      currentProject.id,
                                      task,
                                      latestSubmission.id
                                    )
                                  }
                                  title="Review deliverables and give feedback"
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Review</span>
                                </button>
                              )}

                              {/* Status Select Dropdown */}
                              <div className="task-status-select-wrap">
                                <select
                                  className="task-status-select"
                                  value={task.status}
                                  onChange={(e) =>
                                    handleStatusChange(task.id, e.target.value as TaskStatus)
                                  }
                                >
                                  <option value="TODO">To Do</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="IN_REVIEW">In Review</option>
                                  <option value="DONE">Done</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
