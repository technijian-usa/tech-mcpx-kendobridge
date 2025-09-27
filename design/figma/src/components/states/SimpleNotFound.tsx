export function SimpleNotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>404</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Page not found
        </p>
        <button
          onClick={handleGoHome}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}