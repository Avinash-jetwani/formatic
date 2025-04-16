'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Create a separate component that uses useAuth
function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  // Only show admin navigation if user is a Super Admin
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-semibold text-red-600">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You do not have permission to access the admin area.
            </p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your layout code...
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation and other layout elements */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Export the main layout component that wraps with AuthProvider
export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}