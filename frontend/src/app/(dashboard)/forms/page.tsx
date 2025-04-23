// src/app/forms/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formsService } from '@/services/api'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Form type definition for better type safety
interface Form {
  id: string
  title: string
  description?: string
  published: boolean
  createdAt: string
  updatedAt: string
  clientId: string
  slug: string
  client?: {
    id: string
    name: string
  }
  _count?: {
    submissions: number
    fields: number
  }
}

function FormsPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'submissions'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  
  // Fetch forms
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const { data, error } = await formsService.getAllForms()
        if (error) setError(error)
        else setForms(data || [])
      } catch {
        setError('Failed to load forms')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshTrigger])
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!formToDelete) return
    
    try {
      const { error } = await formsService.deleteForm(formToDelete.id)
      if (error) {
        setError(`Failed to delete form: ${error}`)
      } else {
        // Remove from local state
        setForms(forms.filter(f => f.id !== formToDelete.id))
      }
    } catch {
      setError('An error occurred while deleting the form')
    } finally {
      setShowDeleteModal(false)
      setFormToDelete(null)
    }
  }
  
  // Generate all tags from forms
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    forms.forEach(form => {
      // Extract tags from description if they exist with #tag format
      const description = form.description || ''
      const hashtagRegex = /#(\w+)/g
      const matches = description.match(hashtagRegex)
      
      if (matches) {
        matches.forEach(match => {
          tags.add(match.substring(1)) // Remove the # symbol
        })
      }
    })
    return Array.from(tags)
  }, [forms])
  
  // Helper function to duplicate a form
  const handleDuplicateForm = async (formId: string) => {
    try {
      const { data: originalForm } = await formsService.getForm(formId)
      if (!originalForm) {
        setError('Failed to fetch form to duplicate')
        return
      }
      
      // Create new form with same data but modified title
      const { data: newForm } = await formsService.createForm({
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        published: false // Start as draft
      })
      
      if (!newForm) {
        setError('Failed to create duplicate form')
        return
      }
      
      // Copy all fields if the form has any
      if (originalForm.fields && originalForm.fields.length > 0) {
        for (const field of originalForm.fields) {
          await formsService.addField(newForm.id, {
            label: field.label,
            type: field.type,
            placeholder: field.placeholder,
            required: field.required,
            order: field.order,
            options: field.options || [],
            config: field.config || {}
          })
        }
      }
      
      // Refresh forms list
      setRefreshTrigger(prev => prev + 1)
      
    } catch (err) {
      setError('Failed to duplicate form')
      console.error(err)
    }
  }
  
  // Filter, sort and search forms
  const filteredAndSortedForms = useMemo(() => {
    // Filter by status
    let result = [...forms]
    
    if (filter === 'published') {
      result = result.filter(form => form.published)
    } else if (filter === 'draft') {
      result = result.filter(form => !form.published)
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(form => 
        form.title.toLowerCase().includes(term) || 
        (form.description || '').toLowerCase().includes(term)
      )
    }
    
    // Filter by active tag (if set)
    if (activeTag) {
      result = result.filter(form => 
        (form.description || '').includes(`#${activeTag}`)
      )
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } 
      else if (sortBy === 'submissions') {
        const aCount = a._count?.submissions || 0
        const bCount = b._count?.submissions || 0
        return sortOrder === 'asc' ? aCount - bCount : bCount - aCount
      }
      else { // date
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    
    return result
  }, [forms, filter, searchTerm, sortBy, sortOrder, activeTag])
  
  // Toggle sort order when clicking the same sort option
  const handleSortChange = (newSortBy: 'title' | 'date' | 'submissions') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc') // Default to descending for new sort
    }
  }
  
  // Helper to get sort indicator
  const getSortIndicator = (column: 'title' | 'date' | 'submissions') => {
    if (sortBy !== column) return null
    
    return sortOrder === 'asc' 
      ? '↑' 
      : '↓'
  }
  
  // Extract tags from a form description
  const extractTags = (description: string = '') => {
    const hashtagRegex = /#(\w+)/g
    const matches = description.match(hashtagRegex) || []
    return matches.map(tag => tag.substring(1)) // Remove # symbol
  }
  
  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null) // Toggle off if the same tag is clicked again
    } else {
      setActiveTag(tag)
    }
  }
  
  // Loading state
  if (loading && forms.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Forms</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/forms/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Form
          </button>
          
          {/* Toggle view mode */}
          <div className="bg-white border border-gray-300 rounded-md flex">
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="sr-only">Search forms</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="search"
                placeholder="Search forms..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            >
              <option value="all">All Forms</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <label htmlFor="sort-by" className="sr-only">Sort by</label>
            <div className="flex">
              <button
                className={`px-3 py-2 text-sm font-medium ${sortBy === 'date' ? 'text-blue-600' : 'text-gray-500'} hover:bg-gray-50 rounded-l border border-gray-300`}
                onClick={() => handleSortChange('date')}
              >
                Date {getSortIndicator('date')}
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${sortBy === 'title' ? 'text-blue-600' : 'text-gray-500'} hover:bg-gray-50 border-t border-b border-gray-300`}
                onClick={() => handleSortChange('title')}
              >
                Name {getSortIndicator('title')}
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium ${sortBy === 'submissions' ? 'text-blue-600' : 'text-gray-500'} hover:bg-gray-50 rounded-r border border-gray-300`}
                onClick={() => handleSortChange('submissions')}
              >
                Responses {getSortIndicator('submissions')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeTag === tag 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => setActiveTag(null)}
                className="px-3 py-1 rounded-full text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Stats summary */}
      {forms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500">Total Forms</h2>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{forms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500">Published Forms</h2>
            <p className="mt-1 text-3xl font-semibold text-green-600">{forms.filter(f => f.published).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500">Total Submissions</h2>
            <p className="mt-1 text-3xl font-semibold text-blue-600">
              {forms.reduce((acc, form) => acc + (form._count?.submissions || 0), 0)}
            </p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Empty state */}
      {filteredAndSortedForms.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {searchTerm || activeTag || filter !== 'all'
              ? 'No forms match your filters'
              : 'No forms yet'}
          </h3>
          
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || activeTag || filter !== 'all'
              ? 'Try adjusting your search or filter settings'
              : 'Get started by creating your first form'}
          </p>
          
          <div className="mt-6">
            {searchTerm || activeTag || filter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilter('all')
                  setActiveTag(null)
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => router.push('/forms/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create a Form
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Grid view */}
      {filteredAndSortedForms.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedForms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                      <Link href={`/forms/${form.id}`}>
                        {form.title}
                      </Link>
                    </h2>
                  
                    {form.description && (
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {form.description.split(/#\w+/g).join(' ')} {/* Remove hashtags from display */}
                      </p>
                    )}
                  </div>
                  
                  {user?.role === 'SUPER_ADMIN' && form.client && (
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {form.client.name}
                    </span>
                  )}
                </div>
                
                {/* Tags */}
                {form.description && extractTags(form.description).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {extractTags(form.description).map(tag => (
                      <span 
                        key={tag} 
                        className="inline-block px-2 py-0.5 text-xs text-gray-600 hover:text-blue-600 cursor-pointer"
                        onClick={() => handleTagClick(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        form.published ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      {form.published ? 'Published' : 'Draft'}
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {form._count?.fields || 0} fields
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      {form._count?.submissions || 0} responses
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 flex flex-col space-y-2">
                  <Link
                    href={`/forms/${form.id}`}
                    className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 text-center"
                  >
                    View Details
                  </Link>
                  
                  <div className="flex space-x-2">
                    {form.published && (
                      <Link
                        href={`/forms/public/${form.clientId}/${form.slug}`}
                        target="_blank"
                        className="flex-1 bg-green-50 text-green-700 py-1 px-3 rounded-md hover:bg-green-100 text-center text-sm flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateForm(form.id)}
                      className="flex-1 bg-blue-50 text-blue-700 py-1 px-3 rounded-md hover:bg-blue-100 text-center text-sm flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Duplicate
                    </button>
                    
                    <button
                      onClick={() => {
                        setFormToDelete(form)
                        setShowDeleteModal(true)
                      }}
                      className="flex-1 bg-red-50 text-red-700 py-1 px-3 rounded-md hover:bg-red-100 text-center text-sm flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* List view */}
      {filteredAndSortedForms.length > 0 && viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('title')}>
                  <div className="flex items-center">
                    Form Name
                    {getSortIndicator('title') && (
                      <span className="ml-1">{getSortIndicator('title')}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('date')}>
                  <div className="flex items-center">
                    Created
                    {getSortIndicator('date') && (
                      <span className="ml-1">{getSortIndicator('date')}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fields
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('submissions')}>
                  <div className="flex items-center">
                    Responses
                    {getSortIndicator('submissions') && (
                      <span className="ml-1">{getSortIndicator('submissions')}</span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <Link 
                          href={`/forms/${form.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {form.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1 max-w-sm truncate">
                          {form.description ? form.description.split(/#\w+/g).join(' ') : 'No description'}
                        </div>
                        
                        {/* Tags */}
                        {form.description && extractTags(form.description).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {extractTags(form.description).map(tag => (
                              <span 
                                key={tag} 
                                className="inline-block text-xs text-gray-600 hover:text-blue-600 cursor-pointer"
                                onClick={() => handleTagClick(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      form.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form._count?.fields || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form._count?.submissions || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link 
                        href={`/forms/${form.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      
                      {form.published && (
                        <Link
                          href={`/forms/public/${form.clientId}/${form.slug}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900"
                        >
                          Preview
                        </Link>
                      )}
                      
                      <button
                        onClick={() => handleDuplicateForm(form.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Duplicate
                      </button>
                      
                      <button 
                        onClick={() => {
                          setFormToDelete(form)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && formToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Form</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete <span className="font-medium text-gray-700">"{formToDelete.title}"</span>? This action cannot be undone and all submissions will be permanently lost.
            </p>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                onClick={() => {
                  setShowDeleteModal(false)
                  setFormToDelete(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FormsPage() {
  return (
    <AuthProvider>
      <FormsPageContent />
    </AuthProvider>
  )
}