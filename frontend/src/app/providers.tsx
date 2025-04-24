'use client';

import React from 'react';
import { ToastProvider } from '@/components/ui/use-toast/Toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
} 