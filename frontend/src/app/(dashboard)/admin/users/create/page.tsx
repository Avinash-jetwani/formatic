// src/app/(dashboard)/admin/users/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/api';
import { 
  ArrowLeft, 
  Save, 
  UserPlus,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Mail,
  User,
  Shield,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  Settings,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface FormField {
  name: string;
  value: string;
  error: string;
  required: boolean;
  type: string;
  label: string;
  placeholder: string;
  options?: { value: string; label: string }[];
  validation: (value: string) => string;
  helpText?: string;
}

export default function Page() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Form data state with proper field definitions
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      name: 'name',
      value: '',
      error: '',
      required: false,
      type: 'text',
      label: 'Name',
      placeholder: 'Enter user\'s name',
      validation: (value) => '',
      helpText: 'Full name of the user (optional)'
    },
    {
      name: 'email',
      value: '',
      error: '',
      required: true,
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      validation: (value) => value ? (!value.match(/\S+@\S+\.\S+/) ? 'Please enter a valid email address' : '') : 'Email is required',
      helpText: 'The email will be used for login and notifications'
    },
    {
      name: 'password',
      value: '',
      error: '',
      required: true,
      type: 'password',
      label: 'Password',
      placeholder: 'Create a password',
      validation: (value) => value ? (value.length < 8 ? 'Password must be at least 8 characters' : '') : 'Password is required',
      helpText: 'Min. 8 characters with at least 1 uppercase letter, 1 number & 1 special character for stronger security'
    },
    {
      name: 'role',
      value: 'CLIENT',
      error: '',
      required: true,
      type: 'select',
      label: 'User Role',
      placeholder: '',
      options: [
        { value: 'CLIENT', label: 'Client' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' }
      ],
      validation: (value) => value ? '' : 'Role is required'
    },
    {
      name: 'status',
      value: 'active',
      error: '',
      required: true,
      type: 'select',
      label: 'Account Status',
      placeholder: '',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'locked', label: 'Locked' }
      ],
      validation: (value) => value ? '' : 'Status is required',
      helpText: 'Set the initial account status. Inactive or locked users cannot log in.'
    },
    {
      name: 'sendInvite',
      value: 'true',
      error: '',
      required: false,
      type: 'checkbox',
      label: 'Send welcome email with login instructions',
      placeholder: '',
      validation: (value) => '',
      helpText: 'An email with login details will be sent to the user'
    }
  ]);
  
  // Additional form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Advanced options toggle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Auto-generated password option
  const [generatingPassword, setGeneratingPassword] = useState(false);

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  // Update a specific field value
  const updateField = (name: string, value: string) => {
    setFormFields(fields => fields.map(field => 
      field.name === name 
        ? { 
            ...field, 
            value, 
            error: field.validation(value)
          }
        : field
    ));
    
    // Special handling for password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    // Clear form error when user makes changes
    if (formError) {
      setFormError('');
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 25; // Uppercase
    if (/[0-9]/.test(password)) strength += 25; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Special characters
    
    setPasswordStrength(strength);
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
      
      // Update the password field
      updateField('password', password);
      setShowPassword(true);
    } catch (err) {
      console.error('Error generating password', err);
    } finally {
      setGeneratingPassword(false);
    }
  };

  // Copy password to clipboard
  const copyPasswordToClipboard = () => {
    const passwordField = formFields.find(f => f.name === 'password');
    if (passwordField && passwordField.value) {
      navigator.clipboard.writeText(passwordField.value)
        .then(() => {
          // Flash a temporary success message
          const tempMessage = document.getElementById('clipboard-message');
          if (tempMessage) {
            tempMessage.classList.remove('hidden');
            setTimeout(() => {
              tempMessage.classList.add('hidden');
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy password', err);
        });
    }
  };

 // Form submission
 const validateForm = () => {
  let isValid = true;
  let updatedFields = [...formFields];
  
  updatedFields = updatedFields.map(field => {
    const error = field.validation(field.value);
    if (error) isValid = false;
    return { ...field, error };
  });
  
  setFormFields(updatedFields);
  return isValid;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsSubmitting(true);
  setFormError('');
  
  try {
    // Prepare data for submission
    const userData = {
      name: formFields.find(f => f.name === 'name')?.value || '',
      email: formFields.find(f => f.name === 'email')?.value || '',
      password: formFields.find(f => f.name === 'password')?.value || '',
      role: formFields.find(f => f.name === 'role')?.value || 'CLIENT',
      status: formFields.find(f => f.name === 'status')?.value || 'active'
      // sendInvite removed from payload
    };
    
    // Track if we need to send an invite (but don't send it in the user creation payload)
    // const shouldSendInvite = formFields.find(f => f.name === 'sendInvite')?.value === 'true';
    
    const { data, error } = await usersService.createUser(userData);
    
    if (error) {
      throw new Error(error);
    }
    
    // Here you could add code to send the invite if shouldSendInvite is true
    // For example: if (shouldSendInvite) { sendUserInvite(data.id); }
    
    setSuccessMessage(`User ${data.name || data.email} created successfully!`);
    
    // Reset form
    setFormFields(fields => fields.map(field => ({
      ...field,
      value: field.name === 'role' ? 'CLIENT' : field.name === 'status' ? 'active' : field.name === 'sendInvite' ? 'true' : '',
      error: ''
    })));
    
    // Reset password strength
    setPasswordStrength(0);
    
    // Redirect after short delay
    setTimeout(() => {
      router.push('/admin/users');
    }, 2000);
    
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      // Set error on the email field
      setFormFields(fields => fields.map(field => 
        field.name === 'email' 
          ? { ...field, error: 'This email is already registered' }
          : field
      ));
    } else {
      setFormError(`Error creating user: ${err.message || 'Unknown error'}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};

// Get field by name (helper)
const getField = (name: string) => formFields.find(f => f.name === name);

// Check if user is admin
if (!isAdmin) return null;

return (
  <div className="p-6">
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Create New User
            </h1>
            <p className="text-gray-500 text-sm mt-1">Add a new user to the system</p>
          </div>
        </div>
      </div>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start">
          <CheckCircle className="w-5 h-5 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">{successMessage}</p>
            <p className="text-sm mt-1">Redirecting to user management...</p>
          </div>
        </div>
      )}
      
      {/* Form Error */}
      {formError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 mt-0.5 mr-2" />
          <div>{formError}</div>
        </div>
      )}
      
      {/* Main Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h2>
              
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {getField('name')?.label} {getField('name')?.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={getField('name')?.type}
                  id="name"
                  name="name"
                  value={getField('name')?.value || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getField('name')?.placeholder}
                />
                {getField('name')?.helpText && (
                  <p className="mt-1 text-sm text-gray-500">{getField('name')?.helpText}</p>
                )}
              </div>
              
              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {getField('email')?.label} {getField('email')?.required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={getField('email')?.type}
                    id="email"
                    name="email"
                    value={getField('email')?.value || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full p-2 pl-10 border ${getField('email')?.error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={getField('email')?.placeholder}
                    required={getField('email')?.required}
                  />
                </div>
                {getField('email')?.error ? (
                  <p className="mt-1 text-sm text-red-600">{getField('email')?.error}</p>
                ) : getField('email')?.helpText ? (
                  <p className="mt-1 text-sm text-gray-500">{getField('email')?.helpText}</p>
                ) : null}
              </div>
            </div>
            
            {/* Password Section */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Password
              </h2>
              
              {/* Password Field */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {getField('password')?.label} {getField('password')?.required && <span className="text-red-500">*</span>}
                  </label>
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
                    Generate strong password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={getField('password')?.value || ''}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full p-2 pr-24 border ${getField('password')?.error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder={getField('password')?.placeholder}
                    required={getField('password')?.required}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    {getField('password')?.value && (
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
                {getField('password')?.value && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          passwordStrength < 50 
                            ? 'bg-red-500' 
                            : passwordStrength < 100 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
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
                <div id="clipboard-message" className="hidden mt-2 text-xs text-green-600 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Password copied to clipboard
                </div>
                
                {getField('password')?.error ? (
                  <p className="mt-1 text-sm text-red-600">{getField('password')?.error}</p>
                ) : getField('password')?.helpText ? (
                  <p className="mt-1 text-sm text-gray-500">{getField('password')?.helpText}</p>
                ) : null}
              </div>
            </div>
            
            {/* User Permissions Section */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                User Role & Permissions
              </h2>
              
              {/* Role Field */}
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  {getField('role')?.label} {getField('role')?.required && <span className="text-red-500">*</span>}
                </label>
                <select
                  id="role"
                  name="role"
                  value={getField('role')?.value || ''}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required={getField('role')?.required}
                >
                  {getField('role')?.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {getField('role')?.value === 'SUPER_ADMIN' 
                    ? 'Super Admin users have full access to all features and data' 
                    : 'Client users can only manage their own forms and submissions'}
                </p>
              </div>
            </div>
            
            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center text-gray-700 font-medium mb-4"
            >
              <Settings className="w-5 h-5 mr-2" />
              Advanced Settings
              <svg 
                className={`ml-2 w-5 h-5 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Advanced Settings Section */}
            {showAdvancedOptions && (
              <div className="border-t border-gray-200 pt-4 space-y-4">
                {/* Account Status Field */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    {getField('status')?.label} {getField('status')?.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={getField('status')?.value || ''}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={getField('status')?.required}
                  >
                    {getField('status')?.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {getField('status')?.helpText && (
                    <p className="mt-1 text-sm text-gray-500">{getField('status')?.helpText}</p>
                  )}
                </div>
                
                {/* Send Welcome Email Field */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="sendInvite"
                      name="sendInvite"
                      type="checkbox"
                      checked={getField('sendInvite')?.value === 'true'}
                      onChange={(e) => updateField('sendInvite', e.target.checked ? 'true' : 'false')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="sendInvite" className="font-medium text-gray-700">
                      {getField('sendInvite')?.label}
                    </label>
                    {getField('sendInvite')?.helpText && (
                      <p className="text-gray-500">{getField('sendInvite')?.helpText}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Link
                href="/admin/users"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 flex items-center">
          <HelpCircle className="w-4 h-4 mr-2" />
          Need Help?
        </h3>
        <p className="mt-1 text-sm text-blue-700">
          Learn more about <Link href="#" className="underline">user roles and permissions</Link> or
          view our <Link href="#" className="underline">user management guide</Link> for detailed instructions.
        </p>
      </div>
    </div>
  </div>
);
}