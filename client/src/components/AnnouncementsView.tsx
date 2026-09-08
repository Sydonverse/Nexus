import React from 'react';
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Announcement, DepartmentMemberContext } from '../types';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  activeDept: DepartmentMemberContext;
  isTutorOrAdmin: boolean;
  onOpenCreateModal: () => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  activeDept,
  isTutorOrAdmin,
  onOpenCreateModal,
  onDeleteAnnouncement,
}) => {
  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Department Announcements</h1>
          <p className="view-subtitle">
            Official broadcasts, hackathon deadlines, lab guidelines, and critical notices for {activeDept.name}.
          </p>
        </div>
        {isTutorOrAdmin && (
          <button className="btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <Megaphone size={48} className="text-muted" />
          <h3>No announcements yet</h3>
          <p className="text-muted">
            Important broadcasts from your tutors and hub directors will appear here.
          </p>
          {isTutorOrAdmin && (
            <button className="btn-primary mt-4" onClick={onOpenCreateModal}>
              <Plus size={16} />
              <span>Post First Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="announcements-feed">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`announcement-feed-card glass-panel glass-panel-hover ${
                ann.isPinned ? 'pinned-card' : ''
              }`}
            >
              {ann.isPinned && (
                <div className="pinned-badge-strip">
                  <Pin size={13} />
                  <span>PINNED ANNOUNCEMENT</span>
                </div>
              )}

              <div className="announcement-header-row">
                <div className="ann-author-box">
                  {ann.author?.avatarUrl ? (
                    <img
                      src={ann.author.avatarUrl}
                      alt={ann.author.firstName}
                      className="ann-avatar-img"
                    />
                  ) : (
                    <div className="ann-avatar-fallback">
                      {ann.author?.firstName?.[0]}
                      {ann.author?.lastName?.[0]}
                    </div>
                  )}
                  <div>
                    <div className="ann-author-name">
                      {ann.author?.firstName} {ann.author?.lastName}
                    </div>
                    <div className="ann-author-role">{ann.author?.role}</div>
                  </div>
                </div>

                <div className="ann-meta-actions">
                  <span className={`badge badge-${ann.priority.toLowerCase()}`}>
                    {ann.priority === 'URGENT' && <AlertTriangle size={12} />}
                    <span>{ann.priority}</span>
                  </span>

                  <span className="ann-date-text">
                    <Clock size={13} />
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </span>

                  {isTutorOrAdmin && (
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      title="Delete announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="ann-feed-title">{ann.title}</h2>
              <div className="ann-feed-content">{ann.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
