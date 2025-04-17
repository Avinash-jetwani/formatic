// src/app/submissions/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { submissionsService } from '@/services/api'
import { AuthProvider } from '@/contexts/AuthContext'

export default function SubmissionDetailPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // load the submission on mount
  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await submissionsService.getSubmission(id)
        if (error) setError(error)
        else     setSubmission(data)
      } catch {
        setError('Failed to load submission')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this submission forever?')) return
    const { error } = await submissionsService.deleteSubmission(id)
    if (error) setError(error)
    else       router.push('/forms') // or wherever you want to go
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600 p-4">Error: {error}</p>
  }

  if (!submission) {
    return <p className="p-4">Submission not found.</p>
  }

  return (
    <AuthProvider>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Submission Details</h1>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Submitted at: {new Date(submission.createdAt).toLocaleString()}
        </p>
        <div className="space-y-2">
          {Object.entries(submission.data).map(([label, value]) => (
            <div key={label} className="border-b pb-2">
              <strong>{label}:</strong>{' '}
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </div>
          ))}
        </div>
      </div>
    </AuthProvider>
  )
}