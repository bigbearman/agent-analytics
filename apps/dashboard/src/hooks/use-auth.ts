import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface AuthResponse {
  data: { accessToken: string };
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('aa_token'),
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('aa_token', res.data.accessToken);
    setToken(res.data.accessToken);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, name });
    localStorage.setItem('aa_token', res.data.accessToken);
    setToken(res.data.accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aa_token');
    setToken(null);
  }, []);

  return {
    isAuthenticated: !!token,
    token,
    login,
    register,
    logout,
  };
}
