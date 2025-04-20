// src/app/(dashboard)/admin/users/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/api';
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
  Unlock as UnlockIcon
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CLIENT';
  createdAt: string;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'locked';
  _count?: {
    forms?: number;
    submissions?: number;
  };
}

export default function Page() {
  const { isAdmin, user: me } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // search/filter/sort/pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'SUPER_ADMIN'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'inactive' | 'locked'>('ALL');
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

// In src/app/(dashboard)/admin/users/page.tsx, replace this block:
const fetchUsers = async (showRefresh = false) => {
  if (showRefresh) setRefreshing(true);
  else setLoading(true);
  
  try {
    const { data, error } = await usersService.getAllUsers();
    if (data && !error) {
      // Define status mapping
      const statusMap = {
        'ACTIVE': 'active',
        'INACTIVE': 'inactive',
        'LOCKED': 'locked'
      };
      
      // Map data and convert status to frontend format
      const enhancedUsers = data.map((user: User) => ({
        ...user,
        status: statusMap[user.status] || 'active'
      }));
      
      setUsers(enhancedUsers);
      
      // Calculate statistics
      const adminCount = enhancedUsers.filter(u => u.role === 'SUPER_ADMIN').length;
      const clientCount = enhancedUsers.filter(u => u.role === 'CLIENT').length;
      const activeUsers = enhancedUsers.filter(u => u.status === 'active').length;
      const inactiveUsers = enhancedUsers.filter(u => u.status === 'inactive' || u.status === 'locked').length;
      
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
      
      let va = a[sortBy] || '';
      let vb = b[sortBy] || '';
      
      if (sortBy === 'createdAt') {
        va = new Date(a.createdAt).getTime();
        vb = new Date(b.createdAt).getTime();
      }
      
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return arr;
  }, [users, searchTerm, filterRole, filterStatus, filterCreatedAfter, filterCreatedBefore, sortBy, sortOrder]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const ids = new Set(paginated.map(u => u.id));
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  };

  const confirmDelete = (id: string) => {
    setUserBeingDeleted(id);
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (!userBeingDeleted) return;
    
    if (userBeingDeleted === me?.id) {
      alert("You can't delete yourself.");
      setShowDeleteConfirmation(false);
      setUserBeingDeleted(null);
      return;
    }
    
    try {
      const { error } = await usersService.deleteUser(userBeingDeleted);
      if (error) throw new Error(error);
      
      setUsers(u => u.filter(x => x.id !== userBeingDeleted));
      setSelectedIds(s => { 
        const newSet = new Set(s);
        newSet.delete(userBeingDeleted); 
        return newSet; 
      });
      
      // Update stats
      const deletedUser = users.find(u => u.id === userBeingDeleted);
      if (deletedUser) {
        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          adminCount: deletedUser.role === 'SUPER_ADMIN' ? prev.adminCount - 1 : prev.adminCount,
          clientCount: deletedUser.role === 'CLIENT' ? prev.clientCount - 1 : prev.clientCount,
          activeUsers: deletedUser.status === 'active' ? prev.activeUsers - 1 : prev.activeUsers,
          inactiveUsers: deletedUser.status !== 'active' ? prev.inactiveUsers - 1 : prev.inactiveUsers
        }));
      }
      
      setShowDeleteConfirmation(false);
      setUserBeingDeleted(null);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.has(me!.id)) {
      alert("You can't delete yourself.");
      return;
    }
    
    if (!confirm(`Delete ${selectedIds.size} users?`)) return;
    
    const deletePromises = Array.from(selectedIds).map(id => 
      usersService.deleteUser(id)
    );
    
    try {
      await Promise.all(deletePromises);
      
      // Update stats
      const deletedUsers = users.filter(u => selectedIds.has(u.id));
      const adminDeletedCount = deletedUsers.filter(u => u.role === 'SUPER_ADMIN').length;
      const clientDeletedCount = deletedUsers.filter(u => u.role === 'CLIENT').length;
      const activeDeletedCount = deletedUsers.filter(u => u.status === 'active').length;
      const inactiveDeletedCount = deletedUsers.filter(u => u.status !== 'active').length;
      
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - deletedUsers.length,
        adminCount: prev.adminCount - adminDeletedCount,
        clientCount: prev.clientCount - clientDeletedCount,
        activeUsers: prev.activeUsers - activeDeletedCount,
        inactiveUsers: prev.inactiveUsers - inactiveDeletedCount
      }));
      
      setUsers(u => u.filter(x => !selectedIds.has(x.id)));
      setSelectedIds(new Set());
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const toggleUserLockStatus = (user: User) => {
    setUserToToggleLock(user);
    setShowLockConfirmation(true);
  };

  const handleToggleLock = async () => {
    if (!userToToggleLock) return;
    
    if (userToToggleLock.id === me?.id) {
      alert("You can't lock your own account.");
      setShowLockConfirmation(false);
      setUserToToggleLock(null);
      return;
    }
    
    const newStatus = userToToggleLock.status === 'locked' ? 'active' : 'locked';
    
    try {
      // Call API to update the user's status
      const { data, error } = await usersService.updateUser(userToToggleLock.id, {
        status: newStatus.toUpperCase() // Convert to uppercase for enum value
      });
      
      if (error) throw new Error(error);
      
      // Update local state
      setUsers(users => 
        users.map(u => 
          u.id === userToToggleLock.id 
            ? { ...u, status: newStatus } 
            : u
        )
      );
      
      // Update stats
      if (newStatus === 'active' && userToToggleLock.status !== 'active') {
        setStats(prev => ({
          ...prev,
          activeUsers: prev.activeUsers + 1,
          inactiveUsers: prev.inactiveUsers - 1
        }));
      } else if (newStatus !== 'active' && userToToggleLock.status === 'active') {
        setStats(prev => ({
          ...prev,
          activeUsers: prev.activeUsers - 1,
          inactiveUsers: prev.inactiveUsers + 1
        }));
      }
      
      setShowLockConfirmation(false);
      setUserToToggleLock(null);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleExport = () => {
    // Prepare data including form counts
    const rows = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Last Login', 'Forms Count', 'Submissions Count'],
      ...filtered.map(u => [
        u.id,
        u.name || '',
        u.email,
        u.role,
        u.status || 'active',
        new Date(u.createdAt).toISOString().slice(0,10),
        u.lastLogin ? new Date(u.lastLogin).toISOString().slice(0,10) : '',
        u._count?.forms || 0,
        u._count?.submissions || 0
      ])
    ];
    
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'users.csv'; 
    a.click();
    URL.revokeObjectURL(url);
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('ALL');
    setFilterStatus('ALL');
    setFilterCreatedAfter('');
    setFilterCreatedBefore('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  if (!isAdmin) return null;
  
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="h-6 w-6" />
          User Management
          <span className="text-sm font-normal bg-gray-100 rounded-full px-2 py-1 ml-2">
            {stats.totalUsers} users
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push('/admin/users/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <UserPlusIcon className="w-5 h-5 mr-1" /> Add User
          </button>
          <button
            onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md flex items-center"
          >
            <DownloadIcon className="w-4 h-4 mr-1" /> Export CSV
          </button>
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md flex items-center"
          >
            <RefreshCwIcon className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
          <AlertTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-semibold">{stats.adminCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ShieldIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-semibold">{stats.clientCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold">{stats.activeUsers}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.inactiveUsers} inactive/locked</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="relative flex-grow max-w-md">
            <SearchIcon className="absolute top-2.5 left-3 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 w-full border rounded-md"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value as any); setCurrentPage(1); }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Client</option>
              <option value="SUPER_ADMIN">Admin</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value as any); setCurrentPage(1); }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 rounded-md ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              <FilterIcon className="w-4 h-4 mr-1" />
              {showFilters ? 'Hide Filters' : 'More Filters'}
            </button>
            
            {filtered.length !== users.length && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md flex items-center"
              >
                <XIcon className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="pt-4 border-t mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <CheckIcon className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium">{selectedIds.size} users selected</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-gray-700 hover:bg-blue-100 rounded"
            >
              Clear Selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md flex items-center"
            >
              <Trash2Icon className="w-4 h-4 mr-1" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'createdAt', label: 'Created' },
                { key: 'formCount', label: 'Forms' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key as any)}
                  className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sortBy === key &&
                      (sortOrder === 'asc'
                        ? <ChevronUpIcon className="w-4 h-4"/>
                        : <ChevronDownIcon className="w-4 h-4"/>
                      )
                    }
                  </div>
                </th>
              ))}
              <th className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.length > 0 ? (
              paginated.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        {u.name ? (
                          <span className="text-gray-600 font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {u.name || 'Unnamed User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {u.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 flex items-center">
                      <MailIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role === 'SUPER_ADMIN' ? (
                        <>
                          <ShieldIcon className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <UserIcon className="w-3 h-3 mr-1" />
                          Client
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                    {u.lastLogin && (
                      <div className="text-xs text-gray-400 mt-1">
                        Last login: {new Date(u.lastLogin).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClipboardListIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {u._count?.forms || 0}
                      {u._count?.submissions && u._count.submissions > 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({u._count.submissions} submissions)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : u.status === 'locked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {u.status === 'active' ? (
                        <>
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : u.status === 'locked' ? (
                        <>
                          <LockIcon className="w-3 h-3 mr-1" />
                          Locked
                        </>
                      ) : (
                        <>
                          <XIcon className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => viewUserDetails(u)}
                        className="text-gray-400 hover:text-gray-500"
                        title="View Details"
                      >
                        <ExternalLinkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/users/${u.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit User"
                      >
                        <Edit2Icon className="w-5 h-5" />
                      </button>
                      {u.id !== me?.id && (
                        <button
                          onClick={() => toggleUserLockStatus(u)}
                          className={`${
                            u.status === 'locked'
                              ? 'text-green-600 hover:text-green-900'
                              : 'text-amber-600 hover:text-amber-900'
                          }`}
                          title={u.status === 'locked' ? 'Unlock User' : 'Lock User'}
                        >
                          {u.status === 'locked' ? (
                            <UnlockIcon className="w-5 h-5" />
                          ) : (
                            <LockIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => confirmDelete(u.id)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={u.id === me?.id}
                        title={u.id === me?.id ? "You can't delete yourself" : "Delete User"}
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  {searchTerm || filterRole !== 'ALL' || filterStatus !== 'ALL' || filterCreatedAfter || filterCreatedBefore ? (
                    <>
                      <p className="font-medium">No users match your search</p>
                      <p className="text-sm mt-1">Try adjusting your filters</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        Clear all filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">No users found</p>
                      <p className="text-sm mt-1">Create your first user to get started</p>
                      <button
                        onClick={() => router.push('/admin/users/create')}
                        className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <UserPlusIcon className="w-4 h-4 inline mr-1" /> 
                        Add User
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} users
          </div>
          <div className="flex justify-center items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (pageCount <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pageCount - 2) {
                pageNum = pageCount - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md ${
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white hover:bg-gray-50 border'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(p+1, pageCount))}
              disabled={currentPage === pageCount}
              className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(pageCount)}
              disabled={currentPage === pageCount}
              className="px-2 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-4">Delete User</h3>
            <p className="text-gray-500 mb-4 text-center">
              Are you sure you want to delete this user? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false);
                  setUserBeingDeleted(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Confirmation Modal */}
      {showLockConfirmation && userToToggleLock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
              {userToToggleLock.status === 'locked' ? (
                <UnlockIcon className="h-6 w-6 text-yellow-600" />
              ) : (
                <LockIcon className="h-6 w-6 text-yellow-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-center mb-4">
              {userToToggleLock.status === 'locked' ? 'Unlock User' : 'Lock User'}
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              {userToToggleLock.status === 'locked'
                ? `Are you sure you want to unlock ${userToToggleLock.name || userToToggleLock.email}'s account? They will regain access to the system.`
                : `Are you sure you want to lock ${userToToggleLock.name || userToToggleLock.email}'s account? They will be unable to log in until unlocked.`
              }
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setShowLockConfirmation(false);
                  setUserToToggleLock(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleLock}
                className={`px-4 py-2 ${
                  userToToggleLock.status === 'locked'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white rounded-md`}
              >
                {userToToggleLock.status === 'locked' ? 'Unlock' : 'Lock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User profile header */}
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <span className="text-gray-600 text-2xl font-medium">
                    {selectedUser.name 
                      ? selectedUser.name.charAt(0).toUpperCase() 
                      : selectedUser.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h4 className="text-xl font-semibold">{selectedUser.name || 'Unnamed User'}</h4>
                <p className="text-gray-500 flex items-center">
                  <MailIcon className="w-4 h-4 mr-1" />
                  {selectedUser.email}
                </p>
                <div className="mt-2 flex space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.role === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedUser.role === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedUser.status === 'locked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedUser.status === 'active' ? 'Active' : selectedUser.status === 'locked' ? 'Locked' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* User details */}
              <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Created</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
                
                {selectedUser.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Forms Created</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser._count?.forms || 0}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Submissions</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedUser._count?.submissions || 0}</p>
                </div>
              </div>
              
              {/* User forms summary - would be populated from real data in a production app */}
              {(selectedUser._count?.forms || 0) > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Recent Forms</h4>
                  <ul className="space-y-2">
                    {[...Array(Math.min(3, selectedUser._count?.forms || 0))].map((_, i) => (
                      <li key={i} className="bg-gray-50 p-2 rounded text-sm">
                        <Link 
                          href={`/forms/${i}`}
                          className="text-blue-600 hover:underline"
                        >
                          Example Form {i+1}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {Math.floor(Math.random() * 20)} submissions
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {(selectedUser._count?.forms || 0) > 3 && (
                    <p className="text-sm text-center mt-2">
                      <Link 
                        href={`/forms?user=${selectedUser.id}`}
                        className="text-blue-600 hover:underline flex items-center justify-center"
                      >
                        View all {selectedUser._count?.forms} forms
                        <ChevronDownIcon className="w-3 h-3 ml-1" />
                      </Link>
                    </p>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push(`/admin/users/${selectedUser.id}/edit`);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Edit2Icon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                
                {selectedUser.id !== me?.id && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setUserToToggleLock(selectedUser);
                      setShowLockConfirmation(true);
                    }}
                    className={`px-4 py-2 ${
                      selectedUser.status === 'locked'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    } rounded-md flex items-center`}
                  >
                    {selectedUser.status === 'locked' ? (
                      <>
                        <UnlockIcon className="w-4 h-4 mr-1" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-4 h-4 mr-1" />
                        Lock
                      </>
                    )}
                  </button>
                )}
                
                {selectedUser.id !== me?.id && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setUserBeingDeleted(selectedUser.id);
                      setShowDeleteConfirmation(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Trash2Icon className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                )}
                
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}