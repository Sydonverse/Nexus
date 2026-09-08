import React, { useState, useEffect, useCallback } from 'react';
import './styles/design-tokens.css';
import './styles/app.css';

import {
  User,
  DepartmentMemberContext,
  Department,
  Resource,
  Announcement,
  ClassSchedule,
  Project,
  Task,
  ChatMessage,
  AppNotification,
  DepartmentMember,
  TaskStatus,
} from './types';
import { api } from './services/api';
import { socketService } from './services/socket';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ResourcesView } from './components/ResourcesView';
import { ProjectsView } from './components/ProjectsView';
import { ScheduleView } from './components/ScheduleView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { ChatView } from './components/ChatView';
import { MembersView } from './components/MembersView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuthView } from './components/AuthView';

import {
  UploadResourceModal,
  CreateAnnouncementModal,
  ScheduleClassModal,
  CreateProjectModal,
  CreateTaskModal,
  SubmitWorkModal,
  GiveFeedbackModal,
} from './components/Modals';

export const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Department State
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [userDepartments, setUserDepartments] = useState<DepartmentMemberContext[]>([]);
  const [activeDept, setActiveDept] = useState<DepartmentMemberContext | null>(null);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Department Scoped Data
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<DepartmentMember[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Real-time typing
  const [typingUsers, setTypingUsers] = useState<{ userId: string; name: string }[]>([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState<Task | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [showSubmitWorkModal, setShowSubmitWorkModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // 1. Initial PWA & Service Worker Setup
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
    }

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  // 2. Fetch User Profile on load
  const loadMe = useCallback(async () => {
    setLoadingUser(true);
    try {
      const res = await api.auth.me();
      setUser(res.user);
      const depts: DepartmentMemberContext[] = res.user.departments || [];
      setUserDepartments(depts);

      if (depts.length > 0) {
        setActiveDept(depts[0]);
      }
    } catch (err) {
      api.removeToken();
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // 3. Fetch Public Departments list
  const loadAvailableDepartments = useCallback(async () => {
    try {
      const res = await api.departments.list();
      setAvailableDepartments(res.departments);
    } catch (err) {
      console.warn('Could not load public departments:', err);
    }
  }, []);

  useEffect(() => {
    loadMe();
    loadAvailableDepartments();
  }, [loadMe, loadAvailableDepartments]);

  // Auto-select department for Admin or if departments list becomes available
  useEffect(() => {
    if (user?.role === 'ADMIN' && (!activeDept || userDepartments.length === 0) && availableDepartments.length > 0) {
      const adminDepts: DepartmentMemberContext[] = availableDepartments.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        colorHex: d.colorHex,
        icon: d.icon,
        memberRole: 'ADMIN',
      }));
      setUserDepartments(adminDepts);
      if (!activeDept) {
        setActiveDept(adminDepts[0]);
      }
    }
  }, [user, activeDept, userDepartments.length, availableDepartments]);

  // 4. WebSocket connection lifecycle
  useEffect(() => {
    const token = localStorage.getItem('nexus_auth_token');
    if (user && token) {
      socketService.connect(token);

      const unsubMsg = socketService.onMessage((newMsg) => {
        if (activeDept && newMsg.departmentId === activeDept.id) {
          setMessages((prev) => [...prev, newMsg]);
        }
      });

      const unsubNotif = socketService.onNotification((newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((c) => c + 1);

        // Native Browser Notification if allowed
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.body,
            icon: '/icons/icon-192.png',
          });
        }
      });

      const unsubTyping = socketService.onTyping((data) => {
        if (activeDept && data.departmentSlug === activeDept.slug) {
          setTypingUsers((prev) => {
            if (prev.find((u) => u.userId === data.userId)) return prev;
            return [...prev, { userId: data.userId, name: data.name }];
          });
        }
      });

      const unsubStopTyping = socketService.onStopTyping((data) => {
        if (activeDept && data.departmentSlug === activeDept.slug) {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        }
      });

      return () => {
        unsubMsg();
        unsubNotif();
        unsubTyping();
        unsubStopTyping();
      };
    }
  }, [user, activeDept]);

  // 5. Update Dynamic CSS Theme Colors when active department changes
  useEffect(() => {
    if (activeDept) {
      document.documentElement.style.setProperty('--dept-accent', activeDept.colorHex);
      document.documentElement.style.setProperty(
        '--dept-glow',
        `${activeDept.colorHex}33`
      );
    }
  }, [activeDept]);

  // 6. Fetch Department Scoped Data
  const loadDepartmentData = useCallback(async () => {
    if (!activeDept) return;
    const slug = activeDept.slug;

    try {
      const [resRes, resAnn, resSched, resProj, resMsg, resMem, resNotif] =
        await Promise.allSettled([
          api.resources.list(slug),
          api.announcements.list(slug),
          api.schedules.list(slug),
          api.projects.list(slug),
          api.messages.list(slug),
          api.departments.members(slug),
          api.notifications.list(),
        ]);

      if (resRes.status === 'fulfilled') setResources(resRes.value.resources);
      if (resAnn.status === 'fulfilled') setAnnouncements(resAnn.value.announcements);
      if (resSched.status === 'fulfilled') setSchedules(resSched.value.schedules);
      if (resProj.status === 'fulfilled') setProjects(resProj.value.projects);
      if (resMsg.status === 'fulfilled') setMessages(resMsg.value.messages);
      if (resMem.status === 'fulfilled') setMembers(resMem.value.members);
      if (resNotif.status === 'fulfilled') {
        setNotifications(resNotif.value.notifications);
        setUnreadCount(resNotif.value.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  }, [activeDept]);

  useEffect(() => {
    if (user && activeDept) {
      loadDepartmentData();
    }
  }, [user, activeDept, loadDepartmentData]);

  // Auth Handlers
  const handleLogin = async (email: string, password?: string) => {
    const res = await api.auth.login({ email, password: password || 'password123' });
    api.setToken(res.token);
    setUser(res.user);
    const depts: DepartmentMemberContext[] = res.user.departments || [];
    setUserDepartments(depts);
    if (depts.length > 0) {
      setActiveDept(depts[0]);
    }
  };

  const handleRegister = async (data: any) => {
    const res = await api.auth.register(data);
    api.setToken(res.token);
    await loadMe();
  };

  const handleLogout = () => {
    api.removeToken();
    socketService.disconnect();
    setUser(null);
    setActiveDept(null);
  };

  // Resource Upload
  const handleUploadResource = async (formData: FormData) => {
    if (!activeDept) return;
    await api.resources.upload(activeDept.slug, formData);
    await loadDepartmentData();
  };

  const handleDeleteResource = async (id: string) => {
    if (!activeDept) return;
    await api.resources.delete(activeDept.slug, id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  // Announcement Handlers
  const handleCreateAnnouncement = async (data: any) => {
    if (!activeDept) return;
    await api.announcements.create(activeDept.slug, data);
    await loadDepartmentData();
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!activeDept) return;
    await api.announcements.delete(activeDept.slug, id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Schedule Handlers
  const handleCreateSchedule = async (data: any) => {
    if (!activeDept) return;
    await api.schedules.create(activeDept.slug, data);
    await loadDepartmentData();
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!activeDept) return;
    await api.schedules.delete(activeDept.slug, id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Project Handlers
  const handleCreateProject = async (data: any) => {
    if (!activeDept) return;
    await api.projects.create(activeDept.slug, data);
    await loadDepartmentData();
  };

  const handleCreateTask = async (data: any) => {
    if (!activeDept || !projects[0]) return;
    await api.projects.createTask(activeDept.slug, projects[0].id, data);
    await loadDepartmentData();
  };

  const handleUpdateTaskStatus = async (
    projectId: string,
    taskId: string,
    status: TaskStatus
  ) => {
    if (!activeDept) return;
    await api.projects.updateTaskStatus(activeDept.slug, projectId, taskId, status);
    await loadDepartmentData();
  };

  const handleSubmitWork = async (formData: FormData) => {
    if (!activeDept || !projects[0] || !activeTaskForModal) return;
    await api.projects.submitWork(
      activeDept.slug,
      projects[0].id,
      activeTaskForModal.id,
      formData
    );
    await loadDepartmentData();
  };

  const handleGiveFeedback = async (data: any) => {
    if (!activeDept || !projects[0] || !activeTaskForModal || !activeSubmissionId) return;
    await api.projects.giveFeedback(
      activeDept.slug,
      projects[0].id,
      activeTaskForModal.id,
      activeSubmissionId,
      data
    );
    await loadDepartmentData();
  };

  // Chat Send
  const handleSendMessage = async (content: string) => {
    if (!activeDept) return;
    socketService.sendMessage(activeDept.slug, content);
  };

  // Notifications
  const handleMarkRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleEnablePush = async () => {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        alert('Push notifications are not supported on this browser.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission was denied.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const { publicKey } = await api.notifications.getVapidKey();

      // Convert VAPID key to Uint8Array
      const rawData = window.atob(publicKey.replace(/-/g, '+').replace(/_/g, '/'));
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      });

      const subJson = subscription.toJSON();
      await api.notifications.subscribePush({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        userAgent: navigator.userAgent,
      });

      setPushEnabled(true);
      alert('✅ Push notifications activated for your department!');
    } catch (err) {
      console.error('Push activation failed:', err);
    }
  };

  if (loadingUser) {
    return (
      <div className="auth-page-container">
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <div className="status-online-dot mb-3"></div>
          <h2>Loading Nexus Tech Hub Workspace...</h2>
        </div>
      </div>
    );
  }

  // If not logged in, render AuthView
  if (!user) {
    return (
      <AuthView
        onLogin={handleLogin}
        onRegister={handleRegister}
        availableDepartments={availableDepartments}
      />
    );
  }

  const isTutorOrAdmin =
    user.role === 'ADMIN' || activeDept?.memberRole === 'TUTOR';

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeDept={activeDept}
        departments={userDepartments}
        onSelectDept={setActiveDept}
        notifications={notifications}
        unreadCount={unreadCount}
        onOpenNotifications={() => setShowNotifDrawer(true)}
        onLogout={handleLogout}
        onQuickLogin={handleLogin}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeDept={activeDept}
          unreadCount={unreadCount}
          currentUser={user}
        />

        {/* View Content */}
        <main className="main-content">
          {activeDept ? (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  activeDept={activeDept}
                  resources={resources}
                  announcements={announcements}
                  schedules={schedules}
                  projects={projects}
                  onNavigate={setActiveTab}
                  isTutorOrAdmin={isTutorOrAdmin}
                  onOpenUpload={() => setShowUploadModal(true)}
                  onOpenSchedule={() => setShowScheduleModal(true)}
                />
              )}

              {activeTab === 'resources' && (
                <ResourcesView
                  resources={resources}
                  activeDept={activeDept}
                  isTutorOrAdmin={isTutorOrAdmin}
                  onOpenUpload={() => setShowUploadModal(true)}
                  onDeleteResource={handleDeleteResource}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  activeDept={activeDept}
                  isTutorOrAdmin={isTutorOrAdmin}
                  onOpenCreateProject={() => setShowCreateProjectModal(true)}
                  onOpenCreateTask={() => setShowCreateTaskModal(true)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onOpenSubmitWork={(_pid, task) => {
                    setActiveTaskForModal(task);
                    setShowSubmitWorkModal(true);
                  }}
                  onOpenFeedback={(_pid, task, subId) => {
                    setActiveTaskForModal(task);
                    setActiveSubmissionId(subId);
                    setShowFeedbackModal(true);
                  }}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  schedules={schedules}
                  activeDept={activeDept}
                  isTutorOrAdmin={isTutorOrAdmin}
                  onOpenScheduleModal={() => setShowScheduleModal(true)}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              )}

              {activeTab === 'announcements' && (
                <AnnouncementsView
                  announcements={announcements}
                  activeDept={activeDept}
                  isTutorOrAdmin={isTutorOrAdmin}
                  onOpenCreateModal={() => setShowAnnouncementModal(true)}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                />
              )}

              {activeTab === 'chat' && (
                <ChatView
                  messages={messages}
                  activeDept={activeDept}
                  currentUser={user}
                  onSendMessage={handleSendMessage}
                  typingUsers={typingUsers}
                />
              )}

              {activeTab === 'members' && (
                <MembersView members={members} activeDept={activeDept} />
              )}
            </>
          ) : user?.role === 'ADMIN' ? (
            <div className="empty-state-card glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
              <h2>Hub Administrator Workspace</h2>
              <p className="text-muted" style={{ marginBottom: '20px' }}>
                Select any department below to view and manage its resources, projects, and activities:
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {availableDepartments.map((dept) => (
                  <button
                    key={dept.id}
                    className="btn-primary"
                    style={{ background: dept.colorHex }}
                    onClick={() => {
                      const adminContext: DepartmentMemberContext = {
                        id: dept.id,
                        name: dept.name,
                        slug: dept.slug,
                        colorHex: dept.colorHex,
                        icon: dept.icon,
                        memberRole: 'ADMIN',
                      };
                      setActiveDept(adminContext);
                    }}
                  >
                    <span>{dept.name} Space</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state-card glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
              <h2>No Department Enrolled</h2>
              <p className="text-muted" style={{ marginBottom: '20px' }}>
                Choose a department to join and submit your enrollment request:
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {availableDepartments.map((dept) => (
                  <button
                    key={dept.id}
                    className="btn-secondary"
                    onClick={async () => {
                      await api.departments.join(dept.slug);
                      await loadMe();
                    }}
                  >
                    Join {dept.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onEnablePush={handleEnablePush}
        pushEnabled={pushEnabled}
      />

      {/* Modals */}
      {activeDept && (
        <>
          <UploadResourceModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUploadResource}
            activeDept={activeDept}
          />

          <CreateAnnouncementModal
            isOpen={showAnnouncementModal}
            onClose={() => setShowAnnouncementModal(false)}
            onCreate={handleCreateAnnouncement}
          />

          <ScheduleClassModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            onSchedule={handleCreateSchedule}
          />

          <CreateProjectModal
            isOpen={showCreateProjectModal}
            onClose={() => setShowCreateProjectModal(false)}
            onCreate={handleCreateProject}
          />

          <CreateTaskModal
            isOpen={showCreateTaskModal}
            onClose={() => setShowCreateTaskModal(false)}
            projectId={projects[0]?.id || ''}
            onCreate={handleCreateTask}
          />

          <SubmitWorkModal
            isOpen={showSubmitWorkModal}
            onClose={() => setShowSubmitWorkModal(false)}
            task={activeTaskForModal}
            onSubmitWork={handleSubmitWork}
          />

          <GiveFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            task={activeTaskForModal}
            submissionId={activeSubmissionId}
            onGiveFeedback={handleGiveFeedback}
          />
        </>
      )}
    </div>
  );
};

export default App;
