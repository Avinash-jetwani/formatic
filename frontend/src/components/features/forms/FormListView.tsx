import React from 'react';
import Link from 'next/link';
import {
  EditIcon,
  EyeIcon,
  CopyIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  MessageSquareIcon,
  AlignLeftIcon,
  HashIcon,
  Pencil
} from 'lucide-react';

// Define interface for form type
interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  slug: string;
  client?: {
    id: string;
    name: string;
  };
  _count?: {
    submissions: number;
    fields: number;
  };
}

// Props for FormListView component
interface FormListViewProps {
  forms: Form[];
  onDelete: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  extractTags: (description: string) => string[];
  onTagClick: (tag: string) => void;
  activeTag: string | null;
  onSortChange: (by: 'title' | 'date' | 'submissions') => void;
  sortBy: 'title' | 'date' | 'submissions';
  sortOrder: 'asc' | 'desc';
  showClientInfo?: boolean;
}

export const FormListView: React.FC<FormListViewProps> = ({
  forms,
  onDelete,
  onDuplicate,
  extractTags,
  onTagClick,
  activeTag,
  onSortChange,
  sortBy,
  sortOrder,
  showClientInfo = false
}) => {
  // Helper to get sort indicator
  const getSortIndicator = (column: 'title' | 'date' | 'submissions') => {
    if (sortBy !== column) return null;
    
    return (
      <span className="inline-flex ml-1 text-blue-600">
        {sortOrder === 'asc' 
          ? <ArrowUpIcon className="w-4 h-4" /> 
          : <ArrowDownIcon className="w-4 h-4" />}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('title')}
              >
                <div className="flex items-center">
                  <AlignLeftIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Form Name {getSortIndicator('title')}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('date')}
              >
                <div className="flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Date {getSortIndicator('date')}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <HashIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Fields
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSortChange('submissions')}
              >
                <div className="flex items-center">
                  <MessageSquareIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  Responses {getSortIndicator('submissions')}
                </div>
              </th>
              {showClientInfo && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
              )}
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.map((form) => {
              const tags = extractTags(form.description || '');
              
              return (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{form.title}</div>
                        {form.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {form.description}
                          </div>
                        )}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => onTagClick(tag)}
                                className={`inline-flex text-xs px-1.5 py-0.5 rounded-full ${
                                  activeTag === tag
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      form.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {form._count?.fields || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {form._count?.submissions || 0}
                  </td>
                  {showClientInfo && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {form.client?.name || 'Unknown'}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/forms/${form.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label={`Edit form ${form.title}`}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Link>
                      
                      {form.published && (
                        <Link
                          href={`/forms/public/${form.clientId}/${form.slug}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900"
                          aria-label={`Preview form ${form.title}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      )}
                      
                      <button
                        onClick={() => onDuplicate(form.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        aria-label={`Duplicate form ${form.title}`}
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onDelete(form)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete form ${form.title}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 