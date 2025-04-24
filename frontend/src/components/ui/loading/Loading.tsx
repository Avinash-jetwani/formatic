import React from 'react';
import { cn } from '@/utils/cn';

export interface LoadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingProps> = ({
  className,
  size = 'md',
  variant = 'primary',
  fullPage = false,
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  const spinner = (
    <svg
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50" {...props}>
        {spinner}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex', className)} {...props}>
      {spinner}
    </div>
  );
};

export const LoadingCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'border border-gray-200 shadow-sm rounded-lg p-4 w-full animate-pulse',
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3 mt-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export const LoadingTable: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn('w-full animate-pulse', className)} {...props}>
      {/* Table header */}
      <div className="flex py-3 border-b border-gray-200">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-6 bg-gray-200 rounded mr-4"></div>
        ))}
      </div>
      {/* Table rows */}
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex py-4 border-b border-gray-100">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="flex-1 h-5 bg-gray-100 rounded mr-4"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const NoDataDisplay: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    message?: string;
    icon?: React.ReactNode;
  }
> = ({ className, message = 'No data available', icon, ...props }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center text-gray-500',
        className
      )}
      {...props}
    >
      {icon || (
        <svg
          className="w-12 h-12 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      )}
      <p className="text-lg">{message}</p>
    </div>
  );
}; 