'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Only redirect after the auth context has finished loading
    if (!loading) {
      setIsInitializing(false);
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);
  
  // Show loading state while checking authentication
  if (loading || isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render the layout
  if (!isAuthenticated) {
    return null;
  }

  // Admin check from user role
  const isAdmin = user?.role === 'SUPER_ADMIN';

  // Menu items available to all users
  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Forms',
      href: '/forms',
      icon: '📝',
    },
    {
      name: 'Submissions',
      href: '/submissions',
      icon: '📥',
    },
  ];

  // Menu items only for admins
  const adminMenuItems = [
    {
      name: 'Users',
      href: '/admin/users',
      icon: '👥',
    },
    {
      name: 'System',
      href: '/admin/system',
      icon: '⚙️',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow h-screen fixed left-0 top-0">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Formatic
          </Link>
        </div>
        <div className="p-4">
          <nav>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="border-t border-gray-200 my-3 pt-3">
                    <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin
                    </h3>
                  </div>
                  {adminMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              {/* Breadcrumb or page title could go here */}
              {pathname !== '/dashboard' && (
                <button 
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <span className="mr-1">←</span> Back
                </button>
              )}
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Client'}
                </span>
                <span className="text-sm text-gray-600">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}