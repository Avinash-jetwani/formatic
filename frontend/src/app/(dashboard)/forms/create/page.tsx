// src/app/(dashboard)/forms/create/page.tsx
'use client';

import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { formsService } from '@/services/api';
import FormInterface from '@/components/features/forms/FormInterface';
import FormField from '@/components/features/forms/FormField';

interface FormData {
  title: string;
  description: string;
  published: boolean;
}

export default function CreateFormPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Form title is required');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await formsService.createForm(formData);
      if (response.data && !response.error) {
        // Cast response.data to any to bypass TypeScript checking
        const formId = (response.data as any).id;
        if (formId) {
          router.push(`/forms/${formId}`);
        } else {
          setError('Invalid response from server');
        }
      } else {
        setError(response.error || 'Failed to create form. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form actions
  const formActions = (
    <>
      <button
        type="button"
        onClick={() => router.push('/forms')}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="create-form"
        disabled={loading}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Creating...' : 'Create Form'}
      </button>
    </>
  );

  return (
    <FormInterface 
      title="Create New Form" 
      actions={formActions}
      isLoading={loading}
      error={error}
      breadcrumbs={[
        { label: 'Forms', href: '/forms' },
        { label: 'Create New Form' }
      ]}
    >
      <form id="create-form" onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Start by creating your form</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Once created, you'll be able to add fields, configure settings, and publish your form.
                </p>
              </div>
            </div>
          </div>

          <FormField
            id="title"
            label="Form Title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title for your form"
            error={error && !formData.title.trim() ? 'Form title is required' : ''}
            helperText="This will be displayed at the top of your form"
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a description for your form (optional)"
            helperText="Provide additional context about your form. You can also use #tags for organization."
            rows={4}
          />

          <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
            <FormField
              id="published"
              label="Publish immediately"
              type="checkbox"
              value={formData.published}
              onChange={handleChange}
              helperText="If checked, your form will be available for submissions immediately. Otherwise, it will be saved as a draft."
            />
          </div>
        </div>
      </form>
    </FormInterface>
  );
}