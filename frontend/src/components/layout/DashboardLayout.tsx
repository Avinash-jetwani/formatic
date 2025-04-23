'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
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

  // Sidebar content to be reused in both desktop and mobile views
  const renderNavItems = () => (
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
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Formatic
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4 overflow-y-auto">
              <div className="px-4 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                  Formatic
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-10 w-10 rounded-md flex items-center justify-center"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
              <div className="mt-5 px-2 space-y-1">
                {renderNavItems()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="h-full flex flex-col bg-white shadow-lg">
          <div className="p-4 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Formatic
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderNavItems()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm mt-12 lg:mt-0">
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
              <div className="mr-4 hidden sm:block">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Client'}
                </span>
                <span className="text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">
                  {user?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}