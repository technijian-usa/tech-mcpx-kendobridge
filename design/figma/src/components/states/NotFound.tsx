import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    // Go to root, let RootGuard handle the redirect
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h1 className="text-2xl">Page not found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleGoHome} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}