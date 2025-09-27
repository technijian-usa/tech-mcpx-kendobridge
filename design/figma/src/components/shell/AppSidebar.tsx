import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { 
  LayoutDashboard, 
  Activity, 
  Settings, 
  Shield 
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Sessions',
    url: '/sessions',
    icon: Activity,
  },
  {
    title: 'Config',
    url: '/config',
    icon: Settings,
  },
  {
    title: 'Access Control',
    url: '/access',
    icon: Shield,
    requiresOpsAdmin: true,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredItems = NAVIGATION_ITEMS.filter(item => {
    if (item.requiresOpsAdmin && !user?.isOpsAdmin) {
      return false;
    }
    return true;
  });

  return (
    <Sidebar role="navigation" aria-label="Main navigation">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}