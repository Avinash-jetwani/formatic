import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cva } from 'class-variance-authority';

// Define property variants
const buttonVariants = cva(
  "flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-50 text-blue-700 hover:bg-blue-100",
        success: "bg-green-50 text-green-700 hover:bg-green-100",
        warning: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        danger: "bg-red-50 text-red-700 hover:bg-red-100",
        info: "bg-purple-50 text-purple-700 hover:bg-purple-100",
        default: "bg-gray-50 text-gray-700 hover:bg-gray-100",
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface FormQuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "default";
  onClick?: () => void;
  href?: string;
  isExternal?: boolean;
}

export const FormQuickActionButton: React.FC<FormQuickActionButtonProps> = ({
  label,
  icon: Icon,
  variant = "default",
  onClick,
  href,
  isExternal = false
}) => {
  const className = buttonVariants({ variant });

  // If it has an href, render as a link
  if (href) {
    const linkProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
    
    return (
      <Link 
        href={href} 
        className={className}
        {...linkProps}
      >
        <Icon className="h-4 w-4 mb-1" />
        {label}
      </Link>
    );
  }
  
  // Otherwise, render as a button
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mb-1" />
      {label}
    </button>
  );
}; 