import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isOpsAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function SimpleAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (): Promise<void> => {
    const mockUser: User = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john.doe@company.com',
      isOpsAdmin: true
    };
    
    localStorage.setItem('mcpx_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = (): void => {
    localStorage.removeItem('mcpx_user');
    setUser(null);
  };

  useEffect(() => {
    // Simple initialization
    const storedUser = localStorage.getItem('mcpx_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('mcpx_user');
      }
    }
    setIsLoading(false);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}