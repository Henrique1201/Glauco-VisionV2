import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = 'http://localhost:8000/api';

type UserType = 'patient' | 'doctor' | null;

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: UserType) => Promise<void>;
  register: (name: string, email: string, password: string, type: UserType) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper para chamadas autenticadas à API.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('avicena_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Não definir Content-Type para FormData (o browser define automaticamente com boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(error.detail || `Erro ${res.status}`);
  }

  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('avicena_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('avicena_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('avicena_user');
      localStorage.removeItem('avicena_token');
    }
  }, [user]);

  const login = async (email: string, password: string, type: UserType) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, type }),
    });

    localStorage.setItem('avicena_token', data.token);
    setUser({
      id: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      type: data.user.type as UserType,
    });
  };

  const register = async (name: string, email: string, password: string, type: UserType) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, type }),
    });

    localStorage.setItem('avicena_token', data.token);
    setUser({
      id: String(data.user.id),
      name: data.user.name,
      email: data.user.email,
      type: data.user.type as UserType,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
