import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToastProps {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
  onClose?: () => void;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
  toasts: (ToastProps & { id: string })[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    
    if (props.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, props.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-xs w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => {
            toast.onClose?.();
            removeToast(toast.id);
          }}
        />
      ))}
    </div>
  );
}

function Toast({
  title,
  description,
  variant = 'default',
  onClose,
}: ToastProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    destructive: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div
      className={cn(
        'rounded-lg border shadow-lg p-4 animate-in slide-in-from-right-full',
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="grid gap-1">
          {title && <h5 className="font-medium">{title}</h5>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="rounded-md text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 