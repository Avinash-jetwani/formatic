import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function FormField({
  id,
  label,
  type = 'text',
  required = false,
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  options = [],
  min,
  max,
  rows = 3,
  className = '',
  disabled = false,
}: FormFieldProps) {
  const baseInputClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
  const validClasses = "border-gray-300 focus:border-blue-500";
  const errorClasses = "border-red-300 focus:border-red-500 focus:ring-red-500";
  const disabledClasses = "bg-gray-100 text-gray-500 cursor-not-allowed";
  
  const inputClasses = `${baseInputClasses} ${error ? errorClasses : validClasses} ${disabled ? disabledClasses : ''}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium mb-1 ${error ? 'text-red-500' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          value={value}
          onChange={onChange as any}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            id={id}
            name={id}
            type="checkbox"
            checked={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          {helperText && (
            <span className="ml-2 text-gray-500 text-sm">{helperText}</span>
          )}
        </div>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={inputClasses}
        />
      )}
      
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helperText && type !== 'checkbox' ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
} 