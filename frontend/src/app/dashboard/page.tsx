'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formsService, submissionsService } from '@/services/api';
import { AuthProvider } from '@/contexts/AuthContext';

// Separate component that uses the auth context
function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    formCount: 0,
    submissionCount: 0,
    recentForms: [],
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [formsRes, submissionsRes] = await Promise.all([
          formsService.getAllForms(),
          submissionsService.getAllSubmissions(),
        ]);

        if (formsRes.data && submissionsRes.data) {
          setStats({
            formCount: formsRes.data.length,
            submissionCount: submissionsRes.data.length,
            recentForms: formsRes.data.slice(0, 5),
            recentSubmissions: submissionsRes.data.slice(0, 5),
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || user?.email}</h2>
          <p className="text-gray-600">
            {user?.role === 'SUPER_ADMIN'
              ? 'You have super admin privileges. You can manage users, forms, and view all submissions.'
              : 'You can create forms, manage them, and view submissions from your customers.'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.formCount}</p>
              <p className="text-sm text-gray-600">Forms</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.submissionCount}</p>
              <p className="text-sm text-gray-600">Submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Forms</h2>
          <div className="space-y-4">
            {stats.recentForms.length > 0 ? (
              stats.recentForms.map((form: any) => (
                <div key={form.id} className="border-b pb-2">
                  <p className="font-semibold">{form.title}</p>
                  <p className="text-sm text-gray-600">
                    {form.published ? 'Published' : 'Draft'} • 
                    {form._count?.submissions || 0} submissions
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No forms created yet.</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
          <div className="space-y-4">
            {stats.recentSubmissions.length > 0 ? (
              stats.recentSubmissions.map((submission: any) => (
                <div key={submission.id} className="border-b pb-2">
                  <p className="font-semibold">
                    Form: {submission.form?.title || 'Unknown Form'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No submissions received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with AuthProvider
export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}