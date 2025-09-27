import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { MicrosoftIcon } from '../ui/icons';
import { toast } from 'sonner@2.0.3';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      navigate('/dashboard', { replace: true });
      toast.success('Successfully signed in');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {/* Skip to content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Skip to content
        </a>
        
        <Card id="main-content">
          <CardHeader className="space-y-1 pb-4">
            <h1 className="text-center">Sign in</h1>
            <p className="text-center text-muted-foreground">
              Use your Microsoft account to continue.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
              aria-label="Sign in with Microsoft"
            >
              <MicrosoftIcon className="mr-2 h-4 w-4" />
              {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
            </Button>
            
            <div className="text-center">
              <Button variant="link" size="sm" className="text-muted-foreground">
                Use a different account
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <footer className="text-center space-x-4 text-sm text-muted-foreground">
          <Button variant="link" size="sm" className="text-muted-foreground p-0 h-auto">
            Privacy
          </Button>
          <span>•</span>
          <Button variant="link" size="sm" className="text-muted-foreground p-0 h-auto">
            Terms
          </Button>
        </footer>
      </div>
    </div>
  );
}