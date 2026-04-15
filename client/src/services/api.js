import axios from 'axios';

/**
 * ОПРЕДЕЛЕНИЕ URL СЕРВЕРА
 * Если ты открываешь сайт через localhost, запросы идут на локальный сервер.
 * Если сайт открыт по ссылке в интернете, запросы идут на Render.
 */
const isLocal = window.location.hostname === 'localhost';

// Ссылка на твой бэкенд на Render (убедись, что это именно ссылка Web Service, а не Static Site)
const PRODUCTION_API_URL = 'https://habitquest-sjyh.onrender.com/api'; 
const LOCAL_API_URL = 'http://localhost:5000/api';

const API_URL = isLocal ? LOCAL_API_URL : PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // Увеличил до 20 сек, так как бесплатный Render может долго "просыпаться"
});

/**
 * ПЕРЕХВАТЧИК ЗАПРОСОВ (ИНТЕРЦЕПТОР)
 * Автоматически добавляет JWT токен в каждый запрос, если юзер залогинен.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * ПЕРЕХВАТЧИК ОТВЕТОВ
 * Если сервер вернул 401 (токен просрочен), он выкидывает юзера на логин.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если токен невалидный или просрочен — разлогиниваем
    if (error.response?.status === 401) {
      localStorage.removeItem('hq_token');
      localStorage.removeItem('hq_user');
      // Делаем редирект на логин только если мы не и так на странице логина
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  // FormData используется для загрузки аватарок
  updateProfile: (data) => api.put('/auth/profile', data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  changePassword: (data) => api.put('/auth/password', data),
};

// --- HABITS API ---
export const habitsAPI = {
  getAll: () => api.get('/habits'),
  getOne: (id) => api.get(`/habits/${id}`),
  create: (data) => api.post('/habits', data),
  update: (id, data) => api.put(`/habits/${id}`, data),
  delete: (id) => api.delete(`/habits/${id}`),
};

// --- LOGS API (Выполнение привычек) ---
export const logsAPI = {
  // Загрузка доказательств (фото или текст)
  complete: (data) => api.post('/logs/complete', data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  getAll: (params) => api.get('/logs', { params }),
  getCalendar: (year, month) => api.get('/logs/calendar', { params: { year, month } }),
};

// --- REWARDS API ---
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  purchase: (reward_id) => api.post('/rewards/purchase', { reward_id }),
  getHistory: () => api.get('/rewards/purchases'),
};

// --- SOCIAL API ---
export const socialAPI = {
  search: (q) => api.get('/social/search', { params: { q } }),
  getFriends: () => api.get('/social/friends'),
  getRequests: () => api.get('/social/requests'),
  sendRequest: (friend_id) => api.post('/social/friends/request', { friend_id }),
  respondRequest: (friendship_id, action) => api.post('/social/friends/respond', { friendship_id, action }),
  getUserProfile: (id) => api.get(`/social/users/${id}`),
};

// --- STATS API ---
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

// --- LEADERBOARD ---
export const usersAPI = {
  getLeaderboard: () => api.get('/users/leaderboard'),
};

export default api;