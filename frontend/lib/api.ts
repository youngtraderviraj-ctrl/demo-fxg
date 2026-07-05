import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};

export const clientsAPI = {
  getAll: (params?: any) => api.get('/admin/clients', { params }),
  getById: (id: string) => api.get(`/admin/clients/${id}`),
  create: (data: any) => api.post('/admin/clients', data),
  update: (id: string, data: any) => api.put(`/admin/clients/${id}`, data),
  delete: (id: string) => api.delete(`/admin/clients/${id}`),
};

export const invoicesAPI = {
  getAll: (params?: any) => api.get('/admin/invoices', { params }),
  getById: (id: string) => api.get(`/admin/invoices/${id}`),
  create: (data: any) => api.post('/admin/invoices', data),
  update: (id: string, data: any) => api.put(`/admin/invoices/${id}`, data),
  generateWeekly: () => api.post('/admin/invoices/generate-weekly'),
};

export const mt5API = {
  sync: (clientIds?: string[]) =>
    api.post('/admin/mt5/sync', { client_ids: clientIds }),
};

export const telegramAPI = {
  send: (clientId: string, message: string, subject?: string) =>
    api.post('/admin/telegram/send', { client_id: clientId, message, subject }),
  
  broadcast: (message: string, clientIds?: string[], filterStatus?: string, subject?: string) =>
    api.post('/admin/telegram/broadcast', {
      message,
      client_ids: clientIds,
      filter_status: filterStatus,
      subject,
    }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/admin/analytics/dashboard'),
};

export const clientPortalAPI = {
  getDashboard: () => api.get('/client/dashboard'),
  getInvoices: (params?: any) => api.get('/client/invoices', { params }),
  getProfile: () => api.get('/client/profile'),
  updateProfile: (data: any) => api.put('/client/profile', data),
};
