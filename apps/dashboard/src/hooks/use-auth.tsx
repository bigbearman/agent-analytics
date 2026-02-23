import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';

interface AuthResponse {
  data: { accessToken: string };
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
