'use client';

import React, { useState, useEffect } from 'react';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
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
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        aria-label={ariaLabel}
      />
      <div 
        onClick={handleChange}
        className={`
          h-4 w-4 rounded border transition-colors
          ${isChecked 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-white border-gray-300'}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'}
        `}
      >
        {isChecked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M4 8l2 2 6-6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Checkbox; 