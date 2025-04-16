// src/app/(dashboard)/admin/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usersService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, user } = useAuth();
  const router = useRouter();

  // State for creating a new user
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CLIENT',
  });

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data, error } = await usersService.getAllUsers();
        if (data && !error) {
          setUsers(data);
        } else {
          setError(error || 'Failed to fetch users');
        }
      } catch (err) {
        setError('An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAdmin, router]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await usersService.createUser(newUser);
      if (data && !error) {
        setUsers([...users, data]);
        setShowAddUserForm(false);
        setNewUser({
          email: '',
          password: '',
          name: '',
          role: 'CLIENT',
        });
      } else {
        setError(error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Don't allow deleting self
    if (userId === user?.id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { error } = await usersService.deleteUser(userId);
        if (!error) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          setError(error || 'Failed to delete user');
        }
      } catch (err) {
        setError('An error occurred');
      }
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setShowAddUserForm(!showAddUserForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      {showAddUserForm && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddUserForm(false)}
                  className="mr-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Role
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Created
                   </th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {users.map(user => (
                   <tr key={user.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">
                         {user.name || 'N/A'}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-500">
                         {user.email}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                         user.role === 'SUPER_ADMIN' 
                           ? 'bg-purple-100 text-purple-800' 
                           : 'bg-blue-100 text-blue-800'
                       }`}>
                         {user.role}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-500">
                         {new Date(user.createdAt).toLocaleDateString()}
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <button
                         onClick={() => handleDeleteUser(user.id)}
                         className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={user.id === user?.id}
                       >
                         Delete
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     </div>
   </div>
 );
}