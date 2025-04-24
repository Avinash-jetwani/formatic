import React from 'react';
import { FieldType } from '@/services/api';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
  config?: Record<string, any>;
}

interface FormBuilderPreviewProps {
  title: string;
  description?: string;
  fields: FormField[];
}

export default function FormBuilderPreview({
  title,
  description,
  fields,
}: FormBuilderPreviewProps) {
  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  // Render field based on type
  const renderField = (field: FormField) => {
    const {
      id,
      label,
      type,
      placeholder,
      required,
      options = [],
      config = {},
    } = field;

    switch (type) {
      case FieldType.TEXT:
        return (
          <input
            type="text"
            id={id}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.LONG_TEXT:
        return (
          <textarea
            id={id}
            placeholder={placeholder}
            required={required}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.NUMBER:
        return (
          <input
            type="number"
            id={id}
            placeholder={placeholder}
            required={required}
            min={config?.min}
            max={config?.max}
            step={config?.step}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.EMAIL:
        return (
          <input
            type="email"
            id={id}
            placeholder={placeholder || 'example@email.com'}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.DATE:
        return (
          <input
            type="date"
            id={id}
            required={required}
            min={config?.min}
            max={config?.max}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.TIME:
        return (
          <input
            type="time"
            id={id}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.DROPDOWN:
        return (
          <select
            id={id}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case FieldType.CHECKBOX:
        return (
          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${id}-${idx}`}
                  className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <label htmlFor={`${id}-${idx}`} className="ml-2 block text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case FieldType.RADIO:
        return (
          <div className="space-y-2">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input
                  type="radio"
                  id={`${id}-${idx}`}
                  name={id}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <label htmlFor={`${id}-${idx}`} className="ml-2 block text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case FieldType.FILE:
        return (
          <input
            type="file"
            id={id}
            required={required}
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
            disabled
          />
        );
      case FieldType.RATING:
        return (
          <div className="flex items-center">
            {Array.from({ length: config?.maxStars || 5 }).map((_, idx) => (
              <svg
                key={idx}
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
        );
      case FieldType.SLIDER:
        return (
          <div>
            <input
              type="range"
              id={id}
              min={config?.min || 0}
              max={config?.max || 100}
              step={config?.step || 1}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{config?.min || 0}</span>
              <span>{config?.max || 100}</span>
            </div>
          </div>
        );
      case FieldType.URL:
        return (
          <input
            type="url"
            id={id}
            placeholder={placeholder || 'https://example.com'}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      case FieldType.PHONE:
        return (
          <input
            type="tel"
            id={id}
            placeholder={placeholder || 'Phone number'}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
      default:
        return (
          <input
            type="text"
            id={id}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled
          />
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-gray-600">{description}</p>
        )}
      </div>

      {sortedFields.length === 0 ? (
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
          <p className="text-xs mt-1">Add fields to see a preview of your form</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedFields.map((field) => (
            <div key={field.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="pt-4">
            <button
              type="button"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 opacity-50 cursor-not-allowed"
              disabled
            >
              Submit Form
            </button>
            <p className="text-xs text-center mt-2 text-gray-500">
              This is a preview. Form submission is disabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 