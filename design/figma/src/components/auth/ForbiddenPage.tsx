import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { ShieldX } from 'lucide-react';

export function ForbiddenPage() {
  const navigate = useNavigate();

  const handleBackToSignIn = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <ShieldX className="h-12 w-12 mx-auto text-destructive" />
          <div className="space-y-2">
            <h1 className="text-xl">You don't have access yet.</h1>
            <p className="text-muted-foreground">
              Ask an administrator to grant you access to the MCPX-KendoBridge Admin Portal.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackToSignIn} className="w-full">
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}