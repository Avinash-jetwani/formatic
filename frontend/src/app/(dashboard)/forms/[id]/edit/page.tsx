'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formsService } from '@/services/api'
import { AuthProvider } from '@/contexts/AuthContext'

export default function FormEditPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch form details on mount
  useEffect(() => {
    async function loadForm() {
      try {
        const { data, error } = await formsService.getForm(id)
        if (error) throw new Error(error)
        setTitle(data.title)
        setDescription(data.description || '')
        setPublished(data.published)
      } catch (err: any) {
        setError(err.message || 'Failed to load form')
      } finally {
        setLoading(false)
      }
    }
    loadForm()
  }, [id])

  // Save updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { error } = await formsService.updateForm(id, {
        title,
        description,
        published,
      })
      if (error) {
        setError(error)
        return
      }
      router.push(`/forms/${id}`)
    } catch {
      setError('Failed to update form')
    }
  }

  if (loading) return <p>Loading form…</p>
  if (error)   return <p className="text-red-600">Error: {error}</p>

  return (
    <AuthProvider>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Edit Form Details</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="flex items-center">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="published" className="ml-2 text-sm">
              Published
            </label>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.push(`/forms/${id}`)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AuthProvider>
  )
}