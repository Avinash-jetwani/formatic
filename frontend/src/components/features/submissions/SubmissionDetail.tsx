import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeftIcon, 
  TrashIcon, 
  DownloadIcon, 
  ClipboardCopyIcon,
  FileTextIcon,
  TagIcon,
  CalendarIcon,
  InfoIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  FileIcon,
  ArrowRightIcon,
  ClockIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Field {
  key: string;
  value: string | number | boolean | null;
  required: boolean;
}

interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  fieldCount: number;
  submissionCount: number;
}

interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  fields: Field[];
}

interface SubmissionDetailProps {
  submission: Submission;
  form: Form;
  onDelete: () => Promise<void>;
  onExportCsv: () => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
  submission,
  form,
  onDelete,
  onExportCsv,
  isLoading,
  error
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fields' | 'json' | 'metadata'>('fields');
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full p-6 rounded-lg border border-red-200 bg-red-50 text-red-700">
        <h3 className="text-lg font-medium mb-2">Error Loading Submission</h3>
        <p>{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 flex items-center text-red-700 hover:text-red-900"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" /> Go back
        </button>
      </div>
    );
  }
  
  if (!submission) {
    return null;
  }
  
  const submissionDate = new Date(submission.createdAt);
  const formattedDate = format(submissionDate, 'MMM dd, yyyy HH:mm:ss');
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(submission.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDelete = async () => {
    if (deleteConfirm) {
      await onDelete();
      router.back();
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };
  
  const getFieldIcon = (field: Field) => {
    switch (typeof field.value) {
      case 'string':
        return <FileTextIcon className="w-4 h-4 text-blue-500" />;
      case 'number':
        return <TagIcon className="w-4 h-4 text-purple-500" />;
      case 'boolean':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default:
        return <InfoIcon className="w-4 h-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center mb-3 sm:mb-0">
            <button 
              onClick={() => router.back()}
              className="mr-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {form?.title || 'Submission Details'}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DownloadIcon className="w-4 h-4 mr-1.5" />
              Export
            </button>
            
            <button
              onClick={handleDelete}
              className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                deleteConfirm 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                  : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
              }`}
            >
              <TrashIcon className="w-4 h-4 mr-1.5" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start">
            <CalendarIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400" />
            <div>
              <p className="text-gray-500">Submitted on</p>
              <p className="font-medium text-gray-900">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <TagIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400" />
            <div>
              <p className="text-gray-500">Submission ID</p>
              <p className="font-medium text-gray-900 break-all">{submission.id}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileTextIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400" />
            <div>
              <p className="text-gray-500">Fields submitted</p>
              <p className="font-medium text-gray-900">{submission.fields.length} fields</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FileIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-400" />
            <div>
              <p className="text-gray-500">Form</p>
              <Link 
                href={`/forms/${form.id}`} 
                className="font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                {form.title} <ExternalLinkIcon className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form info section */}
      {form && (
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Form Description</p>
              <p className="text-gray-800">{form.description || 'No description available'}</p>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Status</p>
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${form.published ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className={form.published ? 'text-green-700' : 'text-yellow-700'}>
                  {form.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-500 mb-1">Form statistics</p>
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-800">
                  <FileTextIcon className="w-3.5 h-3.5 mr-1 text-gray-500" /> 
                  {form.fieldCount} fields
                </span>
                <span className="flex items-center text-gray-800">
                  <ArrowRightIcon className="w-3.5 h-3.5 mr-1 text-gray-500" /> 
                  {form.submissionCount} submissions
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 px-4 sm:px-6">
        <div className="flex -mb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('fields')}
            className={`py-4 px-4 mr-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'fields'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Field Data
          </button>
          
          <button
            onClick={() => setActiveTab('json')}
            className={`py-4 px-4 mr-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            JSON View
          </button>
          
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'metadata'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Metadata
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'fields' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {submission.fields.map((field, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getFieldIcon(field)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate mr-2">
                        {field.key}
                      </h3>
                      {field.required && (
                        <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded p-2 break-words">
                      <p className="text-sm text-gray-700">
                        {field.value === null || field.value === '' 
                          ? <span className="text-gray-400 italic">No data</span>
                          : typeof field.value === 'boolean'
                            ? field.value.toString()
                            : String(field.value)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'json' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Raw JSON Data</h3>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ClipboardCopyIcon className="w-3.5 h-3.5 mr-1.5" />
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 text-gray-800 border border-gray-200">
              {JSON.stringify(submission.data, null, 2)}
            </pre>
          </div>
        )}
        
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Submission Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                <p className="text-sm font-mono break-all">{submission.id}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Form ID</p>
                <p className="text-sm font-mono break-all">{submission.formId}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" /> Submission Date
                </p>
                <p className="text-sm">{formattedDate}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center">
                  <ClockIcon className="w-3.5 h-3.5 mr-1" /> Timestamps
                </p>
                <div className="space-y-1">
                  <p className="text-xs">
                    <span className="text-gray-500">Created:</span>{' '}
                    <span className="text-gray-900">{format(new Date(submission.createdAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </p>
                  <p className="text-xs">
                    <span className="text-gray-500">Updated:</span>{' '}
                    <span className="text-gray-900">{format(new Date(submission.updatedAt), 'MMM dd, yyyy HH:mm:ss')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 