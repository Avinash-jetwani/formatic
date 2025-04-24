// src/app/(dashboard)/admin/users/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService, formsService } from '@/services/api';
import {
  Search as SearchIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Trash2 as Trash2Icon,
  Edit2 as Edit2Icon,
  Download as DownloadIcon,
  UserPlus as UserPlusIcon,
  RefreshCw as RefreshCwIcon,
  AlertTriangle as AlertTriangleIcon,
  User as UserIcon,
  Shield as ShieldIcon,
  Mail as MailIcon,
  Filter as FilterIcon,
  Check as CheckIcon,
  X as XIcon,
  Calendar as CalendarIcon,
  ClipboardList as ClipboardListIcon,
  ExternalLink as ExternalLinkIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  List as ListIcon,
  Grid as GridIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card/Card';
import { Badge } from '@/components/ui/badge/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/Tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu/DropdownMenu';
import { useToast } from '@/components/ui/use-toast/Toast';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { DashboardStatsCard } from '@/components/features/dashboard';

// Updated User interface to include string as a valid status type
interface User {
  id: string;
  name?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CLIENT';
  createdAt: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'locked' | string;
  _count?: {
    forms?: number;
    submissions?: number;
  };
}

// Extend the user interface for a user with enriched status
interface EnhancedUser extends User {
  status: string;
}

export default function Page() {
  const { isAdmin, user: me } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // search/filter/sort/pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'SUPER_ADMIN'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive' | 'locked'>('ALL');
  const [recentForms, setRecentForms] = useState<any[]>([]);
  const [filterCreatedAfter, setFilterCreatedAfter] = useState<string>('');
  const [filterCreatedBefore, setFilterCreatedBefore] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt' | 'formCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // user being deleted
  const [userBeingDeleted, setUserBeingDeleted] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // user status management
  const [userToToggleLock, setUserToToggleLock] = useState<User | null>(null);
  const [showLockConfirmation, setShowLockConfirmation] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    clientCount: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });

  // View mode (consistent with other pages)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Modal states for actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const { data, error } = await usersService.getAllUsers();
      if (data && !error) {
        // Define status mapping
        const statusMap: Record<string, string> = {
          'ACTIVE': 'active',
          'INACTIVE': 'inactive',
          'LOCKED': 'locked'
        };
        
        // Map data and convert status to frontend format
        const enhancedUsers = (data as User[]).map((user: User): User => ({
          ...user,
          status: (user.status && statusMap[user.status]) || 'active'
        }));
        
        setUsers(enhancedUsers);
        
        // Calculate statistics
        const adminCount = enhancedUsers.filter((u) => u.role === 'SUPER_ADMIN').length;
        const clientCount = enhancedUsers.filter((u) => u.role === 'CLIENT').length;
        const activeUsers = enhancedUsers.filter((u) => u.status === 'active').length;
        const inactiveUsers = enhancedUsers.filter((u) => u.status === 'inactive' || u.status === 'locked').length;
        
        setStats({
          totalUsers: enhancedUsers.length,
          adminCount,
          clientCount,
          activeUsers,
          inactiveUsers
        });
      } else {
        setError(error || 'Failed to load users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    fetchUsers();
  }, [isAdmin, router]);

  // derived filtered & sorted
  const filtered = useMemo(() => {
    let arr = users;
    
    // Search by name or email
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    
    // Filter by role
    if (filterRole !== 'ALL') {
      arr = arr.filter(u => u.role === filterRole);
    }
    
    // Filter by status
    if (filterStatus !== 'ALL') {
      arr = arr.filter(u => u.status === filterStatus);
    }
    
    // Filter by creation date
    if (filterCreatedAfter) {
      const afterDate = new Date(filterCreatedAfter);
      arr = arr.filter(u => new Date(u.createdAt) >= afterDate);
    }
    
    if (filterCreatedBefore) {
      const beforeDate = new Date(filterCreatedBefore);
      beforeDate.setHours(23, 59, 59, 999); // End of day
      arr = arr.filter(u => new Date(u.createdAt) <= beforeDate);
    }
    
    // Sort
    arr = arr.slice().sort((a, b) => {
      if (sortBy === 'formCount') {
        const countA = a._count?.forms || 0;
        const countB = b._count?.forms || 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      }
      
      let va: any = a[sortBy] || '';
      let vb: any = b[sortBy] || '';
      
      if (sortBy === 'createdAt') {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      }
      
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      
      return sortOrder === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    
    return arr;
  }, [users, searchTerm, filterRole, filterStatus, filterCreatedAfter, filterCreatedBefore, sortBy, sortOrder]);
  
  // Pagination
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);
  
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Helper function to refresh data
  const handleRefresh = () => {
    fetchUsers(true);
  };

  // Handle exports
  const handleExport = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No users selected",
        description: "Please select at least one user to export.",
        variant: "destructive"
      });
      return;
    }

    // Implementation for export functionality
    const selectedUsers = users.filter(u => selectedIds.has(u.id));
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'].join(','),
      ...selectedUsers.map(u => 
        [
          u.id,
          u.name || '', 
          u.email, 
          u.role, 
          u.status, 
          new Date(u.createdAt).toLocaleDateString()
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handler for info button click
  const handleInfoClick = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handler for delete button click
  const handleDeleteClick = (user: User) => {
    // Prevent deleting super admin users
    if (user.role === 'SUPER_ADMIN') {
      toast({
        title: "Cannot Delete Admin",
        description: "Super admin users cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedUserId(user.id);
    setShowDeleteModal(true);
  };

  // Handle single user deletion
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    const { error } = await usersService.deleteUser(selectedUserId);
    
    if (error) {
      toast({
        title: "Delete Failed",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      // Remove user from state
      setUsers(users.filter(u => u.id !== selectedUserId));
    }
    
    setLoading(false);
    setShowDeleteModal(false);
    setSelectedUserId(null);
  };

  // Handle bulk delete - modified to prevent deleting super admins
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    // Check if any super admin is selected
    const selectedUsers = users.filter(u => selectedIds.has(u.id));
    const hasSuperAdmin = selectedUsers.some(u => u.role === 'SUPER_ADMIN');
    
    if (hasSuperAdmin) {
      toast({
        title: "Cannot Delete Admins",
        description: "Some selected users are super admins and cannot be deleted.",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} user(s)?`)) {
      return;
    }
    
    setLoading(true);
    const ids = Array.from(selectedIds);
    const results = await Promise.all(ids.map(id => usersService.deleteUser(id)));
    
    // Check for any errors
    const errors = results.filter(r => r.error).length;
    if (errors > 0) {
      toast({
        title: "Delete Operation",
        description: `Completed with ${errors} errors.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Users Deleted",
        description: `Successfully deleted ${ids.length} user(s).`,
      });
    }
    
    // Clear selection and refresh
    setSelectedIds(new Set());
    fetchUsers();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header - Consistent with other dashboard pages */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Users Management</h1>
          <p className="text-gray-500">Manage user accounts and access control</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCwIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? (
              <>
                <GridIcon className="h-4 w-4" />
                Grid View
              </>
            ) : (
              <>
                <ListIcon className="h-4 w-4" />
                List View
              </>
            )}
          </Button>
          
          <Link href="/admin/users/create">
            <Button variant="primary" size="sm" className="gap-2">
              <UserPlusIcon className="h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Using consistent Dashboard Stats Card component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStatsCard
          title="Total Users"
          value={stats.totalUsers}
          Icon={UserIcon}
          borderColor="blue"
          textColor="blue"
          isLoading={loading}
        />
        
        <DashboardStatsCard
          title="Admin Users"
          value={stats.adminCount}
          Icon={ShieldIcon}
          borderColor="purple"
          textColor="purple"
          isLoading={loading}
        />
        
        <DashboardStatsCard
          title="Clients"
          value={stats.clientCount}
          Icon={ClipboardListIcon}
          borderColor="green"
          textColor="green"
          isLoading={loading}
        />
        
        <DashboardStatsCard
          title="Active Users"
          value={stats.activeUsers} 
          prevValue={stats.totalUsers - stats.inactiveUsers}
          Icon={CheckIcon}
          borderColor="green"
          textColor="green"
          isLoading={loading}
        />
      </div>

      {/* Search and Filter Section - Consistent with other pages */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10 w-full"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "primary" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <FilterIcon className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
                disabled={loading || selectedIds.size === 0}
              >
                <DownloadIcon className="h-4 w-4" />
                Export
              </Button>
              
              {/* Replace dropdown with direct delete button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-red-600 hover:bg-red-50"
                disabled={selectedIds.size === 0}
                onClick={handleBulkDelete}
              >
                <Trash2Icon className="h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
          
          {/* Filter options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created After</label>
                <input
                  type="date"
                  value={filterCreatedAfter}
                  onChange={e => {
                    setFilterCreatedAfter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Before</label>
                <input
                  type="date"
                  value={filterCreatedBefore}
                  onChange={e => {
                    setFilterCreatedBefore(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filterRole}
                  onChange={e => { setFilterRole(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CLIENT">Client</option>
                  <option value="SUPER_ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List Section */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Users</CardTitle>
            {filtered.length !== users.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('ALL');
                  setFilterStatus('ALL');
                  setFilterCreatedAfter('');
                  setFilterCreatedBefore('');
                }}
                className="gap-2"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 p-6 mb-4">
                <UserIcon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('ALL');
                  setFilterStatus('ALL');
                  setFilterCreatedAfter('');
                  setFilterCreatedBefore('');
                }}
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={e => {
                            const checked = e.target.checked;
                            setSelectAll(checked);
                            if (checked) {
                              setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        if (sortBy === 'name') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('name');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      <div className="flex items-center">
                        Name/Email
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        if (sortBy === 'role') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('role');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      <div className="flex items-center">
                        Role
                        {sortBy === 'role' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => {
                        if (sortBy === 'createdAt') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('createdAt');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      <div className="flex items-center">
                        Created
                        {sortBy === 'createdAt' && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={e => {
                            const newSet = new Set(selectedIds);
                            if (e.target.checked) {
                              newSet.add(user.id);
                            } else {
                              newSet.delete(user.id);
                            }
                            setSelectedIds(newSet);
                            setSelectAll(paginatedUsers.every(u => newSet.has(u.id)));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'locked' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'active'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleInfoClick(user)}
                          >
                            <InfoIcon className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit2Icon className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.role === 'SUPER_ADMIN'}
                            className={user.role === 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <Trash2Icon className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedUsers.map(user => (
                <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={e => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) {
                            newSet.add(user.id);
                          } else {
                            newSet.delete(user.id);
                          }
                          setSelectedIds(newSet);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Role:</span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Status:</span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'locked' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'active'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Created:</span>
                        <span className="text-xs text-gray-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInfoClick(user)}
                      >
                        <InfoIcon className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2Icon className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.role === 'SUPER_ADMIN'}
                        className={user.role === 'SUPER_ADMIN' ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {!loading && paginatedUsers.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
                    <span className="font-medium">{filtered.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-l-md"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      // Calculate which page numbers to show
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + idx;
                      } else {
                        pageNumber = currentPage - 2 + idx;
                      }
                      
                      return (
                        <Button
                          key={idx}
                          variant={currentPage === pageNumber ? "primary" : "outline"}
                          size="sm"
                          className="rounded-none"
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-r-md"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>User Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                <XIcon className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <UserIcon className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold">{selectedUser.name || 'No Name'}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.role === 'SUPER_ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedUser.role === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedUser.status === 'locked' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.status || 'active'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-5">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">ID</h4>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
                  <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                {selectedUser.lastLogin && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Last Login</h4>
                    <p className="text-sm">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Forms</h4>
                  <p className="text-sm">{selectedUser._count?.forms || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Submissions</h4>
                  <p className="text-sm">{selectedUser._count?.submissions || 0}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Link href={`/admin/users/${selectedUser.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit2Icon className="h-4 w-4" />
                    Edit User
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Delete User</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-center mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}