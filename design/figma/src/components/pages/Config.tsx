import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/resizable';
import { ScrollArea } from '../ui/scroll-area';
import { Eye, EyeOff } from 'lucide-react';

interface ConfigItem {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'csv';
  description?: string;
  sensitive?: boolean;
}

const MOCK_CONFIG: ConfigItem[] = [
  {
    key: 'Mcp:ChildCommand',
    value: '/usr/local/bin/mcp-server',
    type: 'string',
    description: 'Command to execute for child processes'
  },
  {
    key: 'Mcp:ChildArgs',
    value: '--config /etc/mcp/server.json --verbose',
    type: 'string',
    description: 'Arguments passed to child command'
  },
  {
    key: 'Mcp:ChildCwd',
    value: '/var/lib/mcp',
    type: 'string',
    description: 'Working directory for child processes'
  },
  {
    key: 'Security:AllowedOrigins',
    value: 'https://app.company.com,https://admin.company.com,https://staging.company.com',
    type: 'csv',
    description: 'Comma-separated list of allowed CORS origins'
  },
  {
    key: 'Network:SseKeepAliveSeconds',
    value: 30,
    type: 'number',
    description: 'Server-sent events keep-alive interval'
  },
  {
    key: 'Network:RequestTimeoutSeconds',
    value: 120,
    type: 'number',
    description: 'HTTP request timeout duration'
  },
  {
    key: 'Database:ConnectionPoolSize',
    value: 10,
    type: 'number',
    description: 'Maximum database connection pool size'
  },
  {
    key: 'Logging:Level',
    value: 'Information',
    type: 'string',
    description: 'Minimum logging level'
  },
  {
    key: 'Features:EnableMetrics',
    value: true,
    type: 'boolean',
    description: 'Enable application metrics collection'
  },
  {
    key: 'Features:EnableTracing',
    value: false,
    type: 'boolean',
    description: 'Enable distributed tracing'
  }
];

export function Config() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedValues, setExpandedValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate loading configuration
    const loadConfig = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const sortedConfig = [...MOCK_CONFIG].sort((a, b) => a.key.localeCompare(b.key));
      setConfigItems(sortedConfig);
      setSelectedKey(sortedConfig[0]?.key || null);
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const selectedItem = configItems.find(item => item.key === selectedKey);

  const toggleValueExpansion = (key: string) => {
    setExpandedValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderValue = (item: ConfigItem, isExpanded = false) => {
    const { value, type } = item;

    switch (type) {
      case 'csv':
        if (typeof value === 'string') {
          const items = value.split(',').map(v => v.trim());
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {items.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        }
        break;
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? 'Enabled' : 'Disabled'}
            </Badge>
            <code className="text-xs text-muted-foreground">
              {value.toString()}
            </code>
          </div>
        );
      
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-lg">{value}</span>
            {item.key.includes('Seconds') && (
              <span className="text-sm text-muted-foreground">seconds</span>
            )}
          </div>
        );
      
      case 'string':
      default:
        const stringValue = value.toString();
        const shouldTruncate = stringValue.length > 80;
        const displayValue = (shouldTruncate && !isExpanded) 
          ? `${stringValue.slice(0, 40)}...${stringValue.slice(-20)}`
          : stringValue;
        
        return (
          <div className="space-y-2">
            <code className="block bg-muted p-2 rounded-md break-all text-sm">
              {displayValue}
            </code>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleValueExpansion(item.key)}
                className="h-auto p-1 text-xs"
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="mr-1 h-3 w-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
        );
    }

    return <span>{value.toString()}</span>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Configuration</h1>
          <p className="text-muted-foreground">Effective, non-secret configuration (read-only)</p>
        </div>
        
        <Card className="h-[600px]">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              <div className="border-r p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
              <div className="col-span-2 p-6 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Configuration</h1>
        <p className="text-muted-foreground">Effective, non-secret configuration (read-only)</p>
      </div>

      <Card className="h-[600px]">
        <CardContent className="p-0 h-full">
          <ResizablePanelGroup direction="horizontal">
            {/* Key List */}
            <ResizablePanel defaultSize={30} minSize={25}>
              <div className="h-full border-r">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Configuration Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    {configItems.length} items
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-80px)]">
                  <div className="p-2">
                    {configItems.map((item) => (
                      <Button
                        key={item.key}
                        variant={selectedKey === item.key ? "secondary" : "ghost"}
                        className="w-full justify-start text-left p-3 h-auto mb-1"
                        onClick={() => setSelectedKey(item.key)}
                      >
                        <div className="truncate">
                          <div className="font-mono text-sm">{item.key}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {item.type}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Value Detail */}
            <ResizablePanel defaultSize={70}>
              <div className="h-full">
                {selectedItem ? (
                  <div className="p-6 h-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-mono text-lg font-semibold break-all">
                          {selectedItem.key}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="capitalize">
                            {selectedItem.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Non-secret configuration value
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium mb-3">Value</h4>
                        {renderValue(selectedItem, expandedValues.has(selectedItem.key))}
                      </div>

                      {selectedItem.description && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-muted-foreground">{selectedItem.description}</p>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• Configuration sourced from database via stored procedures</p>
                        <p>• Values may differ by environment (Alpha/Beta/RTM/Prod)</p>
                        <p>• Only non-secret configuration is displayed</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a configuration key to view details
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </CardContent>
      </Card>
    </div>
  );
}