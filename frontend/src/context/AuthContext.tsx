import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'COORDINATOR' | 'ADMIN';
  admissionYear?: number;
  department?: { id: string; code: string; name: string };
  resume?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string, role?: string) => Promise<void>;
  registerStudent: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('placement_ready_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      setUser(res.user);
    } catch (e) {
      console.warn('Token verification failed:', e);
      localStorage.removeItem('placement_ready_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string, expectedRole?: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, expectedRole }),
    });
    localStorage.setItem('placement_ready_token', res.token);
    setUser(res.user);
  };

  const registerStudent = async (email: string, password: string) => {
    const res = await apiRequest('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('placement_ready_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('placement_ready_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerStudent, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
