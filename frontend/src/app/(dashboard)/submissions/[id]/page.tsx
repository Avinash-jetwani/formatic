'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Submission Details</h1>
        </div>
        <button
          onClick={handleDelete}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md"
        >
          Delete
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Form: {form?.title || 'Unknown Form'}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Submission Date</p>
              <p>{new Date(submission.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submission ID</p>
              <p className="font-mono text-sm">{submission.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Submitted Data</h2>
          
          <div className="space-y-4">
            {Object.entries(submission.data).map(([key, value]) => (
              <div key={key} className="border-b pb-3">
                <p className="text-sm text-gray-500">{key}</p>
                <div className="font-medium">
                  {Array.isArray(value)
                    ? (value as string[]).join(', ')
                    : typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}