import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Card, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

export function LoginCallback() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Simulate processing callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        await login();
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Login callback failed:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [login, navigate]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          {error ? (
            <>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={handleRetry} className="w-full">
                Try again
              </Button>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <p>Signing you in…</p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we complete your authentication.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}