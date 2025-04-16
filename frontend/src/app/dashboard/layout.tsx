// src/app/dashboard/layout.tsx
'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MainLayout>{children}</MainLayout>
    </AuthProvider>
  );
}