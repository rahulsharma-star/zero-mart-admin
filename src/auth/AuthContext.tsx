import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, unwrap } from '../api/client';

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: 'customer' | 'admin' | 'delivery';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('zero_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(unwrap(res).user))
      .catch(() => localStorage.removeItem('zero_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token: string, u: User) => {
    localStorage.setItem('zero_admin_token', token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('zero_admin_token');
    setUser(null);
    location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, loading, setSession, logout }}>{children}</AuthContext.Provider>;
}
