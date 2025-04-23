// src/app/(dashboard)/submissions/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { submissionsService, formsService } from '@/services/api';

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFormId = searchParams?.get('form') || 'all';

  // State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState(initialFormId);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'createdAt',
    direction: 'desc'
  });
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const submissionsPerPage = 10;

  // Data fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [submissionsRes, formsRes] = await Promise.all([
        submissionsService.getAllSubmissions(),
        formsService.getAllForms(),
      ]);

      if (submissionsRes.data && !submissionsRes.error) {
        setSubmissions(submissionsRes.data);
      } else {
        setError(submissionsRes.error || 'Failed to fetch submissions');
      }

      if (formsRes.data && !formsRes.error) {
        setForms(formsRes.data);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form selection
  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedForm(e.target.value);
    setCurrentPage(1);
    setSelectedSubmissions([]);
    setIsSelectAll(false);
    
    // Update URL param without navigation
    const url = new URL(window.location.href);
    if (e.target.value === 'all') {
      url.searchParams.delete('form');
    } else {
      url.searchParams.set('form', e.target.value);
    }
    window.history.pushState({}, '', url.toString());
  };

  // Filter logic
  const filteredSubmissions = submissions
    .filter(submission => selectedForm === 'all' || submission.formId === selectedForm)
    .filter(submission => {
      // Search filter
      if (searchTerm) {
        const data = JSON.stringify(submission.data).toLowerCase();
        return data.includes(searchTerm.toLowerCase());
      }
      return true;
    })
    .filter(submission => {
      // Date filter
      if (dateRange.start && dateRange.end) {
        const submissionDate = new Date(submission.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        return submissionDate >= startDate && submissionDate <= endDate;
      }
      return true;
    });

  // Sorting
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const aValue = sortConfig.column === 'createdAt' 
      ? new Date(a.createdAt).getTime() 
      : a[sortConfig.column];
    const bValue = sortConfig.column === 'createdAt' 
      ? new Date(b.createdAt).getTime() 
      : b[sortConfig.column];
      
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastSubmission = currentPage * submissionsPerPage;
  const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
  const currentSubmissions = sortedSubmissions.slice(indexOfFirstSubmission, indexOfLastSubmission);
  const totalPages = Math.ceil(sortedSubmissions.length / submissionsPerPage);

  // Handle sorting
  const handleSort = (column: string) => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get the form title
  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form ? form.title : 'Unknown Form';
  };

  // Handle checkbox selections
  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(currentSubmissions.map(sub => sub.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const toggleSelectSubmission = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id) 
        : [...prev, id]
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedSubmissions.length} submissions? This action cannot be undone.`)) {
      setLoading(true);
      try {
        // Perform delete operations sequentially to avoid overwhelming the API
        for (const id of selectedSubmissions) {
          await submissionsService.deleteSubmission(id);
        }
        
        // Refresh data after deleting
        fetchData();
        setSelectedSubmissions([]);
        setIsSelectAll(false);
      } catch (err) {
        setError('Failed to delete submissions');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export to CSV
  const handleExport = async () => {
    if (filteredSubmissions.length === 0) return;
    
    setExporting(true);
    try {
      // We'll export all filtered submissions, not just the current page
      const submissionsToExport = selectedSubmissions.length > 0
        ? filteredSubmissions.filter(sub => selectedSubmissions.includes(sub.id))
        : filteredSubmissions;
      
      // Get all unique field names across all submissions
      const allFields = new Set<string>();
      submissionsToExport.forEach(sub => {
        Object.keys(sub.data).forEach(key => allFields.add(key));
      });
      
      // Create CSV header
      const headers = ['Submission ID', 'Form', 'Date', ...Array.from(allFields)];
      let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
      
      // Add data rows
      submissionsToExport.forEach(sub => {
        const row = [
          sub.id,
          `"${getFormTitle(sub.formId).replace(/"/g, '""')}"`,
          new Date(sub.createdAt).toLocaleString(),
          ...Array.from(allFields).map(field => {
            const value = sub.data[field];
            if (value === undefined || value === null) return '';
            if (Array.isArray(value)) return `"${value.join(', ').replace(/"/g, '""')}"`;
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            return `"${String(value).replace(/"/g, '""')}"`;
          })
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `submissions_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export submissions');
    } finally {
      setExporting(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setSortConfig({ column: 'createdAt', direction: 'desc' });
    setCurrentPage(1);
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          {selectedSubmissions.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
              title="Delete selected submissions"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedSubmissions.length})
            </button>
          )}
          
          <button
            onClick={handleExport}
            disabled={exporting || filteredSubmissions.length === 0}
            className={`px-3 py-2 rounded flex items-center ${
              exporting || filteredSubmissions.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title="Export submissions to CSV"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          
          <button
            onClick={resetFilters}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
            title="Reset all filters"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="formFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Form:
              </label>
              <select
                id="formFilter"
                value={selectedForm}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="searchFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Search:
              </label>
              <input
                id="searchFilter"
                type="text"
                placeholder="Search in submissions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date:
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date:
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Bar */}
        <div className="p-3 bg-blue-50 border-b border-blue-100 flex flex-wrap justify-between items-center text-sm">
          <div className="text-blue-700">
            <span className="font-semibold">{filteredSubmissions.length}</span> 
            {filteredSubmissions.length === 1 ? ' submission' : ' submissions'} found
            {selectedForm !== 'all' && ` for "${getFormTitle(selectedForm)}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          
          {filteredSubmissions.length > 0 && (
            <div className="text-gray-600">
              Showing {indexOfFirstSubmission + 1}-{Math.min(indexOfLastSubmission, filteredSubmissions.length)} of {filteredSubmissions.length}
            </div>
          )}
        </div>
        
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
            {error}
          </div>
        )}
        
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedForm !== 'all' ? 'This form has no submissions yet.' : 'Try adjusting your filters or creating a form to collect responses.'}
            </p>
            <div className="mt-6">
              <Link 
                href="/forms"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Go to Forms
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelectAll}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('formId')}
                    >
                      <div className="flex items-center">
                        Form
                        {sortConfig.column === 'formId' && (
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                              sortConfig.direction === 'asc'
                                ? "M5 15l7-7 7 7"
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date Submitted
                        {sortConfig.column === 'createdAt' && (
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                              sortConfig.direction === 'asc'
                                ? "M5 15l7-7 7 7"
                                : "M19 9l-7 7-7-7"
                            } />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSubmissions.map(submission => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSubmissions.includes(submission.id)}
                            onChange={() => toggleSelectSubmission(submission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-800 mr-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getFormTitle(submission.formId)}
                            </div>
                            <div className="text-xs text-gray-500">Form ID: {submission.formId.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800 max-w-xs">
                          {Object.keys(submission.data).slice(0, 3).map(key => (
                            <div key={key} className="mb-1 truncate">
                              <span className="font-medium text-gray-700">{key}: </span>
                              <span>
                                {typeof submission.data[key] === 'string' 
                                  ? submission.data[key].length > 30 
                                    ? `${submission.data[key].slice(0, 30)}...` 
                                    : submission.data[key]
                                  : Array.isArray(submission.data[key]) 
                                    ? submission.data[key].join(', ').slice(0, 30) + (submission.data[key].join(', ').length > 30 ? '...' : '')
                                    : String(submission.data[key]).slice(0, 30) + (String(submission.data[key]).length > 30 ? '...' : '')}
                              </span>
                            </div>
                          ))}
                          {Object.keys(submission.data).length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{Object.keys(submission.data).length - 3} more fields
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/submissions/${submission.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstSubmission + 1}</span> to <span className="font-medium">{Math.min(indexOfLastSubmission, filteredSubmissions.length)}</span> of{' '}
                      <span className="font-medium">{filteredSubmissions.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Simple pagination for up to 5 pages
                        const pageNum = totalPages <= 5 
                          ? i + 1
                          : currentPage <= 3
                            ? i + 1
                            : currentPage >= totalPages - 2
                              ? totalPages - 4 + i
                              : currentPage - 2 + i;
                              
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                       </svg>
                     </button>
                   </nav>
                 </div>
               </div>
             </div>
           )}
         </>
       )}
     </div>
   </div>
 );
}