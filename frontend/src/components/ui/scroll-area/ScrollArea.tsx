import React from 'react';
import { cn } from '@/utils/cn';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

export function ScrollArea({
  children,
  className,
  orientation = 'vertical',
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'relative overflow-auto',
        orientation === 'vertical' ? 'h-full w-full' : 'h-full w-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 