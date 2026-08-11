import axios from 'axios';

// Get backend API URL from environment variables or default to localhost:8080
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized globally and clear credentials
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event to let contexts know user is unauthorized
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

// Authentication Service Callbacks
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  
  register: async (name, email, password, role = 'USER') => {
    const response = await api.post('/api/auth/register', { name, email, password, role });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// AI Reply Generator Service Callbacks
export const replyService = {
  generate: async (emailSubject, emailBody, sender, tone) => {
    const response = await api.post('/api/replies/generate', {
      emailSubject,
      emailBody,
      sender,
      tone
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/replies/history');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/replies/${id}`);
    return response.data;
  },

  deleteById: async (id) => {
    const response = await api.delete(`/api/replies/${id}`);
    return response.data;
  }
};

// User Preferences Service Callbacks
export const userService = {
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  updatePreferences: async (preferredTone) => {
    const response = await api.put('/api/users/preferences', { preferredTone });
    // Update local cached user preference
    const user = authService.getCurrentUser();
    if (user) {
      user.preferredTone = preferredTone;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  }
};

// Asset Storage Service Callbacks
export const storageService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Returns { fileUrl: "..." } or metadata
  }
};

export default api;
