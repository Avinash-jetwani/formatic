// src/app/(dashboard)/forms/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formsService, submissionsService } from '@/services/api';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'TEXT',
    placeholder: '',
    required: false,
    options: '',
    order: 1,
  });

  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, submissionsRes] = await Promise.all([
          formsService.getForm(id),
          submissionsService.getFormSubmissions(id),
        ]);

        if (formRes.data && !formRes.error) {
          setForm(formRes.data);
          
          // Adjust order for new field
          if (formRes.data.fields && formRes.data.fields.length > 0) {
            setNewField(prev => ({
              ...prev,
              order: Math.max(...formRes.data.fields.map((f: any) => f.order)) + 1
            }));
          }
        } else {
          setError(formRes.error || 'Failed to fetch form details');
        }

        if (submissionsRes.data && !submissionsRes.error) {
          setSubmissions(submissionsRes.data);
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePublishToggle = async () => {
    try {
      const { data, error } = await formsService.updateForm(id, {
        published: !form.published,
      });
      
      if (data && !error) {
        setForm({ ...form, published: !form.published });
      } else {
        setError(error || 'Failed to update form');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fieldData = {
        ...newField,
        options: newField.type === 'DROPDOWN' || newField.type === 'CHECKBOX' || newField.type === 'RADIO'
          ? newField.options.split(',').map(opt => opt.trim())
          : [],
      };
      
      const { data, error } = await formsService.addField(id, fieldData);
      
      if (data && !error) {
        // Refresh form data
        const { data: formData } = await formsService.getForm(id);
        if (formData) {
          setForm(formData);
        }
        
        // Reset new field form
        setNewField({
          label: '',
          type: 'TEXT',
          placeholder: '',
          required: false,
          options: '',
          order: formData.fields ? Math.max(...formData.fields.map((f: any) => f.order)) + 1 : 1,
        });
        
        setShowAddField(false);
      } else {
        setError(error || 'Failed to add field');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleDeleteForm = async () => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        const { error } = await formsService.deleteForm(id);
        
        if (!error) {
          router.push('/forms');
        } else {
          setError(error || 'Failed to delete form');
        }
      } catch (err) {
        setError('An error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => router.push('/forms')}
          className="mt-2 text-sm text-red-700 underline"
        >
          Back to Forms
        </button>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        <p>Form not found</p>
        <button
          onClick={() => router.push('/forms')}
          className="mt-2 text-sm text-yellow-700 underline"
        >
          Back to Forms
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/forms')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">{form.title}</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePublishToggle}
            className={`px-4 py-2 rounded-md ${
              form.published
                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                : 'bg-green-100 hover:bg-green-200 text-green-800'
            }`}
          >
            {form.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={handleDeleteForm}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Form Details</h2>
                <button
                  onClick={() => router.push(`/forms/${id}/edit`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit Details
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{form.description || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        form.published ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    ></span>
                    <span>{form.published ? 'Published' : 'Draft'}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submissions</p>
                  <p>{submissions.length}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Public URL</p>
                <div className="mt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/forms/public/${form.clientId}/${form.slug}`}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Form Fields</h2>
                <button
                  onClick={() => setShowAddField(!showAddField)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Add Field
                </button>
              </div>

              {showAddField && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-3">Add New Field</h3>
                  <form onSubmit={handleAddField}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={newField.label}
                          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type *
                        </label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="TEXT">Text</option>
                          <option value="DROPDOWN">Dropdown</option>
                          <option value="CHECKBOX">Checkbox</option>
                          <option value="RADIO">Radio</option>
                          <option value="FILE">File Upload</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={newField.placeholder}
                        onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {(newField.type === 'DROPDOWN' || newField.type === 'CHECKBOX' || newField.type === 'RADIO') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (comma separated) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newField.options}
                          onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                        Required Field
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddField(false)}
                        className="mr-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Add Field
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {form.fields && form.fields.length > 0 ? (
                <div className="space-y-4">
                  {form.fields.sort((a: any, b: any) => a.order - b.order).map((field: any) => (
                    <div key={field.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{field.label}</h3>
                            {field.required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Type: {field.type.charAt(0) + field.type.slice(1).toLowerCase()}
                          </p>
                          {field.placeholder && (
                            <p className="text-sm text-gray-500">
                              Placeholder: {field.placeholder}
                            </p>
                          )}
                          {(field.type === 'DROPDOWN' || field.type === 'CHECKBOX' || field.type === 'RADIO') && field.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Options:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.options.map((option: string, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                                  >
                                    {option}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex">
                          <button
                            onClick={() => {
                              // Implement edit field functionality
                              alert('Edit field functionality to be implemented');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              // Implement delete field functionality
                              alert('Delete field functionality to be implemented');
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No fields added yet. Add fields to your form.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
              
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission: any) => (
                    <div key={submission.id} className="border-b pb-3">
                      <p className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                      <button
                        onClick={() => router.push(`/submissions/${submission.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                  
                  {submissions.length > 5 && (
                    <div className="text-center mt-2">
                      <button
                        onClick={() => router.push(`/submissions/form/${id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View All {submissions.length} Submissions
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No submissions yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}