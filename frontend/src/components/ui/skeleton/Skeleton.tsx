import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-gray-200", 
        className
      )} 
      {...props} 
    />
  );
} 