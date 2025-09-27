import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Copy, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Session {
  mcpSessionId: string;
  pid: number;
  uptimeSeconds: number;
  status: 'Up' | 'Down' | 'Draining';
}

const formatUptime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const generateMockSession = (): Session => ({
  mcpSessionId: `mcp-${Math.random().toString(36).substr(2, 16)}`,
  pid: Math.floor(Math.random() * 9000) + 1000,
  uptimeSeconds: Math.floor(Math.random() * 3600) + 30,
  status: ['Up', 'Up', 'Up', 'Up', 'Down', 'Draining'][Math.floor(Math.random() * 6)] as Session['status']
});

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Session ID copied to clipboard');
  };

  const simulateSSEConnection = () => {
    setConnectionState('connecting');
    setError(null);

    // Simulate initial connection
    setTimeout(() => {
      setConnectionState('connected');
      setIsConnected(true);
      setIsLoading(false);
      
      // Generate initial sessions
      const initialSessions = Array.from({ length: Math.floor(Math.random() * 15) + 5 }, generateMockSession);
      setSessions(initialSessions);

      // Simulate real-time updates
      intervalRef.current = setInterval(() => {
        setSessions(prev => {
          const updated = [...prev];
          
          // Randomly update existing sessions
          updated.forEach(session => {
            session.uptimeSeconds += Math.floor(Math.random() * 10) + 1;
            // Randomly change status occasionally
            if (Math.random() < 0.05) {
              session.status = ['Up', 'Down', 'Draining'][Math.floor(Math.random() * 3)] as Session['status'];
            }
          });

          // Occasionally add or remove sessions
          if (Math.random() < 0.1 && updated.length < 20) {
            updated.push(generateMockSession());
          } else if (Math.random() < 0.05 && updated.length > 3) {
            updated.splice(Math.floor(Math.random() * updated.length), 1);
          }

          return updated;
        });
      }, 2000);

      // Simulate occasional connection issues
      setTimeout(() => {
        if (Math.random() < 0.3) {
          setConnectionState('reconnecting');
          setIsConnected(false);
          
          setTimeout(() => {
            setConnectionState('connected');
            setIsConnected(true);
          }, 3000);
        }
      }, 10000);

    }, 1500);
  };

  const handleReconnect = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    simulateSSEConnection();
  };

  useEffect(() => {
    simulateSSEConnection();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getStatusVariant = (status: Session['status']) => {
    switch (status) {
      case 'Up': return 'default';
      case 'Down': return 'destructive';
      case 'Draining': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'reconnecting':
        return <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="h-3 w-3 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionState) {
      case 'connected': return 'Live';
      case 'reconnecting': return 'Reconnecting…';
      case 'connecting': return 'Connecting…';
      default: return 'Disconnected';
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1>Sessions</h1>
          <Button onClick={handleReconnect}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reconnect
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                navigator.clipboard.writeText(requestId);
                toast.success('Request ID copied');
              }}
            >
              <Copy className="mr-1 h-3 w-3" />
              Copy requestId
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Sessions</h1>
          <p className="text-muted-foreground">Observe live MCP sessions</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="text-sm font-medium">{getConnectionText()}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Sessions</span>
            <Badge variant="outline">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active sessions</p>
              <Button variant="link" className="mt-2" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MCP Session ID</TableHead>
                    <TableHead className="text-right">PID</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.mcpSessionId}>
                      <TableCell className="font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="truncate max-w-xs">{session.mcpSessionId}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(session.mcpSessionId)}
                            className="p-1 h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {session.pid}
                      </TableCell>
                      <TableCell>
                        {formatUptime(session.uptimeSeconds)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(session.status)}>
                          {session.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}