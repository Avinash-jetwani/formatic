// src/app/(dashboard)/forms/[id]/page.tsx
'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  formsService,
  submissionsService,
  FieldType,
  CreateFormFieldDto,
} from '@/services/api';
import { AuthProvider } from '@/contexts/AuthContext';
import FieldConfigPanel from '@/components/form-builder/FieldConfigPanel';

interface EditingField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options: string;
  order: number;
  config: Record<string, any>;
}

function FormDetailContent({ id }: { id: string }) {
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  const [newField, setNewField] = useState<CreateFormFieldDto>({
    label: '',
    type: FieldType.TEXT,
    placeholder: '',
    required: false,
    options: '',
    order: 1,
    config: {},
  });

  // fetch form & submissions
  useEffect(() => {
    async function fetchData() {
      try {
        const [fRes, sRes] = await Promise.all([
          formsService.getForm(id),
          submissionsService.getFormSubmissions(id),
        ]);
        if (fRes.data && !fRes.error) {
          setForm(fRes.data);
          if (fRes.data.fields?.length) {
            setNewField(prev => ({
              ...prev,
              order: Math.max(...fRes.data.fields.map((f: any) => f.order)) + 1,
            }));
          }
        } else {
          setError(fRes.error || 'Could not load form');
        }
        if (sRes.data && !sRes.error) {
          setSubmissions(sRes.data);
        }
      } catch {
        setError('Fetch error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // toggle publish
  const handlePublishToggle = async () => {
    try {
      const { data } = await formsService.updateForm(id, {
        published: !form.published,
      });
      if (data) setForm({ ...form, published: !form.published });
    } catch {
      setError('Update error');
    }
  };

  // add new field
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...newField,
        options:
          [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(
            newField.type
          )
            ? newField.options.split(',').map(o => o.trim())
            : [],
      };
      const { data } = await formsService.addField(id, payload);
      if (data) {
        const { data: refreshed } = await formsService.getForm(id);
        if (refreshed) setForm(refreshed);
        setNewField({
          label: '',
          type: FieldType.TEXT,
          placeholder: '',
          required: false,
          options: '',
          order: refreshed.fields.length + 1,
          config: {},
        });
        setShowAddField(false);
      }
    } catch {
      setError('Add field error');
    }
  };

  // prepare edit
  const prepareFieldForEditing = (field: any) => {
    setEditingField({
      id: field.id,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required,
      options: field.options?.join(', ') || '',
      order: field.order,
      config: field.config || {},
    });
  };

  // update field
  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;
    try {
      const payload = {
        label: editingField.label,
        type: editingField.type,
        placeholder: editingField.placeholder,
        required: editingField.required,
        order: editingField.order,
        options: [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(
          editingField.type
        )
          ? editingField.options.split(',').map(o => o.trim())
          : [],
        config: editingField.config,
      };
      const { error } = await formsService.updateField(
        id,
        editingField.id,
        payload
      );
      if (!error) {
        const { data: refreshed } = await formsService.getForm(id);
        if (refreshed) setForm(refreshed);
        setEditingField(null);
      }
    } catch {
      setError('Update field error');
    }
  };

  // delete field
  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field?')) return;
    try {
      const { error } = await formsService.deleteField(id, fieldId);
      if (!error) {
        const { data: refreshed } = await formsService.getForm(id);
        if (refreshed) setForm(refreshed);
      }
    } catch {
      setError('Delete field error');
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = () => {
    const publicUrl = `${window.location.origin}/forms/public/${form.clientId}/${form.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-2 border-blue-600 rounded-full border-t-transparent" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-700 rounded">
        <p>{error}</p>
        <button
          onClick={() => router.push('/forms')}
          className="mt-4 underline"
        >
          Back to forms
        </button>
      </div>
    );

  if (!form)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-yellow-50 text-yellow-700 rounded">
        <p>Form not found.</p>
        <button
          onClick={() => router.push('/forms')}
          className="mt-4 underline"
        >
          Back to forms
        </button>
      </div>
    );

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8 px-4">
      {/* HEADER CARD */}
      <div className="bg-white shadow-lg rounded-lg border-l-4 border-blue-600 p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-3">
          <h1 className="text-3xl font-extrabold text-blue-600">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-gray-700">{form.description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => router.push(`/forms/${id}/edit`)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Edit Details
          </button>
          <button
            onClick={handlePublishToggle}
            className={`px-4 py-2 rounded text-white ${
              form.published
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {form.published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* PUBLIC URL CARD - More prominent */}
      {form.published && (
        <div className="bg-blue-50 shadow-md rounded-lg p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-blue-800 mb-1">Public Form URL</h2>
              <p className="text-sm text-blue-600 mb-2">Share this link with your customers to collect responses</p>
            </div>
            <div className="flex-1 md:flex-none">
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/forms/public/${form.clientId}/${form.slug}`}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  className="flex-1 font-mono text-sm px-3 py-2 bg-white border border-blue-300 rounded-l"
                />
                <button
                  onClick={copyUrlToClipboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r flex items-center"
                >
                  {urlCopied ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIELDS CARD */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Form Fields</h2>
          <button
            onClick={() => {
              setEditingField(null);
              setShowAddField(prev => !prev);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </button>
        </div>

        {/* ADD FIELD FORM */}
        {showAddField && !editingField && (
          <form
            onSubmit={handleAddField}
            className="space-y-4 mb-6 pb-6 border-b border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={newField.label}
                  onChange={e =>
                    setNewField({ ...newField, label: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newField.type}
                  onChange={e =>
                    setNewField(prev => ({
                      ...prev,
                      type: e.target.value as FieldType,
                    }))
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                >
                  {Object.values(FieldType).map(ft => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wrap FieldConfigPanel in a div with max height and scrolling if needed */}
            <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-md p-4 bg-gray-50">
              <FieldConfigPanel
                type={newField.type}
                config={newField.config}
                onChange={cfg =>
                  setNewField(prev => ({ ...prev, config: cfg }))
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Placeholder
              </label>
              <input
                type="text"
                value={newField.placeholder || ''}
                onChange={e =>
                  setNewField({ ...newField, placeholder: e.target.value })
                }
                className="w-full border border-gray-300 rounded p-2 text-black"
              />
            </div>

            {(newField.type === FieldType.DROPDOWN ||
              newField.type === FieldType.CHECKBOX ||
              newField.type === FieldType.RADIO) && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Options (comma-separated)
                </label>
                <input
                  type="text"
                  value={newField.options}
                  onChange={e =>
                    setNewField({ ...newField, options: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={e =>
                    setNewField({ ...newField, required: e.target.checked })
                  }
                  className="mr-2"
                />
                Required
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Field
              </button>
            </div>
          </form>
        )}

        {/* EDIT FIELD FORM */}
        {editingField && (
          <form
            onSubmit={handleUpdateField}
            className="space-y-4 mb-6 pb-6 border-b border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  type="text"
                  required
                  value={editingField.label}
                  onChange={e =>
                    setEditingField({ ...editingField, label: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={editingField.type}
                  onChange={e =>
                    setEditingField(prev => ({
                      ...prev!,
                      type: e.target.value as FieldType,
                    }))
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                >
                  {Object.values(FieldType).map(ft => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wrap FieldConfigPanel in a div with max height and scrolling if needed */}
            <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-md p-4 bg-gray-50">
              <FieldConfigPanel
                type={editingField.type}
                config={editingField.config}
                onChange={cfg =>
                  setEditingField({ ...editingField, config: cfg })
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Placeholder
              </label>
              <input
                type="text"
                value={editingField.placeholder}
                onChange={e =>
                  setEditingField({
                    ...editingField,
                    placeholder: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded p-2 text-black"
              />
            </div>

            {(editingField.type === FieldType.DROPDOWN ||
              editingField.type === FieldType.CHECKBOX ||
              editingField.type === FieldType.RADIO) && (
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Options (comma-separated)
                </label>
                <input
                  type="text"
                  value={editingField.options}
                  onChange={e =>
                    setEditingField({
                      ...editingField,
                      options: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-black"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editingField.required}
                  onChange={e =>
                    setEditingField({
                      ...editingField,
                      required: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Required
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Update Field
              </button>
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* EXISTING FIELDS */}
        {form.fields && form.fields.length > 0 ? (
          <div className="space-y-2 mt-4">
            {form.fields
              .sort((a: any, b: any) => a.order - b.order)
              .map((field: any) => (
                <div
                  key={field.id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="flex items-center">
                      <strong className="text-gray-800">{field.label}</strong>
                      {field.required && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        {field.type}
                      </span>
                      {field.placeholder && (
                        <span className="ml-2 text-gray-500">
                          Placeholder: {field.placeholder}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => prepareFieldForEditing(field)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg mt-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p className="mt-4">No fields added yet. Click "Add Field" to start building your form.</p>
          </div>
        )}
      </div>

      {/* SUBMISSIONS CARD - Enhanced */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Recent Submissions
          </h2>
          <Link
            href={`/submissions?form=${id}`}
            className="bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
            View All
          </Link>
        </div>

        {submissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Preview
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.slice(0, 5).map(submission => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-md truncate">
                        {Object.keys(submission.data).slice(0, 3).map(key => (
                          <span key={key} className="inline-block mr-3">
                            <span className="font-medium">{key}:</span>{' '}
                            {typeof submission.data[key] === 'string' 
                              ? submission.data[key].length > 20 
                                ? submission.data[key].substring(0, 20) + '...' 
                                : submission.data[key]
                              : Array.isArray(submission.data[key])
                                ? submission.data[key].join(', ')
                                : String(submission.data[key])}
                          </span>
                        ))}
                        {Object.keys(submission.data).length > 3 && <span className="text-gray-500">...</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/submissions/${submission.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 9l-7 7-7-7"></path>
            </svg>
            <p className="mt-4 text-gray-500">No submissions yet.</p>
            {form.published ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Share your form with users to start collecting responses:</p>
                <button
                  onClick={copyUrlToClipboard}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100"
                >
                  {urlCopied ? 'URL Copied!' : 'Copy Form URL'}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Publish your form to start collecting responses.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthProvider>
      <FormDetailContent id={id} />
    </AuthProvider>
  );
}