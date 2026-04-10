import { createContext, useContext, useState, ReactNode } from 'react';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, type: UserType) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      type: type!
    });
  };

  const register = async (name: string, email: string, password: string, type: UserType) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      type: type!
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
