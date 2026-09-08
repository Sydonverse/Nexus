import React from 'react';
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
  const [showDeptMenu, setShowDeptMenu] = React.useState(false);
  const [showDemoMenu, setShowDemoMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield': return <Shield size={18} />;
      case 'bar-chart-2': return <BarChart2 size={18} />;
      case 'globe': return <Globe size={18} />;
      case 'box': return <Box size={18} />;
      case 'palette': return <Palette size={18} />;
      default: return <Globe size={18} />;
    }
  };

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        {/* Platform Brand */}
        <div className="brand-logo-group">
          <div className="logo-badge" style={{ borderColor: activeDept?.colorHex || '#6366f1' }}>
            <img src="/icons/icon-192.png" alt="Nexus" className="logo-img" />
          </div>
          <div>
            <div className="brand-title">NEXUS</div>
            <div className="brand-subtitle">Tech Hub Central</div>
          </div>
        </div>

        {/* Department Switcher Pill */}
        {activeDept && (
          <div className="dept-switcher-dropdown">
            <button
              className="dept-pill-btn"
              onClick={() => setShowDeptMenu(!showDeptMenu)}
              style={{
                borderColor: `${activeDept.colorHex}55`,
                background: `${activeDept.colorHex}15`,
              }}
            >
              <span style={{ color: activeDept.colorHex }}>{getDeptIcon(activeDept.icon)}</span>
              <span className="dept-name-text">{activeDept.name}</span>
              {departments.length > 1 && <ChevronDown size={14} className="text-muted" />}
            </button>

            {showDeptMenu && departments.length > 1 && (
              <div className="dropdown-menu">
                <div className="dropdown-header">Switch Department Workspace</div>
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
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Role: {dept.memberRole}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Hackathon Quick Demo Persona Switcher */}
        <div className="demo-persona-dropdown">
          <button
            className="demo-switch-btn"
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            title="Switch demo persona for instant hackathon evaluation"
          >
            <span className="demo-dot"></span>
            <span className="demo-label">Demo Persona</span>
            <ChevronDown size={14} />
          </button>

          {showDemoMenu && (
            <div className="dropdown-menu demo-dropdown">
              <div className="dropdown-header">⚡ One-Click Hackathon Persona Switch</div>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('admin@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar admin">AD</div>
                <div>
                  <div className="persona-name">Sarah Director</div>
                  <div className="persona-role">Admin (Cross-hub control)</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('cyber.tutor@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar tutor">AT</div>
                <div>
                  <div className="persona-name">Alex Vance</div>
                  <div className="persona-role">Cybersecurity Tutor</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('david.cyber@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar intern">DK</div>
                <div>
                  <div className="persona-name">David Kim</div>
                  <div className="persona-role">Cyber Intern (Group Alpha)</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('maya.cyber@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar intern">MP</div>
                <div>
                  <div className="persona-name">Maya Patel</div>
                  <div className="persona-role">Cyber Intern (Group Bravo)</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('data.tutor@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar tutor">ER</div>
                <div>
                  <div className="persona-name">Dr. Evelyn Reed</div>
                  <div className="persona-role">Data Analysis Tutor</div>
                </div>
              </button>
              <button
                className="dropdown-item"
                onClick={() => { onQuickLogin('sam.data@nexus.hub'); setShowDemoMenu(false); }}
              >
                <div className="persona-avatar intern">ST</div>
                <div>
                  <div className="persona-name">Sam Taylor</div>
                  <div className="persona-role">Data Analysis Intern</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Install PWA Button */}
        {canInstallPwa && (
          <button className="pwa-install-btn" onClick={onInstallPwa} title="Install App to Device">
            <Download size={15} />
            <span className="install-text">Install App</span>
          </button>
        )}

        {/* Notifications Bell */}
        <button
          className="btn-icon notif-btn"
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount}</span>}
        </button>

        {/* User Profile */}
        {user && (
          <div className="user-profile-dropdown">
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.firstName} className="avatar-img" />
              ) : (
                <div className="avatar-fallback">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}
              <div className="user-info-text">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-dropdown">
                <div className="dropdown-header">Signed in as {user.email}</div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => { onLogout(); setShowUserMenu(false); }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
