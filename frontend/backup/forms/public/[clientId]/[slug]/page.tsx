// src/app/forms/public/[clientId]/[slug]/page.tsx
'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useParams } from 'next/navigation'
import { formsService, submissionsService } from '@/services/api'

export default function PublicFormPage() {
  // pull clientId & slug from the URL
  const { clientId, slug } = useParams() as {
    clientId: string
    slug: string
  }

  // your existing state variables
  const [loading, setLoading]         = useState(true)
  const [form, setForm]               = useState<any>(null)
  const [formValues, setFormValues]   = useState<Record<string, any>>({})
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  // fetch the form once on mount
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await formsService.getPublicForm(clientId, slug)
        if (error) {
          setError(error)
        } else {
          setForm(data)
          // initialize formValues
          const initialValues: Record<string, any> = {}
          data.fields.forEach((f: any) => {
            initialValues[f.label] = f.type === 'CHECKBOX' ? [] : ''
          })
          setFormValues(initialValues)
        }
      } catch {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId, slug])

  // handle inputs (text, select, checkbox, radio)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as any
    if (type === 'checkbox') {
      setFormValues(prev => {
        const current: string[] = prev[name] || []
        if (checked) {
          return { ...prev, [name]: [...current, value] }
        } else {
          return { ...prev, [name]: current.filter(v => v !== value) }
        }
      })
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }))
    }
  }

  // your existing submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // validate required
      const missingRequired = form.fields
        .filter((field: any) => field.required)
        .filter((field: any) => {
          if (field.type === 'CHECKBOX') {
            return !formValues[field.label] || formValues[field.label].length === 0
          }
          return !formValues[field.label]
        })

      if (missingRequired.length > 0) {
        setError(
          `Please fill out all required fields: ${missingRequired
            .map((f: any) => f.label)
            .join(', ')}`
        )
        setSubmitting(false)
        return
      }

      const submissionData = {
        formId: form.id,
        data: formValues,
      }

      const { data, error } = await submissionsService.createSubmission(submissionData)

      if (data && !error) {
        setSubmitted(true)
        // reset formValues
        const initialValues: Record<string, any> = {}
        form.fields.forEach((field: any) => {
          initialValues[field.label] = field.type === 'CHECKBOX' ? [] : ''
        })
        setFormValues(initialValues)
      } else {
        setError(error || 'Failed to submit form')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // your existing loading / error / not-found / unpublished / submitted blocks
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-red-500">
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
              <p>The form you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!form.published) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Form Not Available</h2>
              <p>This form is currently not published.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-green-600">
                Form Submitted Successfully!
              </h2>
              <p className="mb-4">Thank you for your submission.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Submit Another Response
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // final render: the actual form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
            {form.description && <p className="text-gray-600">{form.description}</p>}
          </div>

          <form onSubmit={handleSubmit}>
            {form.fields && form.fields.length > 0 ? (
              <div className="space-y-6">
                {form.fields
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {field.type === 'TEXT' && (
                        <input
                          type="text"
                          name={field.label}
                          value={formValues[field.label] || ''}
                          onChange={handleInputChange}
                          placeholder={field.placeholder || ''}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}

                      {field.type === 'DROPDOWN' && (
                        <select
                          name={field.label}
                          value={formValues[field.label] || ''}
                          onChange={handleInputChange}
                          required={field.required}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select an option</option>
                          {field.options.map((option: string, index: number) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === 'CHECKBOX' && (
                        <div className="space-y-2">
                          {field.options.map((option: string, index: number) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                name={field.label}
                                value={option}
                                checked={(formValues[field.label] || []).includes(option)}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-gray-700">{option}</label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === 'RADIO' && (
                        <div className="space-y-2">
                          {field.options.map((option: string, index: number) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="radio"
                                name={field.label}
                                value={option}
                                checked={formValues[field.label] === option}
                                onChange={handleInputChange}
                                required={field.required}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label className="ml-2 text-gray-700">{option}</label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === 'FILE' && (
                        <div>
                          <input
                            type="file"
                            name={field.label}
                            required={field.required}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            File upload functionality will be implemented in a future update.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md ${
                      submitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>This form has no fields.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}