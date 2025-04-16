// src/app/(dashboard)/forms/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formsService } from '@/services/api';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const { data, error } = await formsService.getAllForms();
        if (data && !error) {
          setForms(data);
        }
      } catch (error) {
        console.error('Error fetching forms', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleCreateForm = () => {
    router.push('/forms/create');
  };

  const handleViewForm = (id: string) => {
    router.push(`/forms/${id}`);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forms</h1>
        <button
          onClick={handleCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Create Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No forms yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first form to start collecting submissions.
          </p>
          <button
            onClick={handleCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form: any) => (
            <div
              key={form.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">{form.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {form.description || 'No description'}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      form.published ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  ></span>
                  <span>{form.published ? 'Published' : 'Draft'}</span>
                  <span className="mx-2">•</span>
                  <span>{form._count?.submissions || 0} submissions</span>
                </div>
                <button
                  onClick={() => handleViewForm(form.id)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
