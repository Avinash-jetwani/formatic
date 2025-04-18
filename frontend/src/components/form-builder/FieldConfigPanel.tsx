// src/components/form-builder/FieldConfigPanel.tsx
import React from 'react'
import { FieldType } from '@/services/api'

interface Props {
  type: FieldType
  config: Record<string, any>
  onChange: (cfg: Record<string, any>) => void
}

export default function FieldConfigPanel({ type, config, onChange }: Props) {
  // safe number parser: '' → undefined, otherwise parseFloat
  const parseNumber = (v: string) =>
    v === '' ? undefined : parseFloat(v)

  // update one config key
  const update = (key: string, value: any) =>
    onChange({ ...config, [key]: value })

  switch (type) {
    case FieldType.LONG_TEXT:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max characters
          </label>
          <input
            type="number"
            value={config.maxChars ?? ''}
            onChange={e => update('maxChars', parseNumber(e.target.value))}
            className="border rounded p-1 w-24"
          />
        </div>
      )

    case FieldType.NUMBER:
      return (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-sm font-medium">Min</label>
            <input
              type="number"
              value={config.min ?? ''}
              onChange={e => update('min', parseNumber(e.target.value))}
              className="border rounded p-1 w-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max</label>
            <input
              type="number"
              value={config.max ?? ''}
              onChange={e => update('max', parseNumber(e.target.value))}
              className="border rounded p-1 w-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Step</label>
            <input
              type="number"
              value={config.step ?? ''}
              onChange={e => update('step', parseNumber(e.target.value))}
              className="border rounded p-1 w-24"
            />
          </div>
        </div>
      )

    case FieldType.DATE:
    case FieldType.TIME:
    case FieldType.DATETIME:
      return (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {['min', 'max'].map(key => (
            <div key={key}>
              <label className="block text-sm font-medium">
                {key.charAt(0).toUpperCase() + key.slice(1)}
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
                className="border rounded p-1"
              />
            </div>
          ))}
        </div>
      )

    case FieldType.RATING:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max stars
          </label>
          <input
            type="number"
            value={config.maxStars ?? ''}
            onChange={e =>
              update('maxStars', parseNumber(e.target.value) ?? 5)
            }
            className="border rounded p-1 w-16"
          />
        </div>
      )

    case FieldType.SLIDER:
      return (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['min', 'max', 'step'].map(key => (
            <div key={key}>
              <label className="block text-sm font-medium">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="number"
                value={config[key] ?? ''}
                onChange={e => update(key, parseNumber(e.target.value))}
                className="border rounded p-1 w-24"
              />
            </div>
          ))}
        </div>
      )

    case FieldType.SCALE:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Labels (comma‑separated)
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
            className="border rounded p-1 w-full"
          />
        </div>
      )

    case FieldType.PHONE:
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default country code
          </label>
          <select
            value={config.defaultCountry ?? ''}
            onChange={e => update('defaultCountry', e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-40"
          >
            <option value="">All countries</option>
            <option value="us">🇺🇸 +1</option>
            <option value="gb">🇬🇧 +44</option>
            <option value="in">🇮🇳 +91</option>
          </select>
        </div>
      )

    // EMAIL, URL, TEXT, DROPDOWN, CHECKBOX, RADIO, FILE: no extra config
    default:
      return null
  }
}