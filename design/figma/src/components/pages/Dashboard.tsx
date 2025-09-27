import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { RefreshCw, Copy, CheckCircle, XCircle, Clock, Users, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface HealthData {
  status: 'ok' | 'fail';
  uptimeSeconds: number;
  sessionCount: number;
  childProcesses: number;
}

interface ReadinessData {
  ready: boolean;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export function Dashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [readinessData, setReadinessData] = useState<ReadinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Mock API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate random data
      const mockHealthData: HealthData = {
        status: Math.random() > 0.1 ? 'ok' : 'fail',
        uptimeSeconds: Math.floor(Math.random() * 604800) + 3600, // 1 hour to 1 week
        sessionCount: Math.floor(Math.random() * 50) + 5,
        childProcesses: Math.floor(Math.random() * 8) + 2
      };

      const mockReadinessData: ReadinessData = {
        ready: Math.random() > 0.05
      };

      setHealthData(mockHealthData);
      setReadinessData(mockReadinessData);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError('Failed to fetch service data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    toast.success('Dashboard updated');
  };

  const copyRequestId = () => {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(requestId);
    toast.success('Request ID copied to clipboard');
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1>Dashboard</h1>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyRequestId}
              className="ml-4"
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
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">Service posture and key metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing || isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              healthData?.status === 'ok' ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  <Badge variant={healthData?.status === 'ok' ? 'default' : 'destructive'}>
                    {healthData?.status?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {healthData ? formatUptime(healthData.uptimeSeconds) : 'N/A'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Readiness */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">
                  <Badge variant={readinessData?.ready ? 'default' : 'secondary'}>
                    {readinessData?.ready ? 'READY' : 'NOT READY'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Service readiness</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">{healthData?.sessionCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Current sessions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Child Processes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Child Processes</CardTitle>
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full" />
            ) : (
              <Activity className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">{healthData?.childProcesses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Running processes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Section (Placeholder for future implementation) */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Performance trend charts will be available in a future release.</p>
              <p className="text-sm mt-2">Request latency p50/p95 and streaming TTFB metrics.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}