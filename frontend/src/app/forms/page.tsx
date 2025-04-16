'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formsService } from '@/services/api'
import { AuthProvider } from '@/contexts/AuthContext'

export default function FormsPage() {
  const router = useRouter()
  const [forms, setForms]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await formsService.getAllForms()
        if (error) setError(error)
        else       setForms(data || [])
      } catch {
        setError('Failed to load forms')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600 p-6">Error: {error}</p>
  }

  return (
    <AuthProvider>
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <div key={form.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{form.title}</h2>
                {form.description && <p className="text-gray-600">{form.description}</p>}
              </div>
              <span
                className={
                  `inline-block px-2 py-1 text-xs font-medium rounded-full ` +
                  (form.client?.name === 'Super Admin'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-blue-200 text-blue-800')
                }
              >
                {form.client?.name || 'Unknown'}
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  form.published ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {form.published ? 'Published' : 'Draft'} • {form._count?.submissions} submissions
            </div>
            <button
              onClick={() => router.push(`/forms/${form.id}`)}
              className="mt-6 w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </AuthProvider>
  )
}