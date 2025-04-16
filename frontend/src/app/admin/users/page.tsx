'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usersService } from '@/services/api'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function UsersContent() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // load all users on mount
  useEffect(() => {
    async function load() {
      try {
        console.log('Current user:', currentUser)
        
        const { data, error } = await usersService.getAllUsers()
        console.log('Users API response:', data, error)
        
        if (error) {
          setError(error)
        } else {
          setUsers(data || [])
        }
      } catch (err) {
        console.error('Error loading users:', err)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [currentUser])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600 p-6">Error: {error}</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{user.name || '—'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'SUPER_ADMIN'
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AuthProvider>
      <UsersContent />
    </AuthProvider>
  )
}