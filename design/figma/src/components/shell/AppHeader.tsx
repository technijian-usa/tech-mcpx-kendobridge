import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '../ui/breadcrumb';
import { SidebarTrigger } from '../ui/sidebar';
import { LogOut, User } from 'lucide-react';

const ENVIRONMENT = 'Alpha'; // This would come from config

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sessions': 'Sessions',
  '/config': 'Configuration',
  '/access': 'Access Control'
};

export function AppHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentPageName = BREADCRUMB_MAP[location.pathname] || 'Dashboard';

  const handleSignOut = () => {
    logout();
    window.location.href = '/login';
  };

  const getEnvironmentVariant = (env: string) => {
    switch (env.toLowerCase()) {
      case 'prod': return 'default';
      case 'rtm': return 'secondary';
      case 'beta': return 'outline';
      case 'alpha': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold">MCPX-KendoBridge</span>
            <span className="text-muted-foreground">Admin Portal</span>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {location.pathname !== '/dashboard' && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem aria-current="page">
                    <span>{currentPageName}</span>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant={getEnvironmentVariant(ENVIRONMENT)}>
            {ENVIRONMENT}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback>
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.name && <p className="font-medium">{user.name}</p>}
                  {user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}