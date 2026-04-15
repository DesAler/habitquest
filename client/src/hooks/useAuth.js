import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hq_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token = localStorage.getItem('hq_token');
      if (!token) { setLoading(false); return; }
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('hq_user', JSON.stringify(data.user));
    } catch {
      localStorage.removeItem('hq_token');
      localStorage.removeItem('hq_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('hq_token', data.token);
    localStorage.setItem('hq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (email, username, password) => {
    const { data } = await authAPI.register({ email, username, password });
    localStorage.setItem('hq_token', data.token);
    localStorage.setItem('hq_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hq_token');
    localStorage.removeItem('hq_user');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};