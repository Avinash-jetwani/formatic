import React, { forwardRef, useState, InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, RefreshCw, Copy, XCircle, CheckCircle2, Info } from 'lucide-react';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  showGenerateButton?: boolean;
  showStrengthIndicator?: boolean;
  onCopy?: () => void;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    className, 
    label, 
    error, 
    hint, 
    fullWidth = true, 
    id, 
    required, 
    showGenerateButton = false,
    showStrengthIndicator = true,
    onCopy,
    onChange,
    value,
    ...props 
  }, ref) => {
    const inputId = id || `password-input-${Math.random().toString(36).substring(2, 10)}`;
    const [showPassword, setShowPassword] = useState(false);
    const [generatingPassword, setGeneratingPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showCopyMessage, setShowCopyMessage] = useState(false);

    // Calculate password strength
    const calculatePasswordStrength = (password: string) => {
      if (!password) return 0;
      
      // Starting score
      let strength = 0;
      
      // Add length score (max 40 points)
      strength += Math.min(password.length * 4, 40);
      
      // Add complexity score
      if (/[A-Z]/.test(password)) strength += 15; // uppercase
      if (/[a-z]/.test(password)) strength += 15; // lowercase
      if (/[0-9]/.test(password)) strength += 15; // numbers
      if (/[^A-Za-z0-9]/.test(password)) strength += 15; // special chars
      
      // Return capped at 100
      return Math.min(strength, 100);
    };

    // Generate a random secure password
    const generateRandomPassword = () => {
      setGeneratingPassword(true);
      
      try {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]';
        let password = '';
        
        // Ensure at least one of each type of character
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%^&*()_+{}[]'[Math.floor(Math.random() * 18)];
        
        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
          password += charset[Math.floor(Math.random() * charset.length)];
        }
        
        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        // Update the input value by creating a synthetic event
        const event = {
          target: { value: password }
        } as React.ChangeEvent<HTMLInputElement>;
        
        if (onChange) {
          onChange(event);
        }
        
        // Update strength
        setPasswordStrength(calculatePasswordStrength(password));
        setShowPassword(true);
      } catch (err) {
        console.error('Error generating password', err);
      } finally {
        setGeneratingPassword(false);
      }
    };

    // Copy password to clipboard
    const copyPasswordToClipboard = () => {
      if (typeof value === 'string' && value) {
        navigator.clipboard.writeText(value)
          .then(() => {
            setShowCopyMessage(true);
            setTimeout(() => {
              setShowCopyMessage(false);
            }, 2000);
            
            if (onCopy) {
              onCopy();
            }
          })
          .catch(err => {
            console.error('Failed to copy password', err);
          });
      }
    };

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      if (showStrengthIndicator) {
        setPasswordStrength(calculatePasswordStrength(e.target.value));
      }
    };

    return (
      <div className={cn('mb-4', fullWidth && 'w-full', className)}>
        {label && (
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {showGenerateButton && (
              <button
                type="button"
                onClick={generateRandomPassword}
                disabled={generatingPassword}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                {generatingPassword ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Generate password
              </button>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={cn(
              'block w-full rounded-md border shadow-sm sm:text-sm py-2 px-3 pr-24',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'placeholder:text-gray-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
              fullWidth ? 'w-full' : 'w-auto'
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            required={required}
            onChange={handleChange}
            value={value}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            {typeof value === 'string' && value && (
              <button
                type="button"
                onClick={copyPasswordToClipboard}
                className="text-gray-400 hover:text-gray-600"
                title="Copy password"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Password strength meter */}
        {showStrengthIndicator && typeof value === 'string' && value && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full', 
                  passwordStrength < 50 ? 'bg-red-500' : 
                  passwordStrength < 100 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500 flex items-center">
              {passwordStrength < 50 && (
                <>
                  <XCircle className="w-3 h-3 text-red-500 mr-1" />
                  Weak password
                </>
              )}
              {passwordStrength >= 50 && passwordStrength < 100 && (
                <>
                  <Info className="w-3 h-3 text-yellow-500 mr-1" />
                  Moderate password
                </>
              )}
              {passwordStrength === 100 && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" />
                  Strong password
                </>
              )}
            </p>
          </div>
        )}
        
        {/* Clipboard message */}
        {showCopyMessage && (
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Password copied to clipboard
          </div>
        )}
        
        {error && (
          <p className="mt-2 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-gray-500" id={`${inputId}-hint`}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput }; 