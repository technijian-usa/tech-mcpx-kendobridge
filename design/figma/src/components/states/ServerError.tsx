import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export function ServerError() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
          <div className="space-y-2">
            <h1 className="text-2xl">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')} 
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}