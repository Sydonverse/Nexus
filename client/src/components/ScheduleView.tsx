import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { ClassSchedule, DepartmentMemberContext } from '../types';

interface ScheduleViewProps {
  schedules: ClassSchedule[];
  activeDept: DepartmentMemberContext;
  isTutorOrAdmin: boolean;
  onOpenScheduleModal: () => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  activeDept,
  isTutorOrAdmin,
  onOpenScheduleModal,
  onDeleteSchedule,
}) => {
  const now = Date.now();
  const upcoming = schedules.filter((s) => new Date(s.endTime).getTime() >= now);
  const past = schedules.filter((s) => new Date(s.endTime).getTime() < now);

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Class Schedule & Training Sessions</h1>
          <p className="view-subtitle">
            Live lectures, lab walkthroughs, and mentor workshops for {activeDept.name}.
          </p>
        </div>
        {isTutorOrAdmin && (
          <button className="btn-primary" onClick={onOpenScheduleModal}>
            <Plus size={16} />
            <span>Schedule New Class</span>
          </button>
        )}
      </div>

      {schedules.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <Calendar size={48} className="text-muted" />
          <h3>No classes scheduled</h3>
          <p className="text-muted">
            Tutors can schedule upcoming training sessions and hands-on labs.
          </p>
          {isTutorOrAdmin && (
            <button className="btn-primary mt-4" onClick={onOpenScheduleModal}>
              <Plus size={16} />
              <span>Schedule First Session</span>
            </button>
          )}
        </div>
      ) : (
        <div className="schedule-layout">
          {/* Upcoming Classes */}
          <div className="schedule-section">
            <h2 className="section-subtitle">
              <CalendarCheck size={18} className="text-accent" />
              <span>Upcoming Class Sessions ({upcoming.length})</span>
            </h2>

            {upcoming.length === 0 ? (
              <div className="empty-card glass-panel">
                <p className="text-muted">No upcoming sessions. Check back soon.</p>
              </div>
            ) : (
              <div className="schedule-cards-list">
                {upcoming.map((item) => {
                  const start = new Date(item.startTime);
                  const end = new Date(item.endTime);
                  return (
                    <div key={item.id} className="schedule-card glass-panel glass-panel-hover">
                      <div className="schedule-card-date-box" style={{ borderColor: activeDept.colorHex }}>
                        <span className="sched-month">
                          {start.toLocaleString('default', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="sched-day">{start.getDate()}</span>
                        <span className="sched-weekday">
                          {start.toLocaleString('default', { weekday: 'short' })}
                        </span>
                      </div>

                      <div className="schedule-card-body">
                        <div className="schedule-meta-row">
                          <span className="schedule-time-badge">
                            <Clock size={13} />
                            <span>
                              {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                          <span className="schedule-location-badge">
                            <MapPin size={13} />
                            <span>{item.location}</span>
                          </span>
                          {isTutorOrAdmin && (
                            <button
                              className="btn-icon btn-icon-danger ml-auto"
                              onClick={() => onDeleteSchedule(item.id)}
                              title="Cancel class"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>

                        <h3 className="schedule-item-title">{item.title}</h3>
                        <p className="schedule-item-desc">{item.description}</p>

                        <div className="schedule-footer-row">
                          <span className="schedule-instructor-tag">
                            Instructor: {item.scheduler?.firstName} {item.scheduler?.lastName}
                          </span>
                          {item.meetingLink && (
                            <a
                              href={item.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary btn-sm"
                            >
                              <Video size={14} />
                              <span>Join Virtual Room</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Classes */}
          {past.length > 0 && (
            <div className="schedule-section mt-8">
              <h2 className="section-subtitle text-muted">
                <span>Past Sessions Archive ({past.length})</span>
              </h2>
              <div className="schedule-cards-list past-list">
                {past.map((item) => (
                  <div key={item.id} className="schedule-card glass-panel opacity-70">
                    <div className="schedule-card-body">
                      <div className="schedule-meta-row">
                        <span className="text-muted text-xs">
                          {new Date(item.startTime).toLocaleDateString()}
                        </span>
                        <span className="schedule-location-badge text-xs">
                          {item.location}
                        </span>
                      </div>
                      <h4 className="schedule-item-title text-muted">{item.title}</h4>
                      <p className="schedule-item-desc text-muted text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
