import React from 'react';
import { FormCard } from './FormCard';
import { Grid3x3Icon, ListIcon } from 'lucide-react';

// Internal NoDataDisplay component
const NoDataDisplay = ({ 
  message, 
  description 
}: { 
  message: string; 
  description?: string 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 text-gray-300 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H7.5a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
};

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

interface FormListProps {
  forms: Form[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onDelete: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  extractTags: (description: string) => string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export const FormList: React.FC<FormListProps> = ({
  forms,
  loading,
  viewMode,
  onViewModeChange,
  onDelete,
  onDuplicate,
  extractTags,
  onTagClick,
  activeTag,
}) => {
  if (loading && forms.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-12 w-12 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <NoDataDisplay 
        message="No forms found" 
        description="Try adjusting your filters or create a new form to get started"
      />
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <div className="inline-flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
            aria-label="Grid view"
          >
            <Grid3x3Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
            aria-label="List view"
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              extractTags={extractTags}
              onTagClick={onTagClick}
              activeTag={activeTag}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 overflow-x-auto">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a href={`/forms/${form.id}`} className="hover:underline">
                    <h3 className="font-semibold truncate">{form.title}</h3>
                  </a>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                    <span className="flex items-center text-gray-500">
                      <span className="font-medium">{form._count?.fields || 0}</span> fields
                    </span>
                    
                    <span className="flex items-center text-gray-500">
                      <span className="font-medium">{form._count?.submissions || 0}</span> responses
                    </span>
                    
                    {form.published ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                    
                    <span className="text-gray-400 text-xs">
                      Updated {new Date(form.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {extractTags(form.description || '').length > 0 && (
                    <div className="flex flex-wrap mt-2 gap-1">
                      {extractTags(form.description || '').map((tag) => (
                        <button
                          key={tag}
                          onClick={() => onTagClick && onTagClick(tag)}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            activeTag === tag
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex md:flex-nowrap items-center self-end md:self-center gap-2 mt-2 md:mt-0">
                  <a 
                    href={`/forms/${form.id}/edit`}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    aria-label="Edit form details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </a>
                  
                  <button 
                    onClick={() => onDuplicate(form.id)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    aria-label="Duplicate form"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => onDelete(form)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    aria-label="Delete form"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 