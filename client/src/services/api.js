import axios from 'axios';

const api = axios.create({
  baseURL: 'https://habitquest-fhyd.onrender.com',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hq_token');
      localStorage.removeItem('hq_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/auth/password', data),
};

// Habits
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  getOne: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
  getCalendar: (id, year, month) => api.get(`/habits/${id}/calendar`, { params: { year, month } }),
};

// Logs
export const logsAPI = {
  complete: (data) => api.post('/logs/complete', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/logs', { params }),
  getCalendar: (year, month) => api.get('/logs/calendar', { params: { year, month } }),
};

// Rewards
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  purchase: (reward_id) => api.post('/rewards/purchase', { reward_id }),
  getHistory: () => api.get('/rewards/purchases'),
};

// Social
export const socialAPI = {
  search: (q) => api.get('/social/search', { params: { q } }),
  getFriends: () => api.get('/social/friends'),
  getRequests: () => api.get('/social/requests'),
  sendRequest: (friend_id) => api.post('/social/friends/request', { friend_id }),
  respondRequest: (friendship_id, action) => api.post('/social/friends/respond', { friendship_id, action }),
  getUserProfile: (id) => api.get(`/social/users/${id}`),
};

// Stats
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

// Users
export const usersAPI = {
  getLeaderboard: () => api.get('/users/leaderboard'),
};

export default api;