import { useState } from 'react';

interface DashboardProps {
  onLogout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  permissions: string[];
}

interface ConfigSetting {
  key: string;
  value: string;
  description: string;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newUserRole, setNewUserRole] = useState('read-only');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [editingConfig, setEditingConfig] = useState<{category: string, setting: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [users, setUsers] = useState<User[]>([
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@contoso.com', 
      role: 'Super Admin', 
      status: 'Active', 
      lastLogin: '2 min ago',
      permissions: ['full-access', 'user-management', 'system-config']
    },
    { 
      id: '2', 
      name: 'Sarah Smith', 
      email: 'sarah.smith@contoso.com', 
      role: 'Operations Admin', 
      status: 'Active', 
      lastLogin: '5 min ago',
      permissions: ['dashboard-access', 'session-management', 'health-monitoring']
    },
    { 
      id: '3', 
      name: 'Mike Wilson', 
      email: 'mike.wilson@contoso.com', 
      role: 'Read Only', 
      status: 'Active', 
      lastLogin: '8 min ago',
      permissions: ['dashboard-view']
    },
    { 
      id: '4', 
      name: 'Lisa Brown', 
      email: 'lisa.brown@contoso.com', 
      role: 'System Admin', 
      status: 'Active', 
      lastLogin: '12 min ago',
      permissions: ['full-access', 'system-config', 'health-monitoring']
    },
    { 
      id: '5', 
      name: 'David Garcia', 
      email: 'david.garcia@contoso.com', 
      role: 'Operations Admin', 
      status: 'Inactive', 
      lastLogin: '3 days ago',
      permissions: ['dashboard-access', 'session-management']
    },
  ]);
  const [configurations, setConfigurations] = useState([
    { 
      category: 'Authentication', 
      settings: [
        { key: 'Session Timeout', value: '8 hours', description: 'Automatic logout after inactivity' },
        { key: 'MFA Required', value: 'Enabled', description: 'Multi-factor authentication for all users' },
        { key: 'Password Policy', value: 'Strong', description: 'Minimum 12 characters with complexity' }
      ]
    },
    { 
      category: 'API Gateway', 
      settings: [
        { key: 'Rate Limit', value: '1000/min', description: 'Maximum requests per minute per user' },
        { key: 'Timeout', value: '30 seconds', description: 'Request timeout duration' },
        { key: 'Retry Policy', value: '3 attempts', description: 'Number of retry attempts for failed requests' }
      ]
    },
    { 
      category: 'Database', 
      settings: [
        { key: 'Connection Pool', value: '50 connections', description: 'Maximum concurrent database connections' },
        { key: 'Query Timeout', value: '45 seconds', description: 'Maximum query execution time' },
        { key: 'Backup Schedule', value: 'Daily at 2 AM', description: 'Automated database backup schedule' }
      ]
    },
    { 
      category: 'Logging & Monitoring', 
      settings: [
        { key: 'Log Level', value: 'INFO', description: 'Minimum log level for system events' },
        { key: 'Retention Period', value: '90 days', description: 'How long to keep log data' },
        { key: 'Alert Threshold', value: '95%', description: 'System resource usage alert threshold' }
      ]
    }
  ]);

  // Utility functions
  const exportSessions = () => {
    const csvContent = [
      // CSV Header
      ['User', 'Role', 'Location', 'Device', 'Duration', 'Last Activity', 'IP Address'].join(','),
      // CSV Data
      ...activeSessions.map(session => [
        session.user,
        session.role,
        session.location,
        session.device,
        session.duration,
        session.lastActivity,
        session.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `active-sessions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSuccessMessage('Sessions exported successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleEditConfig = (category: string, setting: string, currentValue: string) => {
    setEditingConfig({ category, setting });
    setEditingValue(currentValue);
  };

  const saveConfigEdit = () => {
    if (!editingConfig) return;
    
    setConfigurations(prevConfigs => 
      prevConfigs.map(config => 
        config.category === editingConfig.category
          ? {
              ...config,
              settings: config.settings.map(setting =>
                setting.key === editingConfig.setting
                  ? { ...setting, value: editingValue }
                  : setting
              )
            }
          : config
      )
    );
    
    setEditingConfig(null);
    setEditingValue('');
    setShowSuccessMessage(`Configuration "${editingConfig.setting}" updated successfully!`);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const cancelConfigEdit = () => {
    setEditingConfig(null);
    setEditingValue('');
  };

  const addNewUser = () => {
    console.log('addNewUser called with:', { newUserEmail, newUserRole });
    
    if (!newUserEmail.trim()) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check if user already exists
    if (users.some(user => user.email.toLowerCase() === newUserEmail.toLowerCase())) {
      alert('A user with this email address already exists.');
      return;
    }

    const roleMappings = {
      'read-only': { role: 'Read Only', permissions: ['dashboard-view'] },
      'operations-admin': { role: 'Operations Admin', permissions: ['dashboard-access', 'session-management', 'health-monitoring'] },
      'system-admin': { role: 'System Admin', permissions: ['full-access', 'system-config', 'health-monitoring'] },
      'super-admin': { role: 'Super Admin', permissions: ['full-access', 'user-management', 'system-config'] }
    };

    const roleInfo = roleMappings[newUserRole as keyof typeof roleMappings];
    
    if (!roleInfo) {
      alert('Invalid role selected.');
      return;
    }
    
    const name = newUserEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const newUser: User = {
      id: (users.length + 1).toString(),
      name,
      email: newUserEmail,
      role: roleInfo.role,
      status: 'Active',
      lastLogin: 'Never',
      permissions: roleInfo.permissions
    };

    console.log('Adding new user:', newUser);
    
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, newUser];
      console.log('Updated users list:', updatedUsers);
      return updatedUsers;
    });
    
    setNewUserEmail('');
    setNewUserRole('read-only');
    setShowSuccessMessage(`User ${newUserEmail} added successfully with ${roleInfo.role} role!`);
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const removeUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (window.confirm(`Are you sure you want to remove ${user.name} (${user.email})?`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      setShowSuccessMessage(`User ${user.name} removed successfully!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const terminateSession = (sessionId: string) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    if (window.confirm(`Are you sure you want to terminate the session for ${session.user}?`)) {
      setShowSuccessMessage(`Session for ${session.user} terminated successfully!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  // Overview data
  const stats = [
    { label: 'Active Sessions', value: '1,247', trend: '+12%', trendUp: true },
    { label: 'System Health', value: '99.8%', trend: '+0.2%', trendUp: true },
    { label: 'API Requests', value: '45.2K', trend: '+8%', trendUp: true },
    { label: 'Error Rate', value: '0.02%', trend: '-15%', trendUp: false },
  ];

  const recentActivity = [
    { time: '2 min ago', event: 'User john.doe@contoso.com logged in', type: 'auth' },
    { time: '5 min ago', event: 'Configuration updated by admin', type: 'config' },
    { time: '12 min ago', event: 'Session expired for user.smith@contoso.com', type: 'session' },
    { time: '18 min ago', event: 'Health check passed for all services', type: 'health' },
    { time: '25 min ago', event: 'New user access granted to mary.johnson@contoso.com', type: 'access' },
    { time: '32 min ago', event: 'Database connection pool optimized', type: 'config' },
  ];

  // Health Monitor data
  const healthServices = [
    { name: 'MCPX API Gateway', status: 'healthy', uptime: '99.98%', responseTime: '127ms', lastCheck: '30s ago' },
    { name: 'KendoBridge Service', status: 'healthy', uptime: '99.95%', responseTime: '89ms', lastCheck: '45s ago' },
    { name: 'Authentication Service', status: 'healthy', uptime: '99.99%', responseTime: '56ms', lastCheck: '20s ago' },
    { name: 'Database Cluster', status: 'warning', uptime: '99.89%', responseTime: '245ms', lastCheck: '1m ago' },
    { name: 'Message Queue', status: 'healthy', uptime: '99.97%', responseTime: '23ms', lastCheck: '15s ago' },
    { name: 'File Storage', status: 'healthy', uptime: '99.94%', responseTime: '156ms', lastCheck: '40s ago' },
  ];

  const systemMetrics = [
    { metric: 'CPU Usage', value: '34%', status: 'good' },
    { metric: 'Memory Usage', value: '67%', status: 'warning' },
    { metric: 'Disk Usage', value: '45%', status: 'good' },
    { metric: 'Network I/O', value: '23%', status: 'good' },
  ];

  // Sessions data
  const activeSessions = [
    { 
      id: 'sess_001', 
      user: 'john.doe@contoso.com', 
      role: 'Admin', 
      location: 'Seattle, WA', 
      device: 'Chrome on Windows', 
      lastActivity: '2 min ago', 
      duration: '2h 15m',
      ipAddress: '192.168.1.100'
    },
    { 
      id: 'sess_002', 
      user: 'sarah.smith@contoso.com', 
      role: 'Operator', 
      location: 'New York, NY', 
      device: 'Edge on Windows', 
      lastActivity: '5 min ago', 
      duration: '45m',
      ipAddress: '192.168.1.101'
    },
    { 
      id: 'sess_003', 
      user: 'mike.wilson@contoso.com', 
      role: 'Viewer', 
      location: 'Austin, TX', 
      device: 'Safari on MacOS', 
      lastActivity: '8 min ago', 
      duration: '1h 32m',
      ipAddress: '192.168.1.102'
    },
    { 
      id: 'sess_004', 
      user: 'lisa.brown@contoso.com', 
      role: 'Admin', 
      location: 'Portland, OR', 
      device: 'Chrome on Linux', 
      lastActivity: '12 min ago', 
      duration: '3h 8m',
      ipAddress: '192.168.1.103'
    },
  ];

  // Access Control data

  const roles = [
    { 
      name: 'Super Admin', 
      description: 'Full system access including user management and configuration', 
      userCount: 1,
      permissions: ['full-access', 'user-management', 'system-config', 'health-monitoring', 'session-management', 'dashboard-access']
    },
    { 
      name: 'System Admin', 
      description: 'System configuration and health monitoring access', 
      userCount: 1,
      permissions: ['system-config', 'health-monitoring', 'dashboard-access']
    },
    { 
      name: 'Operations Admin', 
      description: 'Dashboard access and session management capabilities', 
      userCount: 2,
      permissions: ['dashboard-access', 'session-management', 'health-monitoring']
    },
    { 
      name: 'Read Only', 
      description: 'View-only access to dashboard and reports', 
      userCount: 1,
      permissions: ['dashboard-view']
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-gray-500 truncate">{stat.label}</div>
                      </div>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.trendUp ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <svg className={`self-center flex-shrink-0 h-4 w-4 ${
                          stat.trendUp ? 'text-green-500' : 'text-red-500'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d={stat.trendUp 
                            ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                            : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                          } clipRule="evenodd" />
                        </svg>
                        <span className="ml-1">{stat.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.map((activity, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index !== recentActivity.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                activity.type === 'auth' ? 'bg-green-500' :
                                activity.type === 'config' ? 'bg-blue-500' :
                                activity.type === 'session' ? 'bg-yellow-500' :
                                activity.type === 'access' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}>
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">{activity.event}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time>{activity.time}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="space-y-6">
            {/* System Metrics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Metrics</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${
                          metric.status === 'good' ? 'bg-green-400' : 
                          metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Service Health Status</h3>
                <div className="space-y-4">
                  {healthServices.map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-3 w-3 rounded-full ${
                            service.status === 'healthy' ? 'bg-green-400' :
                            service.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-500">Last checked: {service.lastCheck}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex space-x-6 text-sm">
                            <div>
                              <span className="text-gray-500">Uptime:</span>
                              <span className="ml-1 font-medium">{service.uptime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Response:</span>
                              <span className="ml-1 font-medium">{service.responseTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-6">
            {/* Session Statistics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Session Overview</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">1,247</div>
                    <div className="text-sm text-blue-700">Total Active Sessions</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">98.5%</div>
                    <div className="text-sm text-green-700">Session Success Rate</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-900">2h 15m</div>
                    <div className="text-sm text-purple-700">Average Session Duration</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sessions Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Active Sessions</h3>
                  <button 
                    onClick={exportSessions}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Sessions
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeSessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{session.user}</div>
                            <div className="text-sm text-gray-500">{session.ipAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              session.role === 'Admin' ? 'bg-red-100 text-red-800' :
                              session.role === 'Operator' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {session.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.device}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.lastActivity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => setSelectedSession(session.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => terminateSession(session.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Terminate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-6">
            {configurations.map((config, index) => (
              <div key={index} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{config.category}</h3>
                  <div className="space-y-4">
                    {config.settings.map((setting, settingIndex) => (
                      <div key={settingIndex} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{setting.key}</p>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {editingConfig?.category === config.category && editingConfig?.setting === setting.key ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && saveConfigEdit()}
                              />
                              <button 
                                onClick={saveConfigEdit}
                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                              >
                                Save
                              </button>
                              <button 
                                onClick={cancelConfigEdit}
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                                {setting.value}
                              </span>
                              <button 
                                onClick={() => handleEditConfig(config.category, setting.key, setting.value)}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                Edit
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Configuration Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Configuration Management</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Config
                  </button>
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Import Config
                  </button>
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'access':
        return (
          <div className="space-y-6">
            {/* Add New User */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New User</h3>
                <div className="mb-2 text-sm text-gray-600">
                  Debug: Email: "{newUserEmail}", Role: "{newUserRole}", Users count: {users.length}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => {
                        console.log('Email input changed:', e.target.value);
                        setNewUserEmail(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="user@contoso.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        console.log('Role changed:', e.target.value);
                        setNewUserRole(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="read-only">Read Only</option>
                      <option value="operations-admin">Operations Admin</option>
                      <option value="system-admin">System Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <button 
                      onClick={addNewUser}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add User
                    </button>
                    <button 
                      onClick={() => {
                        console.log('Test button clicked');
                        setNewUserEmail('test@contoso.com');
                        setNewUserRole('operations-admin');
                      }}
                      className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Roles Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Role Definitions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {roles.map((role, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
                        <span className="text-sm text-gray-500">{role.userCount} users</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, permIndex) => (
                          <span key={permIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                      </svg>
                      Filter
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'System Admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'Operations Admin' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 2).map((permission, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {permission}
                                </span>
                              ))}
                              {user.permissions.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{user.permissions.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button 
                              onClick={() => removeUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">MCPX-KendoBridge Admin Portal</h1>
                <p className="text-sm text-gray-500">Operations Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">admin@contoso.com</span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'health', label: 'Health Monitor', icon: '💚' },
              { key: 'sessions', label: 'Sessions', icon: '👥' },
              { key: 'config', label: 'Configuration', icon: '⚙️' },
              { key: 'access', label: 'Access Control', icon: '🔐' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{showSuccessMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
}