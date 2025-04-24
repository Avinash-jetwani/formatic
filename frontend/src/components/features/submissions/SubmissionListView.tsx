import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox/index';
import { Button } from '@/components/ui/button/Button';
import { Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { Form, Submission } from '@/types';

interface SubmissionListViewProps {
  submissions: Submission[];
  forms: Form[];
  selectedSubmissions: string[];
  onSelectAll: (isSelected: boolean) => void;
  onSelectSubmission: (id: string, isSelected: boolean) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onDelete?: () => void;
}

export const SubmissionListView: React.FC<SubmissionListViewProps> = ({
  submissions,
  forms,
  selectedSubmissions,
  onSelectAll,
  onSelectSubmission,
  onSort,
  sortConfig,
}) => {
  const isAllSelected = submissions.length > 0 && selectedSubmissions.length === submissions.length;
  
  // Get form title by ID
  const getFormTitle = (formId: string): string => {
    const form = forms.find(f => f.id === formId);
    return form ? form.title : 'Unknown Form';
  };

  // Render the table header with sort functionality
  const renderSortableHeader = (label: string, key: string) => {
    const isActive = sortConfig.key === key;
    return (
      <div 
        className="flex items-center gap-1 cursor-pointer hover:text-gray-800"
        onClick={() => onSort(key)}
      >
        {label}
        {isActive && (
          sortConfig.direction === 'asc' 
            ? <ArrowUp className="h-4 w-4" /> 
            : <ArrowDown className="h-4 w-4" />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <Checkbox 
                  checked={isAllSelected} 
                  onCheckedChange={(checked: boolean) => onSelectAll(checked)}
                  aria-label="Select all submissions"
                />
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortableHeader('Form', 'formId')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortableHeader('Date', 'createdAt')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <Checkbox 
                    checked={selectedSubmissions.includes(submission.id)}
                    onCheckedChange={(checked: boolean) => onSelectSubmission(submission.id, checked)}
                    aria-label={`Select submission ${submission.id}`}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-800">
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getFormTitle(submission.formId)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {submission.formId.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-800 max-w-xs">
                    {Object.entries(submission.data || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="mb-1 truncate">
                        <span className="font-medium text-gray-700">{key}: </span>
                        <span>
                          {typeof value === 'string' 
                            ? value.length > 30 
                              ? `${value.slice(0, 30)}...` 
                              : value
                            : Array.isArray(value) 
                              ? value.join(', ').slice(0, 30) + (value.join(', ').length > 30 ? '...' : '')
                              : String(value).slice(0, 30) + (String(value).length > 30 ? '...' : '')}
                        </span>
                      </div>
                    ))}
                    {Object.keys(submission.data || {}).length > 3 && (
                      <div className="text-xs text-blue-600">
                        +{Object.keys(submission.data || {}).length - 3} more fields
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <Link href={`/submissions/${submission.id}`}>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 