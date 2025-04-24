"use client"

import React, { useState, useEffect } from 'react';
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Checkbox = React.forwardRef<
  HTMLDivElement,
  CheckboxProps
>(({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onCheckedChange?.(newValue);
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked && "bg-blue-600 border-blue-600",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleChange}
      {...props}
    >
      {isChecked && (
        <div className="flex items-center justify-center text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox as default }; 