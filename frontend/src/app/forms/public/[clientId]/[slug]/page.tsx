'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { formsService, submissionsService, FieldType } from '@/services/api'

export default function PublicFormPage() {
  const { clientId, slug } = useParams() as {
    clientId: string
    slug: string
  }

  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // CSS classes for styling consistency
  const inputBaseClass = "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const selectBaseClass = "w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const checkboxBaseClass = "h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition-all";
  const radioBaseClass = "h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded-full transition-all";
  const rangeBaseClass = "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600";
  const fileBaseClass = "block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none";

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
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{form.title}</h1>
        {form.description && <p className="text-gray-600 mb-6 border-b border-gray-200 pb-4">{form.description}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields
            .sort((a: any, b: any) => a.order - b.order)
            .map((field: any) => (
              <div key={field.id} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-all">
                <label className="block font-medium text-gray-700 mb-2">
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
                    className={inputBaseClass}
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
                    className={`${inputBaseClass} min-h-[120px]`}
                    required={field.required}
                    maxLength={field.config?.maxChars}
                  />
                )}

                {/* EMAIL */}
                {field.type === FieldType.EMAIL && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name={field.label}
                      placeholder={field.placeholder || 'email@example.com'}
                      value={formValues[field.label] || ''}
                      onChange={handleInputChange}
                      className={`${inputBaseClass} pl-10`}
                      required={field.required}
                    />
                  </div>
                )}

                {/* URL */}
                {field.type === FieldType.URL && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <input
                      type="url"
                      name={field.label}
                      placeholder={field.placeholder || 'https://'}
                      value={formValues[field.label] || ''}
                      onChange={handleInputChange}
                      className={`${inputBaseClass} pl-10`}
                      required={field.required}
                    />
                  </div>
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
                    className={inputBaseClass}
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
                    className={inputBaseClass}
                    required={field.required}
                  />
                )}

                {/* DROPDOWN */}
                {field.type === FieldType.DROPDOWN && (
                  <div className="relative">
                    <select
                      name={field.label}
                      value={formValues[field.label] || ''}
                      onChange={handleInputChange}
                      className={selectBaseClass}
                      required={field.required}
                    >
                      <option value="">Select…</option>
                      {field.options.map((opt: string, i: number) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
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
                          className={checkboxBaseClass}
                        />
                        <span className="ml-2">{opt}</span>
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
                          className={radioBaseClass}
                        />
                        <span className="ml-2">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* PHONE */}
                {field.type === FieldType.PHONE && (
                  <div className="flex">
                    {field.config?.defaultCountry ? (
                      // Display specific country code selector
                      <>
                        <div className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                          {field.config.defaultCountry === "us" ? "🇺🇸 +1" : 
                          field.config.defaultCountry === "gb" ? "🇬🇧 +44" : 
                          field.config.defaultCountry === "in" ? "🇮🇳 +91" : "+"}
                        </div>
                        <input
                          type="tel"
                          name={field.label}
                          placeholder={field.placeholder || ''}
                          value={formValues[field.label] || ''}
                          onChange={handleInputChange}
                          className="flex-1 border border-gray-300 rounded-r-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          pattern="[0-9]*"
                          required={field.required}
                        />
                      </>
                    ) : (
                      // Display dropdown for all countries
                      <>
                        <select 
                          className="border border-r-0 border-gray-300 rounded-l-md p-2 bg-gray-50"
                          onChange={(e) => {
                            // Handle country change
                            const country = e.target.value;
                            // Update formValues to include country code
                            setFormValues(prev => ({
                              ...prev,
                              [`${field.label}_country`]: country
                            }));
                          }}
                        >
                          <option value="">Select</option>
                          <option value="us">🇺🇸 +1</option>
                          <option value="gb">🇬🇧 +44</option>
                          <option value="in">🇮🇳 +91</option>
                        </select>
                        <input
                          type="tel"
                          name={field.label}
                          placeholder={field.placeholder || ''}
                          value={formValues[field.label] || ''}
                          onChange={handleInputChange}
                          className="flex-1 border border-gray-300 rounded-r-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          pattern="[0-9]*"
                          required={field.required}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* FILE */}
                {field.type === FieldType.FILE && (
                  <input
                    type="file"
                    name={field.label}
                    required={field.required}
                    className={fileBaseClass}
                  />
                )}

                {/* SLIDER */}
                {field.type === FieldType.SLIDER && (
                  <div>
                    <input
                      type="range"
                      name={field.label}
                      min={field.config?.min ?? 0}
                      max={field.config?.max ?? 100}
                      step={field.config?.step ?? 1}
                      value={formValues[field.label] || field.config?.min || 0}
                      onChange={handleInputChange}
                      className={rangeBaseClass}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{field.config?.min ?? 0}</span>
                      <span>Current: {formValues[field.label] || field.config?.min || 0}</span>
                      <span>{field.config?.max ?? 100}</span>
                    </div>
                  </div>
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
                          checked={Number(formValues[field.label]) === i + 1}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <svg
                          className={`w-8 h-8 ${
                            Number(formValues[field.label]) >= i + 1
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </label>
                    ))}
                    <span className="ml-2 text-gray-500">
                      {formValues[field.label] ? `${formValues[field.label]} out of ${field.config?.maxStars || 5}` : ''}
                    </span>
                  </div>
                )}

                {/* SCALE */}
                {field.type === FieldType.SCALE && (
                  <div className="flex flex-wrap gap-2">
                    {(field.config?.labels || []).map((lbl: string, i: number) => (
                      <label key={i} className="flex items-center justify-center p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-all">
                        <input
                          type="radio"
                          name={field.label}
                          value={lbl}
                          checked={formValues[field.label] === lbl}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className={`${formValues[field.label] === lbl ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                          {lbl}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Field description/hint if needed */}
                {field.description && (
                  <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                )}
              </div>
            ))}

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}