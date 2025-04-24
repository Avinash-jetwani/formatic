// src/app/forms/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formsService, FieldType } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { SearchFilterBar } from '@/components/features/forms/SearchFilterBar'
import { Button } from '@/components/ui/button/Button'
import { FilePlus } from 'lucide-react'
import { EnhancedFormCard } from '@/components/features/forms/EnhancedFormCard'
import { FormStatisticsSection } from '@/components/features/forms/FormStatisticsSection'

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
  fields?: Array<{
    id: string
    label: string
    type: FieldType
    placeholder?: string
    required: boolean
    order: number
    options?: any[]
    config?: Record<string, any>
  }>
}

function FormsPageContent() {
  const { push } = useRouter()
  const { user, logout } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [forms, setForms] = useState<Form[]>([])
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
        else setForms(data as Form[] || [])
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
      const { data: originalForm, error: fetchError } = await formsService.getForm(formId)
      if (fetchError || !originalForm) {
        setError('Failed to fetch form to duplicate')
        return
      }
      
      // Create new form with same data but modified title
      const { data: newForm, error: createError } = await formsService.createForm({
        title: `${(originalForm as Form).title} (Copy)`,
        description: (originalForm as Form).description,
        published: false // Start as draft
      })
      
      if (createError || !newForm) {
        setError('Failed to create duplicate form')
        return
      }
      
      // Copy all fields if the form has any
      if ((originalForm as Form).fields && (originalForm as Form).fields!.length > 0) {
        for (const field of (originalForm as Form).fields!) {
          await formsService.addField((newForm as Form).id, {
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
            onClick={() => push('/forms/create')}
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
      
      {/* Use SearchFilterBar component */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        tags={allTags}
        activeTag={activeTag}
        onTagClick={handleTagClick}
      />
      
      {/* Stats summary */}
      {forms.length > 0 && (
        <FormStatisticsSection 
          totalForms={forms.length} 
          publishedForms={forms.filter(f => f.published).length}
          totalSubmissions={forms.reduce((acc, form) => acc + (form._count?.submissions || 0), 0)}
          isLoading={loading}
          className="mb-6"
        />
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
                onClick={() => push('/forms/create')}
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
      {viewMode === 'grid' && filteredAndSortedForms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedForms.map((form) => {
            const tags = extractTags(form.description || '');
            
            return (
              <EnhancedFormCard
                key={form.id}
                form={form}
                onDelete={(form) => {
                  setFormToDelete(form)
                  setShowDeleteModal(true)
                }}
                onDuplicate={handleDuplicateForm}
                tags={tags}
                onTagClick={handleTagClick}
                activeTag={activeTag}
                showClientInfo={user?.role === 'SUPER_ADMIN'}
              />
            );
          })}
        </div>
      )}
      
      {/* List view */}
      {viewMode === 'list' && filteredAndSortedForms.length > 0 && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Form</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <strong>{formToDelete.title}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
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
    <div className="container mx-auto px-4 py-8">
      <FormsPageContent />
    </div>
  )
}