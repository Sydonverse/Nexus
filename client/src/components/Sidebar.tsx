import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  KanbanSquare,
  Calendar,
  Megaphone,
  MessageSquare,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { DepartmentMemberContext } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'resources'
  | 'projects'
  | 'schedule'
  | 'announcements'
  | 'chat'
  | 'members';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeDept: DepartmentMemberContext | null;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeDept,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'Resources & Materials', icon: FolderGit2 },
    { id: 'projects', label: 'Projects & Progress', icon: KanbanSquare },
    { id: 'schedule', label: 'Class Scheduler', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Department Chat', icon: MessageSquare },
    { id: 'members', label: 'Members Directory', icon: Users },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-dept-card" style={{ borderColor: `${activeDept?.colorHex || '#6366f1'}33` }}>
        <div className="dept-card-top">
          <div className="status-online-dot"></div>
          <span className="dept-space-label">DEPARTMENT WORKSPACE</span>
        </div>
        <div className="dept-card-title">{activeDept?.name || 'Hub Central'}</div>
        <div className="dept-badge-role">
          <ShieldCheck size={12} />
          <span>Access: {activeDept?.memberRole || 'INTERN'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id as ActiveTab)}
              style={
                isActive
                  ? {
                      borderColor: activeDept?.colorHex || '#6366f1',
                      background: `linear-gradient(90deg, ${activeDept?.colorHex || '#6366f1'}22, transparent)`,
                      color: 'var(--text-primary)',
                    }
                  : {}
              }
            >
              <Icon
                size={18}
                style={isActive ? { color: activeDept?.colorHex || '#6366f1' } : {}}
              />
              <span className="nav-text">{item.label}</span>
              {isActive && <div className="active-indicator-bar" style={{ background: activeDept?.colorHex }} />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="pwa-badge">
          <div className="pwa-dot"></div>
          <div>
            <div className="pwa-title">Nexus PWA v1.0</div>
            <div className="pwa-sub">Offline Ready & Secure</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
