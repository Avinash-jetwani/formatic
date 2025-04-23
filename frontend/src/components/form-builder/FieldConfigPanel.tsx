// src/components/form-builder/FieldConfigPanel.tsx
import React from 'react';
import { FieldType } from '@/services/api';

interface Props {
  type: FieldType;
  config: Record<string, any>;
  onChange: (cfg: Record<string, any>) => void;
}

export default function FieldConfigPanel({ type, config, onChange }: Props) {
  // safe number parser: '' → undefined, otherwise parseFloat
  const parseNumber = (v: string) =>
    v === '' ? undefined : parseFloat(v);

  // update one config key
  const update = (key: string, value: any) =>
    onChange({ ...config, [key]: value });

  // Base classes for consistent styling
  const inputClass = "border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const smallInputClass = "border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const selectClass = "border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  switch (type) {
    case FieldType.LONG_TEXT:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Max characters
          </label>
          <input
            type="number"
            value={config.maxChars ?? ''}
            onChange={e => update('maxChars', parseNumber(e.target.value))}
            className={smallInputClass}
            min="0"
            placeholder="No limit"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty for unlimited characters
          </p>
        </div>
      );

      case FieldType.NUMBER:
        return (
          <div className="mb-4 p-3 border border-gray-100 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Number Field Configuration</h3>
            {/* Make the grid more responsive to prevent overflow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Min</label>
                <input
                  type="number"
                  value={config.min ?? ''}
                  onChange={e => update('min', parseNumber(e.target.value))}
                  className={smallInputClass}
                  placeholder="No min"
                />
              </div>
              <div>
                <label className={labelClass}>Max</label>
                <input
                  type="number"
                  value={config.max ?? ''}
                  onChange={e => update('max', parseNumber(e.target.value))}
                  className={smallInputClass}
                  placeholder="No max"
                />
              </div>
              <div>
                <label className={labelClass}>Step</label>
                <input
                  type="number"
                  value={config.step ?? ''}
                  onChange={e => update('step', parseNumber(e.target.value))}
                  className={smallInputClass}
                  placeholder="1"
                  min="0.0001"
                  step="0.0001"
                />
              </div>
            </div>
          </div>
        );

    case FieldType.DATE:
    case FieldType.TIME:
    case FieldType.DATETIME:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {type === FieldType.DATE ? 'Date' : 
             type === FieldType.TIME ? 'Time' : 'Date & Time'} Limits
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {['min', 'max'].map(key => (
              <div key={key}>
                <label className={labelClass}>
                  {key === 'min' ? 'Earliest allowed' : 'Latest allowed'}
                </label>
                <input
                  type={
                    type === FieldType.DATE
                      ? 'date'
                      : type === FieldType.TIME
                      ? 'time'
                      : 'datetime-local'
                  }
                  value={config[key] ?? ''}
                  onChange={e => update(key, e.target.value)}
                  className={smallInputClass}
                />
              </div>
            ))}
          </div>
        </div>
      );

    case FieldType.RATING:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Number of stars
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={config.maxStars ?? '5'}
              onChange={e => update('maxStars', parseNumber(e.target.value) || 5)}
              className={smallInputClass}
              min="1"
              max="10"
            />
            <div className="flex ml-3">
              {Array.from({ length: Math.min(config.maxStars || 5, 10) }).map((_, i) => (
                <svg 
                  key={i}
                  className="w-5 h-5 text-yellow-400" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Choose between 1 and 10 stars
          </p>
        </div>
      );

    case FieldType.SLIDER:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Slider Configuration</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {['min', 'max', 'step'].map(key => (
              <div key={key}>
                <label className={labelClass}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  value={config[key] ?? (key === 'min' ? '0' : key === 'max' ? '100' : '1')}
                  onChange={e => update(key, parseNumber(e.target.value))}
                  className={smallInputClass}
                  step={key === 'step' ? '0.01' : '1'}
                />
              </div>
            ))}
          </div>
          
          {/* Preview of the slider */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <label className="block text-sm text-gray-500 mb-2">Preview:</label>
            <input
              type="range"
              min={config.min ?? 0}
              max={config.max ?? 100}
              step={config.step ?? 1}
              defaultValue={config.min ?? 0}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{config.min ?? 0}</span>
              <span>{config.max ?? 100}</span>
            </div>
          </div>
        </div>
      );

    case FieldType.SCALE:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Scale Labels (comma-separated)
          </label>
          <textarea
            value={(config.labels || []).join(', ')}
            onChange={e =>
              update(
                'labels',
                e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
              )
            }
            className={inputClass}
            placeholder="e.g. Poor, Fair, Good, Very Good, Excellent"
            rows={3}
          />
          
          {/* Preview of the scale */}
          {config.labels && config.labels.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <label className="block text-sm text-gray-500 mb-2">Preview:</label>
              <div className="flex flex-wrap gap-2">
                {config.labels.map((label: string, i: number) => (
                  <div key={i} className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 text-sm bg-white">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case FieldType.PHONE:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Default country code
          </label>
          <select
            value={config.defaultCountry ?? ''}
            onChange={e => update('defaultCountry', e.target.value)}
            className={selectClass}
          >
            <option value="">All countries (show dropdown)</option>
            <option value="us">🇺🇸 United States (+1)</option>
            <option value="gb">🇬🇧 United Kingdom (+44)</option>
            <option value="in">🇮🇳 India (+91)</option>
          </select>
          
          {/* Preview of the phone field */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <label className="block text-sm text-gray-500 mb-2">Preview:</label>
            {config.defaultCountry ? (
              <div className="flex">
                <div className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-100 text-gray-500 rounded-l-md">
                  {config.defaultCountry === "us" ? "🇺🇸 +1" : 
                  config.defaultCountry === "gb" ? "🇬🇧 +44" : 
                  config.defaultCountry === "in" ? "🇮🇳 +91" : "+"}
                </div>
                <input
                  type="text"
                  disabled
                  className="flex-1 border border-gray-300 rounded-r-md p-2 bg-white text-gray-400"
                  placeholder="Phone number"
                />
              </div>
            ) : (
              <div className="flex">
                <select className="border border-r-0 border-gray-300 rounded-l-md p-2 bg-gray-100 text-gray-500" disabled>
                  <option>🇺🇸 +1</option>
                </select>
                <input
                  type="text"
                  disabled
                  className="flex-1 border border-gray-300 rounded-r-md p-2 bg-white text-gray-400"
                  placeholder="Phone number"
                />
              </div>
            )}
          </div>
        </div>
      );

    case FieldType.FILE:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Allowed file types
          </label>
          <select
            value={config.accept ?? ''}
            onChange={e => update('accept', e.target.value)}
            className={selectClass}
          >
            <option value="">All files</option>
            <option value="image/*">Images only</option>
            <option value=".pdf,.doc,.docx">Documents (PDF, DOC)</option>
            <option value=".csv,.xls,.xlsx">Spreadsheets (CSV, Excel)</option>
          </select>
          
          <div className="mt-3">
            <label className={labelClass}>
              Max file size (MB)
            </label>
            <input
              type="number"
              value={config.maxSize ?? ''}
              onChange={e => update('maxSize', parseNumber(e.target.value))}
              className={smallInputClass}
              min="0.1"
              step="0.1"
              placeholder="5"
            />
          </div>
        </div>
      );

    case FieldType.DROPDOWN:
    case FieldType.CHECKBOX:
    case FieldType.RADIO:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Display options vertically
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={config.vertical ?? true}
              onChange={e => update('vertical', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Stack options vertically</span>
          </div>
        </div>
      );

    // Add configurations for other field types as needed
    case FieldType.EMAIL:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Validation Message
          </label>
          <input
            type="text"
            value={config.validationMessage ?? ''}
            onChange={e => update('validationMessage', e.target.value)}
            className={inputClass}
            placeholder="Please enter a valid email address"
          />
        </div>
      );

    case FieldType.URL:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Validation Message
          </label>
          <input
            type="text"
            value={config.validationMessage ?? ''}
            onChange={e => update('validationMessage', e.target.value)}
            className={inputClass}
            placeholder="Please enter a valid URL (including http:// or https://)"
          />
          
          <div className="mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.requireHttps ?? false}
                onChange={e => update('requireHttps', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Require HTTPS</span>
            </label>
          </div>
        </div>
      );

    case FieldType.TEXT:
      return (
        <div className="mb-4 p-3 border border-gray-100 rounded-md">
          <label className={labelClass}>
            Min length
          </label>
          <input
            type="number"
            value={config.minLength ?? ''}
            onChange={e => update('minLength', parseNumber(e.target.value))}
            className={smallInputClass}
            min="0"
            placeholder="0"
          />
          
          <div className="mt-3">
            <label className={labelClass}>
              Max length
            </label>
            <input
              type="number"
              value={config.maxLength ?? ''}
              onChange={e => update('maxLength', parseNumber(e.target.value))}
              className={smallInputClass}
              min="0"
              placeholder="No limit"
            />
          </div>
        </div>
      );

    // Default case for fields that don't need extra config
    default:
      return (
        <div className="p-3 mb-4 bg-gray-50 rounded-md text-sm text-gray-500">
          No additional configuration needed for this field type.
        </div>
      );
  }
}