'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  formsService,
  submissionsService,
  FieldType,
  CreateFormFieldDto,
} from '@/services/api';
import FormInterface from '@/components/features/forms/FormInterface';
import FormField from '@/components/features/forms/FormField';
import FormBuilderField from '@/components/features/forms/FormBuilderField';
import AddFieldPanel from '@/components/features/forms/AddFieldPanel';
import FormBuilderPreview from '@/components/features/forms/FormBuilderPreview';
import FieldConfigPanel from '@/components/form-builder/FieldConfigPanel';

// Define types for form fields
interface FormFieldType {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  config?: Record<string, any>;
}

interface EditingField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options: string | string[];
  order: number;
  config: Record<string, any>;
}

interface FormData {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  clientId: string;
  slug: string;
  fields: Array<FormFieldType>;
  [key: string]: any;
}

export default function FormDetailClientContent({ id }: { id: string }) {
  const router = useRouter();

  const [form, setForm] = useState<FormData | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');

  const [newField, setNewField] = useState<CreateFormFieldDto>({
    label: '',
    type: FieldType.TEXT,
    placeholder: '',
    required: false,
    order: 1,
    options: [],
    config: {},
  });

  const [selectedField, setSelectedField] = useState<FormFieldType | null>(null);

  // Add state for editing form details
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // fetch form & submissions
  useEffect(() => {
    async function fetchData() {
      try {
        const [fRes, sRes] = await Promise.all([
          formsService.getForm(id),
          submissionsService.getFormSubmissions(id),
        ]);
        
        if (fRes.data && !fRes.error) {
          const formData = fRes.data as FormData;
          setForm(formData);
          
          if (formData.fields && formData.fields.length > 0) {
            setNewField(prev => ({
              ...prev,
              order: Math.max(...formData.fields.map(f => f.order)) + 1,
            }));
          }
        } else {
          setError(fRes.error || 'Could not load form');
        }
        
        if (sRes.data && !sRes.error && Array.isArray(sRes.data)) {
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

  // Toggle publish
  const handlePublishToggle = async () => {
    if (!form) return;
    try {
      const { data } = await formsService.updateForm(id, {
        published: !form.published,
      });
      if (data) {
        setForm({ 
          ...form, 
          published: !form.published 
        });
      }
    } catch {
      setError('Update error');
    }
  };

  // Function to handle editing form details
  const startEditingDetails = () => {
    if (!form) return;
    setEditTitle(form.title);
    setEditDescription(form.description || '');
    setIsEditingDetails(true);
  };

  // Function to save form details
  const saveFormDetails = async () => {
    if (!form) return;
    try {
      const { data, error } = await formsService.updateForm(id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      
      if (error) {
        setError('Failed to update form details');
        return;
      }
      
      if (data) {
        setForm({ 
          ...form, 
          title: editTitle.trim(),
          description: editDescription.trim() || undefined
        });
        setIsEditingDetails(false);
      }
    } catch {
      setError('Update error');
    }
  };

  // Function to cancel editing
  const cancelEditingDetails = () => {
    setIsEditingDetails(false);
  };

  // add new field
  const handleAddField = async (fieldData: any) => {
    try {
      const payload = {
        ...fieldData,
        options:
          [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(
            fieldData.type
          ) && Array.isArray(fieldData.options)
            ? fieldData.options
            : typeof fieldData.options === 'string'
              ? fieldData.options.split(',').map((o: string) => o.trim())
              : [],
      };
      const { data } = await formsService.addField(id, payload);
      if (data) {
        const { data: refreshed } = await formsService.getForm(id);
        if (refreshed) {
          const refreshedForm = refreshed as FormData;
          setForm(refreshedForm);
          setNewField({
            label: '',
            type: FieldType.TEXT,
            placeholder: '',
            required: false,
            options: [],
            order: refreshedForm.fields && refreshedForm.fields.length > 0 
              ? refreshedForm.fields.length + 1 
              : 1,
            config: {},
          });
        }
        setShowAddField(false);
      }
    } catch {
      setError('Add field error');
    }
  };

  // prepare edit
  const prepareFieldForEditing = (field: FormFieldType) => {
    setEditingField({
      id: field.id,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder || '',
      required: field.required,
      options: Array.isArray(field.options) ? field.options.join(', ') : '',
      order: field.order,
      config: field.config || {},
    });
  };

  // update field
  const handleUpdateField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !form) return;
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
          ? (typeof editingField.options === 'string' 
              ? editingField.options.split(',').map((o: string) => o.trim())
              : editingField.options)
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
        if (refreshed) setForm(refreshed as FormData);
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
        if (refreshed) setForm(refreshed as FormData);
      }
    } catch {
      setError('Delete field error');
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = () => {
    if (!form) return;
    const publicUrl = `${window.location.origin}/forms/public/${form.clientId}/${form.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  // Handle form deletion
  const handleDeleteForm = async () => {
    if (confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        const { error } = await formsService.deleteForm(id);
        if (!error) {
          router.push('/forms');
        } else {
          setError('Failed to delete form');
        }
      } catch {
        setError('Delete form error');
      }
    }
  };

  // Reordering fields - fixed to preserve all properties
  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    if (!form || !form.fields) return;
    
    // Find the field and its current position
    const sortedFields = [...form.fields].sort((a, b) => a.order - b.order);
    const index = sortedFields.findIndex(f => f.id === fieldId);
    
    if (index === -1) return;
    
    // Can't move first item up or last item down
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === sortedFields.length - 1)) {
      return;
    }
    
    // Get the adjacent field
    const adjacentIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Get full copies of both fields
    const currentField = {...sortedFields[index]};
    const adjacentField = {...sortedFields[adjacentIndex]};
    
    // Only swap the order values
    const tempOrder = currentField.order;
    currentField.order = adjacentField.order;
    adjacentField.order = tempOrder;
    
    // Update local state first
    const updatedFields = form.fields.map(f => {
      if (f.id === currentField.id) return currentField;
      if (f.id === adjacentField.id) return adjacentField;
      return f;
    });
    
    setForm({
      ...form,
      fields: updatedFields
    });
    
    // Send the FULL field objects to the server
    try {
      await Promise.all([
        formsService.updateField(id, currentField.id, currentField),
        formsService.updateField(id, adjacentField.id, adjacentField)
      ]);
    } catch (err) {
      setError('Error reordering fields');
      // Revert changes on error
      const { data: refreshed } = await formsService.getForm(id);
      if (refreshed) setForm(refreshed as FormData);
    }
  };

  const handleDuplicateField = async (field: any) => {
    if (!form) return;
    try {
      // Create a duplicate with the same properties but a new order
      const newOrder = Math.max(...form.fields.map(f => f.order)) + 1;
      const payload = {
        label: `${field.label} (Copy)`,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        order: newOrder,
        options: field.options,
        config: field.config,
      };
      
      const { data } = await formsService.addField(id, payload);
      if (data) {
        const { data: refreshed } = await formsService.getForm(id);
        if (refreshed) setForm(refreshed as FormData);
      }
    } catch (err) {
      setError('Error duplicating field');
    }
  };

  // Handle field select
  const handleFieldSelect = (field: FormFieldType) => {
    setSelectedField({
      ...field,
      options: field.options || []
    });
  };

  // Handle add option
  const handleAddOption = (option: string) => {
    if (
      selectedField &&
      [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(
        selectedField.type
      )
    ) {
      const currentOptions = Array.isArray(selectedField.options) 
        ? [...selectedField.options] 
        : [];
      
      setSelectedField({
        ...selectedField,
        options: [...currentOptions, option],
      });
    }
  };

  // Handle option remove
  const handleRemoveOption = (idx: number) => {
    if (
      selectedField &&
      [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(
        selectedField.type
      )
    ) {
      const currentOptions = Array.isArray(selectedField.options) 
        ? [...selectedField.options] 
        : [];
      
      const newOptions = currentOptions.filter((_, i) => i !== idx);
      setSelectedField({
        ...selectedField,
        options: newOptions,
      });
    }
  };

  // Form actions
  const formActions = (
    <>
      {form && (
        <>
          <button
            onClick={handlePublishToggle}
            className={`px-4 py-2 rounded-md ${
              form.published
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {form.published ? 'Unpublish' : 'Publish'}
          </button>
          
          {form.published && (
            <button
              onClick={copyUrlToClipboard}
              className={`px-4 py-2 rounded-md ${
                urlCopied
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              {urlCopied ? 'Copied!' : 'Copy Link'}
            </button>
          )}
          
          <Link
            href="/forms"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Forms
          </Link>
        </>
      )}
    </>
  );

  if (loading) {
    return (
      <FormInterface
        title="Loading Form..."
        isLoading={true}
      />
    );
  }

  if (!form) {
    return (
      <FormInterface
        title="Form Not Found"
        error="The form could not be found or you do not have permission to view it."
        breadcrumbs={[
          { label: 'Forms', href: '/forms' },
          { label: 'Form Not Found' }
        ]}
      >
        <div className="p-6 text-center">
          <button
            onClick={() => router.push('/forms')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Forms
          </button>
        </div>
      </FormInterface>
    );
  }

  return (
    <FormInterface
      title={form.title}
      actions={formActions}
      error={error || null}
      breadcrumbs={[
        { label: 'Forms', href: '/forms' },
        { label: form.title }
      ]}
    >
      <div className="p-6">
        {/* Form Info */}
        <div className="mb-6 space-y-4">
          <div className="flex items-start justify-between border-b border-gray-200 pb-4">
            <div className="flex-1">
              {isEditingDetails ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Form Title
                    </label>
                    <input
                      type="text"
                      id="form-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter form title"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Form Description (optional)
                    </label>
                    <textarea
                      id="form-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter form description"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Pro tip: Use hashtags like #feedback to categorize your forms
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveFormDetails}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Save Details
                    </button>
                    <button
                      onClick={cancelEditingDetails}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900">{form.title}</h2>
                    <button
                      onClick={startEditingDetails}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      aria-label="Edit form details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {form.description && (
                    <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                      {form.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {new Date(form.createdAt).toLocaleDateString()}
                    {form.updatedAt && form.updatedAt !== form.createdAt && 
                      ` • Updated on ${new Date(form.updatedAt).toLocaleDateString()}`
                    }
                  </p>
                </>
              )}
            </div>
            <div className="space-x-2 flex">
              <button
                onClick={handleDeleteForm}
                className="px-3 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
              >
                Delete Form
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submissions</label>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <div className="text-2xl font-semibold text-blue-600">{submissions.length}</div>
                <div className="text-sm text-gray-500">Total submissions</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Status</label>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <div className={`text-lg font-medium ${form.published ? 'text-green-600' : 'text-yellow-600'}`}>
                  {form.published ? 'Published' : 'Draft'}
                </div>
                <div className="text-sm text-gray-500">
                  {form.published 
                    ? 'Your form is available for submissions' 
                    : 'Publish your form to start collecting submissions'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'builder'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Form Builder
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        
        {/* Form Builder */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            {/* Add Field Button */}
            {!showAddField && !editingField && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAddField(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Field
                </button>
              </div>
            )}
            
            {/* Add Field Panel */}
            {showAddField && form && (
              <AddFieldPanel
                onAdd={handleAddField}
                onCancel={() => setShowAddField(false)}
                initialOrder={(form.fields && form.fields.length > 0) ? form.fields.length + 1 : 1}
              />
            )}
            
            {/* Edit Field Panel */}
            {editingField && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Field</h3>
                <form onSubmit={handleUpdateField}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      id="label"
                      label="Field Label"
                      required
                      value={editingField.label}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      placeholder="Enter field label"
                    />
                    
                    <FormField
                      id="type"
                      label="Field Type"
                      type="select"
                      required
                      value={editingField.type}
                      onChange={(e) => setEditingField({ ...editingField, type: e.target.value as FieldType })}
                      options={Object.keys(FieldType).map(key => ({
                        value: FieldType[key as keyof typeof FieldType],
                        label: key.replace(/_/g, ' ')
                      }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      id="placeholder"
                      label="Placeholder Text"
                      value={editingField.placeholder}
                      onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                      placeholder="Enter placeholder text"
                    />
                    
                    <div className="mt-4 md:mt-0">
                      <FormField
                        id="required"
                        label="Required Field"
                        type="checkbox"
                        value={editingField.required}
                        onChange={(e) => setEditingField({ ...editingField, required: (e.target as HTMLInputElement).checked })}
                        helperText="Make this field mandatory"
                      />
                    </div>
                  </div>
                  
                  {[FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(editingField.type) && (
                    <FormField
                      id="options"
                      label="Options"
                      type="textarea"
                      required
                      value={typeof editingField.options === 'string' 
                        ? editingField.options 
                        : editingField.options.join(', ')}
                      onChange={(e) => setEditingField({ 
                        ...editingField, 
                        options: e.target.value 
                      })}
                      placeholder="Enter options separated by commas"
                      helperText="Enter options separated by commas (e.g. Option 1, Option 2, Option 3)"
                    />
                  )}
                  
                  {/* Config Panel based on field type */}
                  <div className="mt-4">
                    <FieldConfigPanel
                      type={editingField.type}
                      config={editingField.config}
                      onChange={(config) => setEditingField({ ...editingField, config })}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditingField(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Field
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Fields List */}
            {form.fields && form.fields.length > 0 ? (
              <div className="space-y-1">
                {form.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field, idx) => (
                    <FormBuilderField
                      key={field.id}
                      id={field.id}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      order={field.order}
                      onEdit={() => prepareFieldForEditing(field)}
                      onDelete={() => handleDeleteField(field.id)}
                      onDuplicate={() => handleDuplicateField(field)}
                      onMoveUp={() => handleMoveField(field.id, 'up')}
                      onMoveDown={() => handleMoveField(field.id, 'down')}
                      isFirst={idx === 0}
                      isLast={idx === form.fields.length - 1}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium">No fields added yet</p>
                <p className="text-xs mt-1">Click 'Add Field' to start building your form</p>
              </div>
            )}
          </div>
        )}
        
        {/* Preview */}
        {activeTab === 'preview' && (
          <div className="mt-4">
            <FormBuilderPreview
              title={form.title}
              description={form.description}
              fields={form.fields || []}
            />
          </div>
        )}
      </div>
    </FormInterface>
  );
} 