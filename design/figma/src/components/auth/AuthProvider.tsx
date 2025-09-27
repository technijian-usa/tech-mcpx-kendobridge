import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOpsAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<boolean>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkSession = async (): Promise<boolean> => {
    try {
      // Add a small delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check for stored user
      const storedUser = localStorage.getItem('mcpx_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear any corrupted data
      localStorage.removeItem('mcpx_user');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    try {
      // Simulate Azure SSO login
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@company.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        isOpsAdmin: true // For demo purposes
      };
      
      localStorage.setItem('mcpx_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('mcpx_user');
    setUser(null);
  };

  useEffect(() => {
    // Initialize auth state on mount
    const initializeAuth = async () => {
      await checkSession();
    };
    
    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}