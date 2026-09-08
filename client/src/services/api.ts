const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('nexus_auth_token');
  }

  public setToken(token: string) {
    localStorage.setItem('nexus_auth_token', token);
  }

  public removeToken() {
    localStorage.removeItem('nexus_auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  public auth = {
    login: (body: any) => this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => this.request<any>('/auth/me'),
  };

  // Departments
  public departments = {
    list: () => this.request<{ departments: any[] }>('/departments'),
    get: (slug: string) => this.request<any>(`/departments/${slug}`),
    join: (slug: string) => this.request<any>(`/departments/${slug}/join`, { method: 'POST' }),
    members: (slug: string) => this.request<{ members: any[] }>(`/departments/${slug}/members`),
    updateMember: (slug: string, memberId: string, data: any) =>
      this.request<any>(`/departments/${slug}/members/${memberId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  };

  // Resources
  public resources = {
    list: (slug: string, params?: { category?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString();
      return this.request<{ resources: any[] }>(`/departments/${slug}/resources${qs ? `?${qs}` : ''}`);
    },
    upload: (slug: string, formData: FormData) =>
      this.request<any>(`/departments/${slug}/resources`, { method: 'POST', body: formData }),
    delete: (slug: string, id: string) =>
      this.request<any>(`/departments/${slug}/resources/${id}`, { method: 'DELETE' }),
  };

  // Announcements
  public announcements = {
    list: (slug: string) => this.request<{ announcements: any[] }>(`/departments/${slug}/announcements`),
    create: (slug: string, data: any) =>
      this.request<any>(`/departments/${slug}/announcements`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (slug: string, id: string) =>
      this.request<any>(`/departments/${slug}/announcements/${id}`, { method: 'DELETE' }),
  };

  // Schedules
  public schedules = {
    list: (slug: string) => this.request<{ schedules: any[] }>(`/departments/${slug}/schedules`),
    create: (slug: string, data: any) =>
      this.request<any>(`/departments/${slug}/schedules`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (slug: string, id: string) =>
      this.request<any>(`/departments/${slug}/schedules/${id}`, { method: 'DELETE' }),
  };

  // Projects
  public projects = {
    list: (slug: string) => this.request<{ projects: any[] }>(`/departments/${slug}/projects`),
    get: (slug: string, projectId: string) =>
      this.request<{ project: any }>(`/departments/${slug}/projects/${projectId}`),
    create: (slug: string, data: any) =>
      this.request<any>(`/departments/${slug}/projects`, { method: 'POST', body: JSON.stringify(data) }),
    createGroup: (slug: string, projectId: string, data: any) =>
      this.request<any>(`/departments/${slug}/projects/${projectId}/groups`, { method: 'POST', body: JSON.stringify(data) }),
    createTask: (slug: string, projectId: string, data: any) =>
      this.request<any>(`/departments/${slug}/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
    updateTaskStatus: (slug: string, projectId: string, taskId: string, status: string) =>
      this.request<any>(`/departments/${slug}/projects/${projectId}/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    submitWork: (slug: string, projectId: string, taskId: string, formData: FormData) =>
      this.request<any>(`/departments/${slug}/projects/${projectId}/tasks/${taskId}/submissions`, {
        method: 'POST',
        body: formData,
      }),
    giveFeedback: (slug: string, projectId: string, taskId: string, submissionId: string, data: any) =>
      this.request<any>(
        `/departments/${slug}/projects/${projectId}/tasks/${taskId}/submissions/${submissionId}/feedback`,
        { method: 'POST', body: JSON.stringify(data) }
      ),
  };

  // Messages
  public messages = {
    list: (slug: string, limit = 50) =>
      this.request<{ messages: any[] }>(`/departments/${slug}/messages?limit=${limit}`),
    send: (slug: string, data: { content: string; attachmentUrls?: string[] }) =>
      this.request<any>(`/departments/${slug}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  };

  // Notifications & Push
  public notifications = {
    list: () => this.request<{ notifications: any[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) => this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => this.request<any>('/notifications/read-all', { method: 'POST' }),
    getVapidKey: () => this.request<{ publicKey: string }>('/notifications/vapid-key'),
    subscribePush: (data: any) => this.request<any>('/notifications/subscribe', { method: 'POST', body: JSON.stringify(data) }),
    unsubscribePush: (endpoint: string) =>
      this.request<any>('/notifications/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) }),
  };
}

export const api = new ApiClient();
