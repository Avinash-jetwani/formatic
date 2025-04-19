// src/app/(dashboard)/admin/users/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/api';
import {
  SearchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Trash2Icon,
  Edit2Icon,
  DownloadIcon,
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CLIENT';
  createdAt: string;
}

export default function UsersPage() {
  const { isAdmin, user: me } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // search/filter/sort/pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'SUPER_ADMIN'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await usersService.getAllUsers();
        if (data && !error) setUsers(data);
        else setError(error || 'Failed to load users');
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, router]);

  // derived filtered & sorted
  const filtered = useMemo(() => {
    let arr = users;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      arr = arr.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'ALL') {
      arr = arr.filter(u => u.role === filterRole);
    }
    arr = arr.slice().sort((a, b) => {
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
  }, [users, searchTerm, filterRole, sortBy, sortOrder]);

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

  const handleDelete = async (id: string) => {
    if (id === me?.id) {
      alert("You can't delete yourself.");
      return;
    }
    if (!confirm('Delete this user?')) return;
    try {
      const { error } = await usersService.deleteUser(id);
      if (error) throw new Error(error);
      setUsers(u => u.filter(x => x.id !== id));
      setSelectedIds(s => { s.delete(id); return new Set(s); });
      alert('User deleted');
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
    for (let id of selectedIds) {
      await usersService.deleteUser(id);
    }
    setUsers(u => u.filter(x => !selectedIds.has(x.id)));
    setSelectedIds(new Set());
    alert('Users deleted');
  };

  const handleExport = () => {
    const rows = [
      ['Name','Email','Role','Created'],
      ...filtered.map(u => [
        u.name||'',
        u.email,
        u.role,
        new Date(u.createdAt).toISOString().slice(0,10),
      ])
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv'; a.click();
    URL.revokeObjectURL(url);
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push('/dashboard/admin/users/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Edit2Icon className="w-5 h-5 mr-1" /> Add User
          </button>
          <button
            onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md flex items-center"
          >
            <DownloadIcon className="w-4 h-4 mr-1" /> Export CSV
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center"
            >
              <Trash2Icon className="w-4 h-4 mr-1" /> Delete {selectedIds.size}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative">
          <SearchIcon className="absolute top-2 left-2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-8 pr-3 py-2 border rounded-md"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => { setFilterRole(e.target.value as any); setCurrentPage(1); }}
          className="px-3 py-2 border rounded-md"
        >
          <option value="ALL">All Roles</option>
          <option value="CLIENT">Client</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginated.length && paginated.length>0}
                  onChange={e => {
                    if (e.target.checked) paginated.forEach(u => selectedIds.add(u.id));
                    else setSelectedIds(new Set());
                    setSelectedIds(new Set(selectedIds));
                  }}
                />
              </th>
              {['name','email','role','createdAt'].map(field => (
                <th
                  key={field}
                  onClick={() => toggleSort(field as any)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    {field === 'name' ? 'Name'
                      : field === 'email' ? 'Email'
                      : field === 'role' ? 'Role'
                      : 'Created'}
                    {sortBy === field &&
                      (sortOrder==='asc'
                        ? <ChevronUpIcon className="w-3 h-3"/>
                        : <ChevronDownIcon className="w-3 h-3"/>
                      )
                    }
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(u.id)}
                    onChange={() => toggleSelect(u.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {u.name || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role==='SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/admin/users/${u.id}/edit`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2Icon className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    disabled={u.id === me?.id}
                  >
                    <Trash2Icon className="w-4 h-4"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
            disabled={currentPage===1}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i+1)}
              className={`px-3 py-1 border rounded-md ${currentPage===i+1 ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              {i+1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(p+1, pageCount))}
            disabled={currentPage===pageCount}
            className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}