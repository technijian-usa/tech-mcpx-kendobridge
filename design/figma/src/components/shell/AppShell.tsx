import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { SidebarProvider } from '../ui/sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Loading handled by RootGuard
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 flex flex-col" role="main">
            <div className="flex-1 p-6">
              {children}
            </div>
            <AppFooter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}