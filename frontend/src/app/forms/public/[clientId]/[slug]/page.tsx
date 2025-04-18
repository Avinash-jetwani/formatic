// src/app/forms/public/[clientId]/[slug]/page.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { formsService, submissionsService, FieldType } from '@/services/api'

export default function PublicFormPage() {
  const { clientId, slug } = useParams() as {
    clientId: string
    slug: string
  }

  const [loading, setLoading]       = useState(true)
  const [form, setForm]             = useState<any>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await formsService.getPublicForm(clientId, slug)
        if (error) {
          setError(error)
        } else {
          setForm(data)
          // initialize values
          const init: Record<string, any> = {}
          data.fields.forEach((f: any) => {
            if (f.type === FieldType.CHECKBOX) init[f.label] = []
            else init[f.label] = ''
          })
          setFormValues(init)
        }
      } catch {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId, slug])

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormValues(prev => {
      if (type === 'checkbox') {
        const arr = prev[name] || []
        return {
          ...prev,
          [name]: checked
            ? [...arr, value]
            : arr.filter((v: string) => v !== value),
        }
      }
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // required validation
    const missing = form.fields
      .filter((f: any) => f.required)
      .filter((f: any) => {
        const val = formValues[f.label]
        if (f.type === FieldType.CHECKBOX) return !val?.length
        return !val
      })

    if (missing.length) {
      setError(
        'Please fill: ' + missing.map((f: any) => f.label).join(', ')
      )
      return setSubmitting(false)
    }

    try {
      const payload = { formId: form.id, data: formValues }
      const { data, error } = await submissionsService.createSubmission(payload)
      if (data && !error) {
        setSubmitted(true)
      } else {
        setError(error || 'Submit failed')
      }
    } catch {
      setError('Submit error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )

  if (error)
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 text-red-700 rounded">
        <h2 className="font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    )

  if (!form)
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 text-yellow-700 rounded">
        <h2 className="font-semibold mb-2">Form Not Found</h2>
      </div>
    )

  if (!form.published)
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-100 text-gray-700 rounded">
        <h2 className="font-semibold mb-2">Not Published</h2>
      </div>
    )

  if (submitted)
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 text-green-700 rounded">
        <h2 className="font-semibold mb-2">Thank you!</h2>
        <p>Your response has been submitted.</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && <p className="text-gray-600 mb-4">{form.description}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields
            .sort((a: any, b: any) => a.order - b.order)
            .map((field: any) => (
              <div key={field.id}>
                <label className="block font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* TEXT */}
                {field.type === FieldType.TEXT && (
                  <input
                    type="text"
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                )}

                {/* LONG_TEXT */}
                {field.type === FieldType.LONG_TEXT && (
                  <textarea
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                    required={field.required}
                  />
                )}

                {/* EMAIL */}
                {field.type === FieldType.EMAIL && (
                  <input
                    type="email"
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2"
                    required={field.required}
                  />
                )}

                {/* URL */}
                {field.type === FieldType.URL && (
                  <input
                    type="url"
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2"
                    required={field.required}
                  />
                )}

                {/* NUMBER */}
                {field.type === FieldType.NUMBER && (
                  <input
                    type="number"
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    min={field.config?.min}
                    max={field.config?.max}
                    step={field.config?.step}
                    className="w-full border-gray-300 rounded-md p-2"
                    required={field.required}
                  />
                )}

                {/* DATE / TIME / DATETIME */}
                {(field.type === FieldType.DATE ||
                  field.type === FieldType.TIME ||
                  field.type === FieldType.DATETIME) && (
                  <input
                    type={
                      field.type === FieldType.DATE
                        ? 'date'
                        : field.type === FieldType.TIME
                        ? 'time'
                        : 'datetime-local'
                    }
                    name={field.label}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    min={field.config?.min}
                    max={field.config?.max}
                    className="w-full border-gray-300 rounded-md p-2"
                    required={field.required}
                  />
                )}

                {/* DROPDOWN */}
                {field.type === FieldType.DROPDOWN && (
                  <select
                    name={field.label}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2"
                    required={field.required}
                  >
                    <option value="">Select…</option>
                    {field.options.map((opt: string, i: number) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {/* CHECKBOX */}
                {field.type === FieldType.CHECKBOX && (
                  <div className="space-y-2">
                    {field.options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          name={field.label}
                          value={opt}
                          checked={(formValues[field.label] || []).includes(opt)}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* RADIO */}
                {field.type === FieldType.RADIO && (
                  <div className="space-y-2">
                    {field.options.map((opt: string, i: number) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="radio"
                          name={field.label}
                          value={opt}
                          checked={formValues[field.label] === opt}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* PHONE */}
                {field.type === FieldType.PHONE && (
                  <input
                    type="tel"
                    name={field.label}
                    placeholder={field.placeholder || ''}
                    value={formValues[field.label] || ''}
                    onChange={handleInputChange}
                    className="w-full border-gray-300 rounded-md p-2"
                    pattern="[0-9+]*"
                    required={field.required}
                  />
                )}

                {/* FILE */}
                {field.type === FieldType.FILE && (
                  <input
                    type="file"
                    name={field.label}
                    required={field.required}
                    className="w-full"
                  />
                )}

                {/* SLIDER */}
                {field.type === FieldType.SLIDER && (
                  <input
                    type="range"
                    name={field.label}
                    min={field.config?.min ?? 0}
                    max={field.config?.max ?? 100}
                    step={field.config?.step ?? 1}
                    value={formValues[field.label] || field.config?.min || 0}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                )}

                {/* RATING */}
                {field.type === FieldType.RATING && (
                  <div className="flex space-x-1">
                    {Array.from({ length: field.config?.maxStars || 5 }).map((_, i) => (
                      <label key={i} className="cursor-pointer">
                        <input
                          type="radio"
                          name={field.label}
                          value={i + 1}
                          checked={formValues[field.label] === String(i + 1)}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <svg
                          className={`w-6 h-6 ${
                            formValues[field.label] >= i + 1
                              ? 'fill-yellow-400'
                              : 'fill-gray-300'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 ... (star path)" />
                        </svg>
                      </label>
                    ))}
                  </div>
                )}

                {/* SCALE */}
                {field.type === FieldType.SCALE && (
                  <div className="flex space-x-4">
                    {(field.config?.labels || []).map((lbl: string, i: number) => (
                      <label key={i} className="flex items-center">
                        <input
                          type="radio"
                          name={field.label}
                          value={lbl}
                          checked={formValues[field.label] === lbl}
                          onChange={handleInputChange}
                          className="mr-1"
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}