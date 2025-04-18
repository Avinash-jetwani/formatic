// src/app/(dashboard)/forms/[id]/page.tsx
'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Public URL
            </label>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/forms/public/${form.clientId}/${form.slug}`}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="mt-1 w-full font-mono text-sm px-3 py-2 bg-gray-50 border border-gray-300 rounded"
            />
          </div>
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

      {/* FIELDS CARD */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Fields</h2>
          <button
            onClick={() => {
              setEditingField(null);
              setShowAddField(prev => !prev);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Field
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
                <FieldConfigPanel
                  type={newField.type}
                  config={newField.config}
                  onChange={cfg =>
                    setNewField(prev => ({ ...prev, config: cfg }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Placeholder
              </label>
              <input
                type="text"
                value={newField.placeholder}
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
                <FieldConfigPanel
                  type={editingField.type}
                  config={editingField.config}
                  onChange={cfg =>
                    setEditingField({ ...editingField, config: cfg })
                  }
                />
              </div>
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
        <div className="space-y-2">
          {form.fields.map((field: any) => (
            <div
              key={field.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
            >
              <div>
                <strong className="text-gray-800">{field.label}</strong>{' '}
                <span className="italic text-gray-500">— {field.type}</span>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => prepareFieldForEditing(field)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMISSIONS CARD */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Recent Submissions
        </h2>
        {submissions.length > 0 ? (
          submissions.slice(0, 5).map(sub => (
            <div
              key={sub.id}
              className="flex justify-between items-center py-2 border-b last:border-none"
            >
              <span className="text-sm text-gray-600">
                {new Date(sub.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => router.push(`/submissions/${sub.id}`)}
                className="text-blue-600 hover:underline"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No submissions yet.</p>
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