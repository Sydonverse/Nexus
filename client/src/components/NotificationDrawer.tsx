import React from 'react';
import { X, CheckCheck, Bell, BellRing, ExternalLink } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onEnablePush: () => void;
  pushEnabled: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onEnablePush,
  pushEnabled,
}) => {
  if (!isOpen) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <span className="badge badge-urgent">Announcement</span>;
      case 'CLASS_SCHEDULE':
        return <span className="badge badge-normal">Class</span>;
      case 'PROJECT_UPDATE':
      case 'TASK_ASSIGNED':
        return <span className="badge badge-important">Project</span>;
      case 'FEEDBACK':
        return <span className="badge badge-normal">Feedback</span>;
      case 'RESOURCE':
        return <span className="badge badge-normal">Resource</span>;
      default:
        return <span className="badge">Update</span>;
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Bell size={20} className="text-accent" />
            <span className="drawer-title">Notifications</span>
            {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} new</span>}
          </div>
          <div className="drawer-actions">
            {unreadCount > 0 && (
              <button className="btn-icon" onClick={onMarkAllRead} title="Mark all as read">
                <CheckCheck size={18} />
              </button>
            )}
            <button className="btn-icon" onClick={onClose} title="Close drawer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Web Push Banner */}
        <div className="push-permission-card">
          <div className="push-icon-box">
            <BellRing size={20} />
          </div>
          <div className="push-content">
            <div className="push-title">Mobile Push Notifications</div>
            <div className="push-desc">
              {pushEnabled
                ? 'Push alerts are active for your registered department.'
                : 'Receive instant notifications on announcements and schedules.'}
            </div>
            {!pushEnabled && (
              <button className="btn-primary btn-sm mt-2" onClick={onEnablePush}>
                Enable Push Alerts
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="drawer-body">
          {notifications.length === 0 ? (
            <div className="empty-state-drawer">
              <Bell size={36} className="text-muted" />
              <p>No notifications yet</p>
              <span className="text-muted text-xs">Department updates will appear here</span>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
              >
                <div className="notif-top">
                  {getTypeBadge(notif.type)}
                  <span className="notif-time">
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="notif-item-title">{notif.title}</div>
                <div className="notif-item-body">{notif.body}</div>
                {!notif.isRead && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
