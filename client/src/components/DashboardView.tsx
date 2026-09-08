import React from 'react';
import {
  FolderGit2,
  KanbanSquare,
  Calendar,
  Megaphone,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  DepartmentMemberContext,
  Resource,
  Announcement,
  ClassSchedule,
  Project,
} from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  activeDept: DepartmentMemberContext;
  resources: Resource[];
  announcements: Announcement[];
  schedules: ClassSchedule[];
  projects: Project[];
  onNavigate: (tab: ActiveTab) => void;
  isTutorOrAdmin: boolean;
  onOpenUpload: () => void;
  onOpenSchedule: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeDept,
  resources,
  announcements,
  schedules,
  projects,
  onNavigate,
  isTutorOrAdmin,
  onOpenUpload,
  onOpenSchedule,
}) => {
  const latestAnnouncement = announcements[0];
  const upcomingSchedule = schedules.find(
    (s) => new Date(s.startTime).getTime() > Date.now() - 3600000
  ) || schedules[0];
  const activeProject = projects[0];

  const totalTasks = projects.reduce((acc, p) => acc + (p.stats?.totalTasks || 0), 0);
  const doneTasks = projects.reduce((acc, p) => acc + (p.stats?.doneTasks || 0), 0);
  const overallPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-content">
      {/* Department Hero Banner */}
      <div
        className="hero-banner"
        style={{
          borderColor: `${activeDept.colorHex}44`,
          background: `linear-gradient(135deg, ${activeDept.colorHex}18 0%, rgba(13, 18, 33, 0.8) 100%)`,
        }}
      >
        <div className="hero-content">
          <div className="hero-badge" style={{ borderColor: activeDept.colorHex, color: activeDept.colorHex }}>
            <Sparkles size={14} />
            <span>Active Department Space</span>
          </div>
          <h1 className="hero-title">{activeDept.name}</h1>
          <p className="hero-subtitle">
            Centralized hub for {activeDept.name} interns and tutors. Access verified learning materials, track your project deliverables, and stay synchronized with class schedules.
          </p>
          <div className="hero-actions">
            {isTutorOrAdmin && (
              <button className="btn-primary" onClick={onOpenUpload}>
                <FolderGit2 size={16} />
                <span>Upload Learning Resource</span>
              </button>
            )}
            {isTutorOrAdmin && (
              <button className="btn-secondary" onClick={onOpenSchedule}>
                <Calendar size={16} />
                <span>Schedule New Class</span>
              </button>
            )}
            <button className="btn-secondary" onClick={() => onNavigate('projects')}>
              <KanbanSquare size={16} />
              <span>Open Project Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-panel glass-panel-hover" onClick={() => onNavigate('resources')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FolderGit2 size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Learning Resources</span>
            <span className="stat-value">{resources.length}</span>
            <span className="stat-trend text-muted">Curated files & labs</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => onNavigate('projects')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Project Completion</span>
            <span className="stat-value">{overallPercent}%</span>
            <span className="stat-trend text-success">{doneTasks} of {totalTasks} tasks done</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => onNavigate('schedule')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Upcoming Classes</span>
            <span className="stat-value">{schedules.length}</span>
            <span className="stat-trend text-muted">Sessions scheduled</span>
          </div>
        </div>

        <div className="stat-card glass-panel glass-panel-hover" onClick={() => onNavigate('announcements')}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Megaphone size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">Announcements</span>
            <span className="stat-value">{announcements.length}</span>
            <span className="stat-trend text-muted">Official department broadcasts</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Left Column: Active Project Progress */}
        <div className="dashboard-col">
          <div className="section-header">
            <div className="section-title-group">
              <KanbanSquare size={18} style={{ color: activeDept.colorHex }} />
              <h2>Active Project Workspace</h2>
            </div>
            <button className="text-link" onClick={() => onNavigate('projects')}>
              <span>View Kanban Board</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {activeProject ? (
            <div className="active-project-card glass-panel">
              <div className="project-card-top">
                <div>
                  <span className="badge badge-normal">{activeProject.status}</span>
                  <h3 className="project-title-dash">{activeProject.title}</h3>
                </div>
                <div className="project-progress-circle">
                  <span className="progress-number">{activeProject.stats?.percentComplete || 0}%</span>
                </div>
              </div>
              <p className="project-desc-dash">{activeProject.description}</p>

              {/* Progress Bar */}
              <div className="progress-track-wrapper">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${activeProject.stats?.percentComplete || 0}%`,
                      background: `linear-gradient(90deg, ${activeDept.colorHex}, #10b981)`,
                    }}
                  />
                </div>
                <div className="progress-legend">
                  <span>{activeProject.stats?.doneTasks} done</span>
                  <span>{activeProject.stats?.inProgressTasks} in progress</span>
                  <span>{activeProject.stats?.inReviewTasks} in review</span>
                  <span>{activeProject.stats?.todoTasks} todo</span>
                </div>
              </div>

              {/* Groups overview */}
              {activeProject.groups && activeProject.groups.length > 0 && (
                <div className="groups-summary-box">
                  <div className="groups-summary-title">Assigned Working Groups:</div>
                  <div className="groups-pills-list">
                    {activeProject.groups.map((g) => (
                      <div key={g.id} className="group-pill">
                        <span className="group-pill-name">{g.name}</span>
                        <span className="group-pill-count">
                          {g.members?.length || 0} members
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-card glass-panel">
              <p className="text-muted">No projects created yet for this department.</p>
            </div>
          )}

          {/* Quick Learning Materials List */}
          <div className="section-header mt-6">
            <div className="section-title-group">
              <FolderGit2 size={18} style={{ color: activeDept.colorHex }} />
              <h2>Featured Learning Materials</h2>
            </div>
            <button className="text-link" onClick={() => onNavigate('resources')}>
              <span>View All ({resources.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="resources-mini-list">
            {resources.slice(0, 3).map((res) => (
              <div key={res.id} className="resource-mini-item glass-panel glass-panel-hover">
                <div className="resource-mini-icon">
                  <FileText size={20} />
                </div>
                <div className="resource-mini-info">
                  <div className="resource-mini-title">{res.title}</div>
                  <div className="resource-mini-meta">
                    <span className="badge badge-normal text-xs">{res.category}</span>
                    <span>{(res.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
                <a
                  href={`http://localhost:4000${res.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-icon"
                  title="Download resource"
                >
                  <ArrowRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Next Class & Latest Announcement */}
        <div className="dashboard-col">
          {/* Next Class Session */}
          <div className="section-header">
            <div className="section-title-group">
              <Calendar size={18} style={{ color: activeDept.colorHex }} />
              <h2>Next Scheduled Class</h2>
            </div>
            <button className="text-link" onClick={() => onNavigate('schedule')}>
              <span>Full Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {upcomingSchedule ? (
            <div className="schedule-featured-card glass-panel">
              <div className="schedule-date-badge">
                <Clock size={16} />
                <span>
                  {new Date(upcomingSchedule.startTime).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h3 className="schedule-title-dash">{upcomingSchedule.title}</h3>
              <p className="schedule-desc-dash">{upcomingSchedule.description}</p>
              <div className="schedule-location-dash">
                <span className="loc-label">Location:</span>
                <span className="loc-val">{upcomingSchedule.location}</span>
              </div>
              {upcomingSchedule.meetingLink && (
                <a
                  href={upcomingSchedule.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary btn-sm mt-3"
                  style={{ width: 'fit-content' }}
                >
                  Join Virtual Session
                </a>
              )}
            </div>
          ) : (
            <div className="empty-card glass-panel">
              <p className="text-muted">No upcoming classes scheduled.</p>
            </div>
          )}

          {/* Latest Announcement */}
          <div className="section-header mt-6">
            <div className="section-title-group">
              <Megaphone size={18} style={{ color: activeDept.colorHex }} />
              <h2>Latest Announcement</h2>
            </div>
            <button className="text-link" onClick={() => onNavigate('announcements')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {latestAnnouncement ? (
            <div className="announcement-dash-card glass-panel">
              <div className="announcement-top">
                <span className={`badge badge-${latestAnnouncement.priority.toLowerCase()}`}>
                  {latestAnnouncement.priority}
                </span>
                <span className="announcement-date">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="announcement-title-dash">{latestAnnouncement.title}</h3>
              <p className="announcement-content-dash">{latestAnnouncement.content}</p>
            </div>
          ) : (
            <div className="empty-card glass-panel">
              <p className="text-muted">No announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
