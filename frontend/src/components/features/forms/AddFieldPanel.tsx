import React, { useState, ChangeEvent } from 'react';
import { FieldType } from '@/services/api';
import FormField from './FormField';

interface AddFieldPanelProps {
  onAdd: (fieldData: any) => void;
  onCancel: () => void;
  initialOrder: number;
}

export default function AddFieldPanel({ onAdd, onCancel, initialOrder }: AddFieldPanelProps) {
  const [fieldData, setFieldData] = useState({
    label: '',
    type: FieldType.TEXT,
    placeholder: '',
    required: false,
    options: '',
    order: initialOrder,
    config: {},
  });

  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // If this is a type field, handle it differently
    if (name === 'type') {
      handleTypeChange(value as FieldType);
      return;
    }
    
    setFieldData({
      ...fieldData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleTypeChange = (newType: FieldType) => {
    setFieldData({
      ...fieldData,
      type: newType,
      // Reset options when switching to/from multi-option field types
      options: [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(newType) 
        ? fieldData.options 
        : '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldData.label.trim()) {
      setError('Field label is required');
      return;
    }
    
    // For option-based field types, validate options
    if (
      [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(fieldData.type) &&
      !fieldData.options.trim()
    ) {
      setError('Options are required for this field type');
      return;
    }
    
    onAdd(fieldData);
  };

  // Field type options for the select dropdown
  const fieldTypeOptions = Object.keys(FieldType).map(key => ({
    value: FieldType[key as keyof typeof FieldType],
    label: key.replace(/_/g, ' ')
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Field</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            id="label"
            label="Field Label"
            required
            value={fieldData.label}
            onChange={handleChange}
            placeholder="Enter field label"
            error={error && !fieldData.label.trim() ? error : ''}
          />
          
          <FormField
            id="type"
            label="Field Type"
            type="select"
            required
            value={fieldData.type}
            onChange={handleChange}
            options={fieldTypeOptions}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            id="placeholder"
            label="Placeholder Text"
            value={fieldData.placeholder}
            onChange={handleChange}
            placeholder="Enter placeholder text"
          />

          <div className="mt-4 md:mt-0">
            <FormField
              id="required"
              label="Required Field"
              type="checkbox"
              value={fieldData.required}
              onChange={handleChange}
              helperText="Make this field mandatory"
            />
          </div>
        </div>
        
        {/* Show options field only for field types that support options */}
        {[FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(fieldData.type) && (
          <FormField
            id="options"
            label="Options"
            type="textarea"
            required
            value={fieldData.options}
            onChange={handleChange}
            placeholder="Enter options separated by commas"
            error={
              error &&
              [FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.RADIO].includes(fieldData.type) &&
              !fieldData.options.trim()
                ? error
                : ''
            }
            helperText="Enter options separated by commas (e.g. Option 1, Option 2, Option 3)"
          />
        )}
        
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Field
          </button>
        </div>
      </form>
    </div>
  );
} 