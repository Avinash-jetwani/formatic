import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormInterfaceProps {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function FormInterface({
  title,
  children,
  actions,
  isLoading = false,
  error = null,
  breadcrumbs = [],
}: FormInterfaceProps) {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-4 text-sm font-medium">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx} className="inline-flex items-center">
                {idx > 0 && (
                  <svg className="w-3 h-3 mx-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-500">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
} 