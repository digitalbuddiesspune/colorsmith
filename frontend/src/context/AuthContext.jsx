import { createContext, useContext, useEffect, useState } from 'react';
import { auth as authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('colorsmith_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('colorsmith_admin_token');
    if (adminToken) {
      try {
        const stored = localStorage.getItem('colorsmith_user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch {}
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('colorsmith_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('colorsmith_user', JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('colorsmith_token');
        localStorage.removeItem('colorsmith_user');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth-logout', onLogout);
    return () => window.removeEventListener('auth-logout', onLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('colorsmith_token', data.token);
    localStorage.setItem('colorsmith_user', JSON.stringify(data));
    setUser(data);
    window.dispatchEvent(new Event('auth-login'));
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('colorsmith_token', data.token);
    localStorage.setItem('colorsmith_user', JSON.stringify(data));
    setUser(data);
    window.dispatchEvent(new Event('auth-login'));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('colorsmith_token');
    localStorage.removeItem('colorsmith_user');
    localStorage.removeItem('colorsmith_admin_token');
    setUser(null);
    window.dispatchEvent(new Event('auth-logout'));
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('colorsmith_user', JSON.stringify(newUser));
  };

  const loginAdmin = (token, admin) => {
    localStorage.setItem('colorsmith_admin_token', token);
    localStorage.removeItem('colorsmith_token');
    const userData = { ...admin, role: 'admin' };
    localStorage.setItem('colorsmith_user', JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('auth-login'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginAdmin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
