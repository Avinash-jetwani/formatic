'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submissionsService } from '@/services/api'
import { AuthProvider } from '@/contexts/AuthContext'

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await submissionsService.getAllSubmissions()
        if (error) setError(error)
        else       setSubmissions(data || [])
      } catch {
        setError('Failed to load submissions')
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
    return (
      <div className="p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <AuthProvider>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">All Submissions</h1>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub.id} className="flex justify-between items-center border rounded p-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(sub.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                  {sub.client?.name || 'Customer'}
                </span>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => router.push(`/submissions/${sub.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No submissions found.</p>
        )}
      </div>
    </AuthProvider>
  )
}