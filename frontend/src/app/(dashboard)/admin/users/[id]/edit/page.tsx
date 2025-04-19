'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/api';
import { ArrowLeft, Save, User, Shield, AlertTriangle } from 'lucide-react';

export default function EditUserPage({ params }) {
  const { isAdmin, user: currentUser } = useAuth();
  const router = useRouter();
  const userId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  
  const [originalEmail, setOriginalEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await usersService.getUser(userId);
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email,
            password: '',
            role: data.role
          });
          setOriginalEmail(data.email);
          
          // Check if editing own account
          if (currentUser && currentUser.id === userId) {
            setIsSelf(true);
          }
        }
      } catch (err) {
        setErrors({
          form: `Error loading user: ${err.message || 'Unknown error'}`
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [isAdmin, router, userId, currentUser]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password is optional for editing
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Don't allow changing own role (avoid locking yourself out)
    if (isSelf && formData.role !== currentUser?.role) {
      newErrors.role = 'You cannot change your own role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Only send fields that have been changed
    const updateData = {};
    if (formData.name !== '') updateData.name = formData.name;
    if (formData.email !== originalEmail) updateData.email = formData.email;
    if (formData.password) updateData.password = formData.password;
    if (formData.role) updateData.role = formData.role;
    
    try {
      const { data, error } = await usersService.updateUser(userId, updateData);
      
      if (error) {
        throw new Error(error);
      }
      
      setSuccessMessage(`User updated successfully!`);
      
      // Redirect after short delay - using the route your app actually uses
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
      
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          form: `Error updating user: ${err.message || 'Unknown error'}`
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" />
            Edit User
          </h1>
        </div>
      </div>
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
          {successMessage}
        </div>
      )}
      
      {errors.form && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {errors.form}
        </div>
      )}
      
      {isSelf && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md flex items-start">
          <Shield className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">You are editing your own account</p>
            <p className="text-sm">Note: You cannot change your own role to prevent accidentally locking yourself out of the system.</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter user's name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter email address"
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-gray-500 text-xs">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-blue-500 focus:border-blue-500`}
                disabled={isSelf}
                required
              >
                <option value="CLIENT">Client</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.role === 'SUPER_ADMIN' 
                  ? 'Super Admin users have full access to all features and data' 
                  : 'Client users can only manage their own forms and submissions'}
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}