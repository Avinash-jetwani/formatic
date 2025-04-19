// src/app/(dashboard)/admin/users/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService, formsService } from '@/services/api';
import { 
  ArrowLeft, 
  Save, 
  User,
  Shield, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Mail,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info,
  Settings,
  Lock,
  Unlock,
  ClipboardList,
  Calendar,
  Clock,
  ExternalLink,
  Activity,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface FormField {
  name: string;
  value: string;
  originalValue?: string;
  error: string;
  required: boolean;
  type: string;
  label: string;
  placeholder: string;
  options?: { value: string; label: string }[];
  validation: (value: string) => string;
  helpText?: string;
  disabled?: boolean;
}

interface UserActivity {
  type: string;
  timestamp: string;
  details: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const userId = params.id;
  
  // Fields definition with proper state management
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      name: 'id',
      value: '',
      originalValue: '',
      error: '',
      required: false,
      type: 'text',
      label: 'User ID',
      placeholder: '',
      validation: () => '',
      disabled: true
    },
    {
      name: 'name',
      value: '',
      originalValue: '',
      error: '',
      required: false,
      type: 'text',
      label: 'Name',
      placeholder: 'Enter user\'s name',
      validation: () => '',
      helpText: 'Full name of the user (optional)'
    },
    {
      name: 'email',
      value: '',
      originalValue: '',
      error: '',
      required: true,
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      validation: (value) => value ? (!value.match(/\S+@\S+\.\S+/) ? 'Please enter a valid email address' : '') : 'Email is required',
      helpText: 'The email is used for login and notifications'
    },
    {
      name: 'password',
      value: '',
      originalValue: '',
      error: '',
      required: false,
      type: 'password',
      label: 'Password',
      placeholder: 'Enter new password',
      validation: (value) => value && value.length < 8 ? 'Password must be at least 8 characters' : '',
      helpText: 'Leave blank to keep current password'
    },
    {
      name: 'role',
      value: '',
      originalValue: '',
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
      value: '',
      originalValue: '',
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
      helpText: 'Inactive or locked users cannot log in'
    }
  ]);
  
  // Additional state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSelf, setIsSelf] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // User statistics
  const [stats, setStats] = useState({
    createdAt: '',
    lastLogin: '',
    formCount: 0,
    submissionCount: 0
  });

  // User activity log (simulated)
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingForms, setLoadingForms] = useState(false);
  
  // Recent forms by this user
  const [userForms, setUserForms] = useState<any[]>([]);
  
  // Active tab in the user details section
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'forms'>('profile');

  // Fetch user data
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true);
      setFormError('');
      
      try {
        const { data, error } = await usersService.getUser(userId);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          // Update form fields with user data
          setFormFields(fields => fields.map(field => {
            let value = '';
            
            // Map API response to form fields
            switch (field.name) {
              case 'id':
                value = data.id || '';
                break;
              case 'name':
                value = data.name || '';
                break;
              case 'email':
                value = data.email || '';
                break;
              case 'role':
                value = data.role || 'CLIENT';
                break;
              case 'status':
                value = data.status || 'active';
                break;
              case 'password':
                value = ''; // Never populate password
                break;
              default:
                value = '';
            }
            
            return {
              ...field,
              value,
              originalValue: value,
              error: ''
            };
          }));
          
          // Set user statistics (simulated in this example)
          setStats({
            createdAt: data.createdAt || new Date().toISOString(),
            lastLogin: data.lastLogin || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            formCount: Math.floor(Math.random() * 10),
            submissionCount: Math.floor(Math.random() * 50)
          });
          
          // Check if editing own account
          if (currentUser && currentUser.id === userId) {
            setIsSelf(true);
            
            // Disable role field when editing self
            setFormFields(fields => fields.map(field => 
              field.name === 'role' ? { ...field, disabled: true } : field
            ));
          }
        }
      } catch (err: any) {
        setFormError(`Error loading user: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAdmin, router, userId, currentUser]);
  
  // Fetch user activities when tab changes
  useEffect(() => {
    if (activeTab === 'activity' && activities.length === 0) {
      fetchUserActivities();
    } else if (activeTab === 'forms' && userForms.length === 0) {
      fetchUserForms();
    }
  }, [activeTab]);
  
  // Helper to get a field by name
  const getField = (name: string) => formFields.find(f => f.name === name);
  
  // Fetch user activities (simulated)
  const fetchUserActivities = async () => {
    setLoadingActivities(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate simulated activity data
      const now = new Date();
      const simulatedActivities: UserActivity[] = [
        {
          type: 'login',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'User logged in from 192.168.1.1'
        },
        {
          type: 'form_creation',
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'Created form "Customer Feedback Survey"'
        },
        {
          type: 'password_change',
          timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'User changed their password'
        },
        {
          type: 'login',
          timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'User logged in from 192.168.1.1'
        },
        {
          type: 'account_created',
          timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'Account created'
        }
      ];
      
      setActivities(simulatedActivities);
    } catch (error) {
      console.error('Error fetching user activities', error);
    } finally {
      setLoadingActivities(false);
    }
  };
  
  // Fetch user forms (simulated)
  const fetchUserForms = async () => {
    setLoadingForms(true);
    
    try {
      // In a real implementation, you'd use the actual API
      // const { data } = await usersService.getUserForms(userId);
      
      // Simulated forms data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date();
      const simulatedForms = [
        {
          id: '1',
          title: 'Customer Feedback Form',
          created: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          submissions: 12
        },
        {
          id: '2',
          title: 'Event Registration',
          created: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'published',
          submissions: 28
        },
        {
          id: '3',
          title: 'Support Request Form',
          created: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft',
          submissions: 0
        }
      ];
      
      setUserForms(simulatedForms);
    } catch (error) {
      console.error('Error fetching user forms', error);
    } finally {
      setLoadingForms(false);
    }
  };
  
  // Update field value
  const updateField = (name: string, value: string) => {
    setFormFields(fields => fields.map(field => 
      field.name === name 
        ? { ...field, value, error: field.validation(value) } 
        : field
    ));
    
    // Special handling for password strength
    if (name === 'password' && value) {
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
  
  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    let updatedFields = [...formFields];
    
    // Only validate fields that have changed or are required
    updatedFields = updatedFields.map(field => {
      // Skip validation for unchanged fields, except required ones
      if (field.value === field.originalValue && !field.required) {
        return { ...field, error: '' };
      }
      
      const error = field.validation(field.value);
      if (error) isValid = false;
      return { ...field, error };
    });
    
    setFormFields(updatedFields);
    return isValid;
  };
  
  // Check if any fields were modified
  const hasChanges = () => {
    return formFields.some(field => 
      // For password, any non-empty value is a change
      (field.name === 'password' && field.value) || 
      // For other fields, compare with original value
      (field.name !== 'password' && field.value !== field.originalValue)
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if anything actually changed
    if (!hasChanges()) {
      setFormError('No changes were made');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Prepare data for submission - only include changed fields
      const userData: Record<string, any> = {};
      
      formFields.forEach(field => {
        // For password, include if it has a value
        if (field.name === 'password') {
          if (field.value) userData.password = field.value;
        }
        // For other fields, include if different from original
        else if (field.value !== field.originalValue) {
          userData[field.name] = field.value;
        }
      });
      
      // Don't send ID in the payload
      delete userData.id;
      
      const { data, error } = await usersService.updateUser(userId, userData);
      
      if (error) {
        throw new Error(error);
      }
      
      setSuccessMessage(`User updated successfully!`);
      
      // Update original values to match current values
      setFormFields(fields => fields.map(field => ({
        ...field,
        originalValue: field.name !== 'password' ? field.value : '',
        value: field.name === 'password' ? '' : field.value,
        error: ''
      })));
      
      // Reset password strength
      setPasswordStrength(0);
      
      // Add this action to activities (in a real app this would come from the API)
      setActivities([
        {
          type: 'profile_update',
          timestamp: new Date().toISOString(),
          details: 'User profile updated'
        },
        ...activities
      ]);
      
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
        setFormError(`Error updating user: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show confirmation dialog for sensitive changes
  const confirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if certain sensitive fields were changed
    const roleChanged = getField('role')?.value !== getField('role')?.originalValue;
    const statusChanged = getField('status')?.value !== getField('status')?.originalValue;
    
    // Show confirmation dialog for sensitive changes
    if (roleChanged || statusChanged) {
      setShowConfirmation(true);
    } else {
      // No sensitive changes, proceed with submission
      handleSubmit(e);
    }
  };

  // Loading state
  if (!isAdmin) return null;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
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
                <User className="w-6 h-6" />
                Edit User Profile
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {getField('name')?.value || getField('email')?.value}
              </p>
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
        
        {/* Main Layout: Split into two columns on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              {/* Tabs for navigating different sections */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                      activeTab === 'profile'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                      activeTab === 'activity'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Activity Log
                  </button>
                  <button 
                    onClick={() => setActiveTab('forms')}
                    className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                      activeTab === 'forms'
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Forms
                  </button>
                </nav>
              </div>
              
              {/* Profile Tab Content */}
              {activeTab === 'profile' && (
                <form onSubmit={confirmSubmit} className="p-6 space-y-6">
                  {/* User ID Field (read-only) */}
                  <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                      {getField('id')?.label}
                    </label>
                    <input
                      type="text"
                      id="id"
                      value={getField('id')?.value || ''}
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Unique identifier for this user</p>
                  </div>
                  
                  {/* Name Field */}
                  <div>
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
                      disabled={getField('name')?.disabled}
                    />
                    {getField('name')?.error ? (
                      <p className="mt-1 text-sm text-red-600">{getField('name')?.error}</p>
                    ) : getField('name')?.helpText ? (
                      <p className="mt-1 text-sm text-gray-500">{getField('name')?.helpText}</p>
                    ) : null}
                  </div>
                  
                  {/* Email Field */}
                  <div>
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
                        disabled={getField('email')?.disabled}
                      />
                    </div>
                    {getField('email')?.error ? (
                      <p className="mt-1 text-sm text-red-600">{getField('email')?.error}</p>
                    ) : getField('email')?.helpText ? (
                      <p className="mt-1 text-sm text-gray-500">{getField('email')?.helpText}</p>
                    ) : null}
                  </div>
                  
                  {/* Password Field */}
                  <div>
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
                        Generate password
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
                        disabled={getField('password')?.disabled}
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
                  
                  {/* Role Field */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      {getField('role')?.label} {getField('role')?.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={getField('role')?.value || ''}
                      onChange={(e) => updateField('role', e.target.value)}
                      className={`w-full p-2 border ${getField('role')?.error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                      required={getField('role')?.required}
                      disabled={isSelf || getField('role')?.disabled}
                    >
                      {getField('role')?.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {getField('role')?.error ? (
                      <p className="mt-1 text-sm text-red-600">{getField('role')?.error}</p>
                    ) : isSelf ? (
                      <p className="mt-1 text-sm text-amber-600 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        You cannot change your own role
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        {getField('role')?.value === 'SUPER_ADMIN' 
                          ? 'Super Admin users have full access to all features and data' 
                          : 'Client users can only manage their own forms and submissions'}
                      </p>
                    )}
                  </div>
                  
                  {/* Advanced Settings Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center text-gray-700 font-medium"
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
                  
                  {/* Advanced Settings */}
                  {showAdvancedOptions && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      {/* Account Status */}
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          {getField('status')?.label} {getField('status')?.required && <span className="text-red-500">*</span>}
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={getField('status')?.value || ''}
                          onChange={(e) => updateField('status', e.target.value)}
                          className={`w-full p-2 border ${getField('status')?.error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                          required={getField('status')?.required}
                          disabled={isSelf || getField('status')?.disabled}
                        >
                          {getField('status')?.options?.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {getField('status')?.error ? (
                          <p className="mt-1 text-sm text-red-600">{getField('status')?.error}</p>
                        ) : isSelf ? (
                          <p className="mt-1 text-sm text-amber-600 flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            You cannot change your own account status
                          </p>
                        ) : getField('status')?.helpText ? (
                          <p className="mt-1 text-sm text-gray-500">{getField('status')?.helpText}</p>
                        ) : null}
                      </div>
                      
                      {/* Email Notifications */}
                      <div className="flex items-start pt-2">
                        <div className="flex items-center h-5">
                          <input
                            id="sendPasswordResetEmail"
                            name="sendPasswordResetEmail"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="sendPasswordResetEmail" className="font-medium text-gray-700">
                            Send password reset email
                          </label>
                          <p className="text-gray-500">User will receive an email with instructions to set a new password</p>
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
                      disabled={isSubmitting || !hasChanges()}
                      className={`px-4 py-2 ${
                        !hasChanges() 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white rounded-md flex items-center`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Activity Log Tab Content */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Activity Log</h3>
                  {loadingActivities ? (
                    <div className="flex justify-center items-center h-40">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No activity recorded for this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-start pb-4 border-b border-gray-100">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            activity.type === 'login' ? 'bg-green-100' :
                            activity.type === 'password_change' ? 'bg-blue-100' :
                            activity.type === 'account_created' ? 'bg-purple-100' :
                            activity.type === 'form_creation' ? 'bg-yellow-100' :
                            activity.type === 'profile_update' ? 'bg-indigo-100' :
                            'bg-gray-100'
                          }`}>
                            {activity.type === 'login' && <Lock className="w-5 h-5 text-green-600" />}
                            {activity.type === 'password_change' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                            {activity.type === 'account_created' && <UserPlus className="w-5 h-5 text-purple-600" />}
                            {activity.type === 'form_creation' && <FileText className="w-5 h-5 text-yellow-600" />}
                            {activity.type === 'profile_update' && <Save className="w-5 h-5 text-indigo-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.type === 'login' && 'User logged in'}
                              {activity.type === 'password_change' && 'Password changed'}
                              {activity.type === 'account_created' && 'Account created'}
                              {activity.type === 'form_creation' && 'Form created'}
                              {activity.type === 'profile_update' && 'Profile updated'}
                            </p>
                            <p className="text-xs text-gray-500">{activity.details}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Forms Tab Content */}
              {activeTab === 'forms' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">User Forms</h3>
                    <Link 
                      href={`/forms?userId=${userId}`}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View all forms
                    </Link>
                  </div>
                  {loadingForms ? (
                    <div className="flex justify-center items-center h-40">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : userForms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No forms created by this user</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userForms.map((form) => (
                        <div key={form.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">
                                <Link href={`/forms/${form.id}`} className="text-blue-600 hover:text-blue-800">
                                  {form.title}
                                </Link>
                              </h4>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                Created: {new Date(form.created).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                form.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {form.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <ClipboardList className="w-3 h-3 mr-1" />
                                {form.submissions} submissions
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Self-edit warning */}
            {isSelf && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg flex items-start">
                <Shield className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">You are editing your own account</p>
                  <p className="text-sm mt-1">Note: You cannot change your own role or status to prevent accidentally locking yourself out of the system.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: User Stats and Quick Actions */}
          <div className="lg:col-span-1">
            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col items-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <span className="text-gray-600 text-2xl font-medium">
                    {getField('name')?.value 
                      ? getField('name')?.value.charAt(0).toUpperCase() 
                      : getField('email')?.value.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-medium">{getField('name')?.value || 'Unnamed User'}</h3>
                <p className="text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {getField('email')?.value}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getField('role')?.value === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getField('role')?.value === 'SUPER_ADMIN' ? 'Admin' : 'Client'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getField('status')?.value === 'active'
                      ? 'bg-green-100 text-green-800'
                      : getField('status')?.value === 'locked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getField('status')?.value === 'active'
                      ? 'Active'
                      : getField('status')?.value === 'locked'
                        ? 'Locked'
                        : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">User Information</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Account Created
                    </span>
                    <span className="font-medium">{new Date(stats.createdAt).toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Last Login
                    </span>
                    <span className="font-medium">{new Date(stats.lastLogin).toLocaleDateString()}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Forms Created
                    </span>
                    <span className="font-medium">{stats.formCount}</span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Total Submissions
                    </span>
                    <span className="font-medium">{stats.submissionCount}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isSelf}
                >
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <span className="block font-medium">Send Password Reset</span>
                      <span className="block text-xs text-gray-500">Email with a reset link</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
                
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isSelf}
                  onClick={() => {
                    const newStatus = getField('status')?.value === 'locked' ? 'active' : 'locked';
                    updateField('status', newStatus);
                    setShowAdvancedOptions(true);
                  }}
                >
                  <div className="flex items-center">
                    {getField('status')?.value === 'locked' ? (
                      <>
                        <Unlock className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <span className="block font-medium">Unlock Account</span>
                          <span className="block text-xs text-gray-500">Allow the user to log in</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-amber-600 mr-3" />
                        <div>
                          <span className="block font-medium">Lock Account</span>
                          <span className="block text-xs text-gray-500">Prevent user from logging in</span>
                        </div>
                      </>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
                
                <Link
                  href={`/forms?userId=${userId}`}
                  className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-indigo-600 mr-3" />
                    <div>
                      <span className="block font-medium">View All Forms</span>
                      <span className="block text-xs text-gray-500">See forms created by this user</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
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
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-center mb-4">Confirm Changes</h3>
            <p className="text-gray-500 mb-4 text-center">
              You're about to make significant changes to this user account. These changes may affect the user's access and permissions.
            </p>
            <p className="text-gray-500 mb-4 text-center">
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  setShowConfirmation(false);
                  handleSubmit(e as any);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}