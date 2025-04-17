// src/app/(dashboard)/submissions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submissionsService, formsService } from '@/services/api';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedForm(e.target.value);
  };

  const filteredSubmissions = selectedForm === 'all'
    ? submissions
    : submissions.filter(submission => submission.formId === selectedForm);

  const getFormTitle = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    return form ? form.title : 'Unknown Form';
  };

  const handleViewSubmission = (id: string) => {
    router.push(`/submissions/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Form Submissions</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">All Submissions</h2>
            
            <div className="flex items-center">
              <label htmlFor="formFilter" className="mr-2 text-sm text-gray-600">
                Filter by Form:
              </label>
              <select
                id="formFilter"
                value={selectedForm}
                onChange={handleFormChange}
                className="border border-gray-300 rounded-md px-3 py-1"
              >
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No submissions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map(submission => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getFormTitle(submission.formId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(submission.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {Object.keys(submission.data).slice(0, 3).map(key => (
                            <span key={key} className="inline-block mr-2">
                              <span className="font-medium">{key}:</span> {typeof submission.data[key] === 'string' ? submission.data[key].slice(0, 15) : Array.isArray(submission.data[key]) ? submission.data[key].join(', ').slice(0, 15) : String(submission.data[key]).slice(0, 15)}
                              {(typeof submission.data[key] === 'string' && submission.data[key].length > 15) ||
                               (Array.isArray(submission.data[key]) && submission.data[key].join(', ').length > 15) ? '...' : ''}
                            </span>
                          ))}
                          {Object.keys(submission.data).length > 3 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewSubmission(submission.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}