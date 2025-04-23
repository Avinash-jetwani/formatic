'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { usersService, formsService, submissionsService } from '@/services/api';

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalForms: 0,
    totalSubmissions: 0,
    activeUsers: 0,
    publishedForms: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Only proceed if user is Super Admin
        if (!user || user.role !== 'SUPER_ADMIN') {
          setError('You do not have permission to access this dashboard');
          setLoading(false);
          return;
        }

        // Fetch stats in parallel
        const [usersRes, formsRes, submissionsRes] = await Promise.all([
          usersService.getUsers(),
          formsService.getForms(),
          submissionsService.getAllSubmissions()
        ]);

        if (usersRes.error || formsRes.error || submissionsRes.error) {
          setError('Failed to load dashboard data');
          setLoading(false);
          return;
        }

        // Calculate stats
        const activeUsers = usersRes.data ? usersRes.data.filter(u => u.active).length : 0;
        const publishedForms = formsRes.data ? formsRes.data.filter(f => f.published).length : 0;
        const recentSubmissions = submissionsRes.data 
          ? submissionsRes.data.slice(0, 5).map(s => ({
              id: s.id,
              formId: s.formId,
              formTitle: s.form?.title || 'Unknown Form',
              createdAt: s.createdAt
            }))
          : [];

        setStats({
          totalUsers: usersRes.data ? usersRes.data.length : 0,
          totalForms: formsRes.data ? formsRes.data.length : 0,
          totalSubmissions: submissionsRes.data ? submissionsRes.data.length : 0,
          activeUsers,
          publishedForms,
          recentSubmissions
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('An error occurred while loading dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Users</span>
              <span className="text-sm font-medium text-green-600">{stats.activeUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Forms</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalForms}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Published Forms</span>
              <span className="text-sm font-medium text-green-600">{stats.publishedForms}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.totalForms ? (stats.publishedForms / stats.totalForms) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Submissions Rate</span>
              <span className="text-sm font-medium text-blue-600">
                {stats.totalForms ? (stats.totalSubmissions / stats.totalForms).toFixed(1) : 0} per form
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition duration-150"
          >
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Manage Users</p>
              <p className="text-sm text-gray-500">Add, edit, or deactivate users</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/forms')}
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition duration-150"
          >
            <div className="p-2 rounded-full bg-purple-100 mr-3">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">Manage Forms</p>
              <p className="text-sm text-gray-500">Create or modify forms</p>
            </div>
          </button>
          <button
            onClick={() => router.push('/submissions')}
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition duration-150"
          >
            <div className="p-2 rounded-full bg-yellow-100 mr-3">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium">View Submissions</p>
              <p className="text-sm text-gray-500">Browse all form submissions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
        {stats.recentSubmissions.length > 0 ? (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Form
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {submission.formTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/submissions/${submission.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No submissions yet</p>
          </div>
        )}
        {stats.totalSubmissions > 5 && (
          <div className="mt-4 text-right">
            <button
              onClick={() => router.push('/submissions')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all submissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <AdminDashboardContent />
    </AuthProvider>
  );
}