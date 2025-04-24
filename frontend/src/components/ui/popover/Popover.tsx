import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PopoverProps {
  children: ReactNode;
  className?: string;
}

interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function Popover({ 
  children,
  className 
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const value = {
    open: isOpen,
    setOpen: setIsOpen
  };
  
  return (
    <PopoverContext.Provider value={value}>
      <div className={cn('relative inline-block', className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

interface PopoverContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover compound components must be used within a Popover component');
  }
  return context;
}

export function PopoverTrigger({ 
  children, 
  asChild = false 
}: PopoverTriggerProps) {
  const { open, setOpen } = usePopoverContext();
  
  const handleClick = () => {
    setOpen(!open);
  };
  
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick
    });
  }
  
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
}

export function PopoverContent({ 
  children, 
  className,
  align = 'center' 
}: PopoverContentProps) {
  const { open, setOpen } = usePopoverContext();
  const ref = useRef<HTMLDivElement>(null);
  
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };
  
  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
  
  if (!open) return null;
  
  return (
    <div 
      ref={ref}
      className={cn(
        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md animate-in fade-in-80',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
} 