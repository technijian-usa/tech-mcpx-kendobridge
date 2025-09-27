import { useAuth } from '../auth/AuthProvider';

export function SimpleDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1>MCPX-KendoBridge Admin Portal</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
        
        <h2>Dashboard</h2>
        <p>Welcome, {user?.name || 'User'}!</p>
        <p>Email: {user?.email || 'Not available'}</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Navigation</h3>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/sessions">Sessions</a></li>
            <li><a href="/config">Config</a></li>
            <li><a href="/access">Access Control</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}