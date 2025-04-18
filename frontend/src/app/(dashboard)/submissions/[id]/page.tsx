// src/app/(dashboard)/submissions/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submissionsService, formsService } from '@/services/api';

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params with React.use if available
  const unwrappedParams = typeof React.use === 'function' 
    ? React.use(params) 
    : params;
  
  const id = unwrappedParams.id;
  
  const [submission, setSubmission] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'json' | 'info'>('data');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: submissionData, error: submissionError } = await submissionsService.getSubmission(id);
        
        if (submissionData && !submissionError) {
          setSubmission(submissionData);
          
          // Get form details
          const { data: formData, error: formError } = await formsService.getForm(submissionData.formId);
          if (formData && !formError) {
            setForm(formData);
          }
        } else {
          setError(submissionError || 'Failed to fetch submission');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      try {
        const { error } = await submissionsService.deleteSubmission(id);
        
        if (!error) {
          router.push('/submissions');
        } else {
          setError(error || 'Failed to delete submission');
        }
      } catch (err) {
        setError('An error occurred');
      }
    }
  };

  const exportAsCsv = () => {
    if (!submission) return;
    
    setExporting(true);
    try {
      // Get all fields from the submission
      const fields = Object.keys(submission.data);
      
      // Create CSV content
      const headers = ['Field', 'Value'];
      let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
      
      // Add data rows
      fields.forEach(field => {
        const value = submission.data[field];
        const formattedValue = Array.isArray(value) 
          ? `"${value.join(', ').replace(/"/g, '""')}"` 
          : typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : String(value);
            
        csvContent += `"${field.replace(/"/g, '""')}"` + ',' + formattedValue + '\n';
      });
      
      // Add metadata
      csvContent += '\n"Submission ID",' + `"${submission.id}"` + '\n';
      csvContent += '"Form",' + `"${form?.title || 'Unknown'}"` + '\n';
      csvContent += '"Date",' + `"${new Date(submission.createdAt).toLocaleString()}"` + '\n';
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `submission_${submission.id.substring(0,8)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export submission');
    } finally {
      setExporting(false);
    }
  };
  
  const getFieldColor = (key: string) => {
    // Match field with form field to check if it was required
    if (!form || !form.fields) return '';
    
    const field = form.fields.find((f: any) => f.label === key);
    if (field && field.required) {
      return 'border-l-4 border-blue-500';
    }
    return '';
  };
  
  const getFieldIcon = (key: string) => {
    // Determine icon based on field type from form
    if (!form || !form.fields) return null;
    
    const field = form.fields.find((f: any) => f.label === key);
    if (!field) return null;
    
    switch (field.type) {
      case 'TEXT':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'LONG_TEXT':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
      case 'EMAIL':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'PHONE':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'URL':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'DATE':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'CHECKBOX':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error || 'Submission not found'}</p>
        <button
          onClick={() => router.push('/submissions')}
          className="mt-2 text-sm text-red-700 underline"
        >
          Back to Submissions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold">Submission Details</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={exportAsCsv}
            disabled={exporting}
            className={`px-3 py-2 rounded flex items-center ${
              exporting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left column - Overview */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Form</h3>
                <Link 
                  href={`/forms/${form?.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {form?.title || 'Unknown Form'}
                </Link>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                <p className="text-gray-800">{new Date(submission.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Submission ID</h3>
                <p className="font-mono text-xs text-gray-600 break-all">{submission.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fields Submitted</h3>
                <p className="text-gray-800">{Object.keys(submission.data).length}</p>
              </div>
            </div>
          </div>
          
          {form && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Form Information</h2>
              </div>
              
              <div className="p-5">
                <Link 
                  href={`/forms/${form.id}`}
                  className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded mb-4 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Form
                </Link>
                
                <div className="text-sm">
                  <p className="text-gray-600 mb-2">
                    {form.description || 'No description available'}
                  </p>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Form Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${form.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {form.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Number of Fields:</span>
                      <span>{form.fields ? form.fields.length : 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Submissions:</span>
                      <span>{form.submissionCount || '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Data */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'data'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Field Data
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'json'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                JSON View
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Metadata
              </button>
            </div>
            
            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'data' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Submitted Form Data</h2>
                  
                  <div className="grid grid-cols-1 gap-5">
                    {Object.entries(submission.data).map(([key, value]) => (
                      <div key={key} className={`bg-white border rounded-md overflow-hidden ${getFieldColor(key)}`}>
                        <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b">
                          <div className="flex items-center">
                            {getFieldIcon(key) && (
                              <span className="mr-2">{getFieldIcon(key)}</span>
                            )}
                            <h3 className="text-sm font-medium text-gray-700">{key}</h3>
                          </div>
                          {form?.fields?.find((f: any) => f.label === key)?.required && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-3">
                          {Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.length > 0 ? value.map((item, i) => (
                                <li key={i} className="text-gray-800">{item}</li>
                              )) : <span className="text-gray-500 italic">No items selected</span>}
                            </ul>
                          ) : (
                            <p className={`${value ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                              {value || 'No response provided'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'json' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">JSON Data</h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(submission.data, null, 2));
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy JSON
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[600px]">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(submission.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Submission Metadata</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Submission ID</h3>
                        <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{submission.id}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Form ID</h3>
                        <p className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{submission.formId}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Submission Date</h3>
                        <p className="text-gray-800">{new Date(submission.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Created At (ISO)</h3>
                        <p className="font-mono text-xs bg-gray-50 p-2 rounded">{submission.createdAt}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Updated At (ISO)</h3>
                        <p className="font-mono text-xs bg-gray-50 p-2 rounded">{submission.updatedAt || 'Not updated'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Fields Submitted</h3>
                        <p className="text-gray-800">{Object.keys(submission.data).length} fields</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}