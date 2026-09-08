import React from 'react';
import { Users, GraduationCap, Award, ShieldCheck, Mail } from 'lucide-react';
import { DepartmentMember, DepartmentMemberContext } from '../types';

interface MembersViewProps {
  members: DepartmentMember[];
  activeDept: DepartmentMemberContext;
}

export const MembersView: React.FC<MembersViewProps> = ({ members, activeDept }) => {
  const tutors = members.filter((m) => m.role === 'TUTOR');
  const interns = members.filter((m) => m.role === 'INTERN');

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Department Members Directory</h1>
          <p className="view-subtitle">
            Approved tutors and interns actively enrolled in {activeDept.name}.
          </p>
        </div>
        <div className="members-count-badge">
          <Users size={16} className="text-accent" />
          <span>{members.length} Members Enrolled</span>
        </div>
      </div>

      {/* Instructors & Tutors Section */}
      <div className="members-section">
        <h2 className="section-subtitle">
          <Award size={18} className="text-accent" />
          <span>Department Instructors & Tutors ({tutors.length})</span>
        </h2>
        <div className="members-grid">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="member-card glass-panel glass-panel-hover">
              <div className="member-avatar-box">
                {tutor.user.avatarUrl ? (
                  <img src={tutor.user.avatarUrl} alt="" className="member-avatar-img" />
                ) : (
                  <div className="member-avatar-fallback">
                    {tutor.user.firstName[0]}{tutor.user.lastName[0]}
                  </div>
                )}
                <div className="tutor-badge-icon" title="Instructor">
                  <Award size={14} />
                </div>
              </div>

              <div className="member-info">
                <h3 className="member-name">
                  {tutor.user.firstName} {tutor.user.lastName}
                </h3>
                <span className="badge badge-normal text-xs">Instructor</span>
                <div className="member-email-row">
                  <Mail size={12} className="text-muted" />
                  <span>{tutor.user.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interns Section */}
      <div className="members-section mt-8">
        <h2 className="section-subtitle">
          <GraduationCap size={18} className="text-accent" />
          <span>Registered Interns ({interns.length})</span>
        </h2>
        <div className="members-grid">
          {interns.map((intern) => (
            <div key={intern.id} className="member-card glass-panel glass-panel-hover">
              <div className="member-avatar-box">
                {intern.user.avatarUrl ? (
                  <img src={intern.user.avatarUrl} alt="" className="member-avatar-img" />
                ) : (
                  <div className="member-avatar-fallback">
                    {intern.user.firstName[0]}{intern.user.lastName[0]}
                  </div>
                )}
              </div>

              <div className="member-info">
                <h3 className="member-name">
                  {intern.user.firstName} {intern.user.lastName}
                </h3>
                <span className="badge text-xs">Intern</span>
                <div className="member-email-row">
                  <Mail size={12} className="text-muted" />
                  <span>{intern.user.email}</span>
                </div>
                <div className="member-joined-text">
                  Joined: {new Date(intern.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
