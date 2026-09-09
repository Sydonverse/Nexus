import React, { useState } from 'react';
import {
  Bell,
  Download,
  LogOut,
  Shield,
  BarChart2,
  Globe,
  Box,
  Palette,
  ChevronDown,
  User as UserIcon,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { User, DepartmentMemberContext, AppNotification } from '../types';

interface NavbarProps {
  user: User | null;
  activeDept: DepartmentMemberContext | null;
  departments: DepartmentMemberContext[];
  onSelectDept: (dept: DepartmentMemberContext) => void;
  notifications: AppNotification[];
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
  onQuickLogin: (email: string) => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeDept,
  departments,
  onSelectDept,
  unreadCount,
  onOpenNotifications,
  onLogout,
  onQuickLogin,
  canInstallPwa,
  onInstallPwa,
}) => {
  const [showDeptMenu, setShowDeptMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return <Shield size={16} />;
      case 'bar-chart-2':
        return <BarChart2 size={16} />;
      case 'globe':
        return <Globe size={16} />;
      case 'box':
        return <Box size={16} />;
      case 'palette':
        return <Palette size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  const roleBadgeClass =
    user?.role === 'ADMIN'
      ? 'badge-role-admin'
      : user?.role === 'TUTOR'
      ? 'badge-role-tutor'
      : 'badge-role-intern';

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        {/* Knowvia Brand Logo */}
        <div className="brand-logo-group">
          <div className="logo-badge" style={{ background: activeDept?.colorHex || '#4f46e5' }}>
            <BookOpen size={20} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">Knowvia</div>
            <div className="brand-subtitle">Knowledge Repository & Learning Hub</div>
          </div>
        </div>

        {/* Department Badge / Switcher */}
        {activeDept && (
          <div className="dept-switcher-dropdown">
            <button
              className="dept-pill-btn"
              onClick={() => {
                if (user?.role === 'ADMIN' && departments.length > 1) {
                  setShowDeptMenu(!showDeptMenu);
                }
              }}
              style={{
                borderColor: `${activeDept.colorHex}40`,
                background: `${activeDept.colorHex}10`,
                cursor: user?.role === 'ADMIN' && departments.length > 1 ? 'pointer' : 'default',
              }}
              title={
                user?.role === 'ADMIN'
                  ? 'Click to switch department workspace'
                  : `Enrolled Department: ${activeDept.name}`
              }
            >
              <span style={{ color: activeDept.colorHex }}>{getDeptIcon(activeDept.icon)}</span>
              <span className="dept-name-text">{activeDept.name}</span>
              {user?.role === 'ADMIN' && departments.length > 1 && (
                <ChevronDown size={14} className="text-muted" />
              )}
            </button>

            {showDeptMenu && user?.role === 'ADMIN' && departments.length > 1 && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Administrator: Switch Department</div>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    className={`dropdown-item ${dept.id === activeDept.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelectDept(dept);
                      setShowDeptMenu(false);
                    }}
                  >
                    <span style={{ color: dept.colorHex }}>{getDeptIcon(dept.icon)}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div className="dropdown-item-title">{dept.name}</div>
                      <div className="dropdown-item-desc">{dept.description?.slice(0, 50)}...</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* PWA Install Button */}
        {canInstallPwa && (
          <button className="btn-secondary btn-sm pwa-install-btn" onClick={onInstallPwa}>
            <Download size={15} />
            <span>Install App</span>
          </button>
        )}

        {/* Quick Demo Switcher for Evaluation */}
        <div className="relative-container">
          <button
            className="btn-demo-pill"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            title="Switch Demo Role"
          >
            <Sparkles size={14} />
            <span>Switch Role</span>
            <ChevronDown size={12} />
          </button>

          {showDemoMenu && (
            <div className="dropdown-menu demo-dropdown">
              <div className="dropdown-header">Switch Demo User</div>
              <button
                className="dropdown-item"
                onClick={() => {
                  onQuickLogin('admin@knowvia.internal');
                  setShowDemoMenu(false);
                }}
              >
                <div className="demo-dot admin-dot"></div>
                <div>
                  <strong>Sarah Director</strong>
                  <span className="demo-role-tag">ADMIN</span>
                  <div className="demo-hint">Global oversight across all departments</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onQuickLogin('cyber.tutor@knowvia.internal');
                  setShowDemoMenu(false);
                }}
              >
                <div className="demo-dot tutor-dot"></div>
                <div>
                  <strong>Alex Vance</strong>
                  <span className="demo-role-tag">TUTOR (Cyber)</span>
                  <div className="demo-hint">Schedule classes, upload materials, create & review assignments</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onQuickLogin('david.cyber@knowvia.internal');
                  setShowDemoMenu(false);
                }}
              >
                <div className="demo-dot intern-dot"></div>
                <div>
                  <strong>David Kim</strong>
                  <span className="demo-role-tag">STUDENT (Cyber)</span>
                  <div className="demo-hint">View timetable, download materials, progress tracker, submit work</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onQuickLogin('maya.cyber@knowvia.internal');
                  setShowDemoMenu(false);
                }}
              >
                <div className="demo-dot intern-dot"></div>
                <div>
                  <strong>Maya Patel</strong>
                  <span className="demo-role-tag">STUDENT (Cyber)</span>
                  <div className="demo-hint">Assigned work needing revision</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onQuickLogin('web.tutor@knowvia.internal');
                  setShowDemoMenu(false);
                }}
              >
                <div className="demo-dot tutor-dot"></div>
                <div>
                  <strong>Marcus Chen</strong>
                  <span className="demo-role-tag">TUTOR (Web Dev)</span>
                  <div className="demo-hint">Web Dev department workspace</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Bell Icon Notification Button */}
        <button
          className="icon-btn-pill notif-bell-btn"
          onClick={onOpenNotifications}
          aria-label="Announcements and Notifications"
          title="Announcements & Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* User Profile Card & Sign Out */}
        <div className="relative-container">
          <button
            className="user-profile-pill"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} className="avatar-img-sm" />
            ) : (
              <div className="avatar-fallback-sm">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            )}
            <div className="user-profile-meta">
              <span className="user-profile-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className={`user-role-chip ${roleBadgeClass}`}>
                {user?.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {showUserMenu && (
            <div className="dropdown-menu user-dropdown">
              <div className="dropdown-user-header">
                <div className="dropdown-user-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="dropdown-user-email">{user?.email}</div>
                <div className="dropdown-user-role">Role: {user?.role}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item text-danger"
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
