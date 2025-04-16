// src/components/layout/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Common menu items for all authenticated users
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

  // Admin-only menu items
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

  return (
    <div className="w-64 bg-white shadow h-screen">
      <div className="pt-5 pb-4">
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  pathname === item.href
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
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </div>
                {adminMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      pathname === item.href
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
  );
};

export default Sidebar;