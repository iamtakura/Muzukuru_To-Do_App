import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check token existence and finish loading state
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, username: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // Set initial user info (id will be updated by /protected fetch)
    const initialUser: User = { id: -1, username };
    localStorage.setItem('user', JSON.stringify(initialUser));
    setUser(initialUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const setUserInfo = (userInfo: User) => {
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;
