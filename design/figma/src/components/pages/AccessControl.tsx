import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { 
  Plus, 
  Trash2, 
  Search, 
  Copy, 
  Users, 
  Building2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AllowedUser {
  objectId: string;
  displayName: string;
  userPrincipalName: string;
  source: 'Manual' | 'Group via policy';
  addedOn: Date;
  avatarUrl?: string;
}

interface DirectoryUser {
  objectId: string;
  displayName: string;
  userPrincipalName: string;
  avatarUrl?: string;
  tenant: string;
}

const MOCK_ALLOWED_USERS: AllowedUser[] = [
  {
    objectId: '12345678-1234-1234-1234-123456789abc',
    displayName: 'Alice Johnson',
    userPrincipalName: 'alice.johnson@company.com',
    source: 'Manual',
    addedOn: new Date('2024-01-10'),
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=32&h=32&fit=crop&crop=face'
  },
  {
    objectId: '87654321-4321-4321-4321-cba987654321',
    displayName: 'Bob Smith',
    userPrincipalName: 'bob.smith@company.com',
    source: 'Group via policy',
    addedOn: new Date('2024-01-08'),
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    objectId: 'abcdef12-3456-7890-abcd-ef1234567890',
    displayName: 'Carol Wilson',
    userPrincipalName: 'carol.wilson@company.com',
    source: 'Manual',
    addedOn: new Date('2024-01-05')
  }
];

const generateMockDirectoryUsers = (searchTerm: string): DirectoryUser[] => {
  const baseUsers = [
    { name: 'David Brown', email: 'david.brown@company.com' },
    { name: 'Emma Davis', email: 'emma.davis@company.com' },
    { name: 'Frank Miller', email: 'frank.miller@company.com' },
    { name: 'Grace Taylor', email: 'grace.taylor@company.com' },
    { name: 'Henry Wilson', email: 'henry.wilson@company.com' },
    { name: 'Ivy Chen', email: 'ivy.chen@company.com' },
    { name: 'Jack Anderson', email: 'jack.anderson@company.com' },
    { name: 'Kelly Rodriguez', email: 'kelly.rodriguez@company.com' },
  ];

  return baseUsers
    .filter(user => 
      !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(user => ({
      objectId: `${Math.random().toString(36).substr(2, 8)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`,
      displayName: user.name,
      userPrincipalName: user.email,
      tenant: 'company.com',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=32&h=32&fit=crop&crop=face`
    }));
};

export function AccessControl() {
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'allowed' | 'not-allowed'>('all');

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAllowedUsers(MOCK_ALLOWED_USERS);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Debounced directory search
    if (!searchTerm.trim()) {
      setDirectoryUsers([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const results = generateMockDirectoryUsers(searchTerm);
      setDirectoryUsers(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const isUserAllowed = (objectId: string) => {
    return allowedUsers.some(user => user.objectId === objectId);
  };

  const filteredDirectoryUsers = directoryUsers.filter(user => {
    switch (filter) {
      case 'allowed':
        return isUserAllowed(user.objectId);
      case 'not-allowed':
        return !isUserAllowed(user.objectId);
      default:
        return true;
    }
  });

  const handleAddUser = async (user: DirectoryUser) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAllowedUser: AllowedUser = {
        objectId: user.objectId,
        displayName: user.displayName,
        userPrincipalName: user.userPrincipalName,
        source: 'Manual',
        addedOn: new Date(),
        avatarUrl: user.avatarUrl
      };

      setAllowedUsers(prev => [...prev, newAllowedUser]);
      toast.success(`${user.displayName} added to allow-list`);
    } catch (error) {
      toast.error('Failed to add user');
    }
  };

  const handleRemoveUsers = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAllowedUsers(prev => prev.filter(user => !selectedUsers.has(user.objectId)));
      setSelectedUsers(new Set());
      setShowRemoveDialog(false);
      toast.success(`${selectedUsers.size} user(s) removed from allow-list`);
    } catch (error) {
      toast.error('Failed to remove users');
    }
  };

  const copyObjectId = (objectId: string) => {
    navigator.clipboard.writeText(objectId);
    toast.success('Object ID copied to clipboard');
  };

  const toggleUserSelection = (objectId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objectId)) {
        newSet.delete(objectId);
      } else {
        newSet.add(objectId);
      }
      return newSet;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Access Control</h1>
        <p className="text-muted-foreground">Grant portal access to Azure users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
        {/* Left Panel - Allowed Users */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Allowed to sign in</span>
              </div>
              <Badge variant="outline">
                {allowedUsers.length} user{allowedUsers.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="flex space-x-2">
              <Button className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add people
              </Button>
              <Button 
                variant="outline"
                disabled={selectedUsers.size === 0}
                onClick={() => setShowRemoveDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove ({selectedUsers.size})
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allowedUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users in allow-list</p>
                    <p className="text-sm">Add people to grant portal access</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Object ID</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Added On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allowedUsers.map((user) => (
                        <TableRow key={user.objectId}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.objectId)}
                              onCheckedChange={() => toggleUserSelection(user.objectId)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{user.displayName}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.userPrincipalName}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <code className="text-xs bg-muted px-1 rounded">
                                {user.objectId.slice(0, 8)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyObjectId(user.objectId)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.source === 'Manual' ? 'default' : 'secondary'}>
                              {user.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.addedOn.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Directory Search */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Directory Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or UPN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2">
                {(['all', 'allowed', 'not-allowed'] as const).map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className="capitalize"
                  >
                    {filterType.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex-1 overflow-hidden">
              {!searchTerm.trim() ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Type to search the directory</p>
                    <p className="text-sm">Search for users by name or email</p>
                  </div>
                </div>
              ) : isSearching ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredDirectoryUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {filteredDirectoryUsers.map((user) => {
                      const isAllowed = isUserAllowed(user.objectId);
                      return (
                        <div key={user.objectId} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.displayName}</p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span className="truncate">{user.userPrincipalName}</span>
                              <Building2 className="h-3 w-3" />
                              <span>{user.tenant}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            disabled={isAllowed}
                            onClick={() => handleAddUser(user)}
                          >
                            {isAllowed ? 'Added' : 'Add'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm removal</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {selectedUsers.size} selected user{selectedUsers.size !== 1 ? 's' : ''} from allow-list? 
              They will lose portal access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveUsers}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Policy Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Policy Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>• <strong>NoHardCoding:</strong> Directory reads via backend Graph proxy (no tokens in UI)</p>
            <p>• <strong>SP-only DB:</strong> Allow-list writes via stored procedures with add-only schema</p>
            <p>• <strong>Data retention:</strong> Persistence stores only objectId, kind, addedAt (no names/UPN)</p>
            <p>• <strong>RBAC:</strong> Only Ops Admin group members see Access Control navigation</p>
            <p>• <strong>Evidence retention:</strong> ≥ 1 year audit trail for all access changes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}