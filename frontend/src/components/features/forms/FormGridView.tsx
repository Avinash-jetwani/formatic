import React from 'react';
import Link from 'next/link';
import { 
  FileTextIcon, 
  EyeIcon, 
  CopyIcon, 
  TrashIcon, 
  MessageSquareIcon, 
  ExternalLinkIcon,
  EyeOffIcon
} from 'lucide-react';
import { FormQuickActionButton } from './FormQuickActionButton';

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

interface FormGridViewProps {
  forms: Form[];
  onDelete: (form: Form) => void;
  onDuplicate: (formId: string) => void;
  extractTags?: (description: string) => string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export const FormGridView: React.FC<FormGridViewProps> = ({
  forms,
  onDelete,
  onDuplicate,
  extractTags,
  onTagClick,
  activeTag,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.map((form) => (
        <div 
          key={form.id} 
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
        >
          <div className="p-4 flex flex-col h-full">
            {/* Header with title and client info */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/forms/${form.id}`} 
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1 block"
                >
                  {form.title}
                </Link>
              </div>
              
              {form.client?.name && (
                <span className="ml-2 flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {form.client.name}
                </span>
              )}
            </div>
            
            {/* Description with tags */}
            <div className="mb-3">
              {form.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {form.description.split(/#\w+/g).join(' ')}
                </p>
              )}
              
              {/* Tags */}
              {extractTags && form.description && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {extractTags(form.description).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onTagClick && onTagClick(tag)}
                      className={`inline-block px-2 py-0.5 text-xs rounded-md ${
                        activeTag === tag
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                  form.published ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className={form.published ? 'text-green-700' : 'text-yellow-700'}>
                  {form.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <div className="flex items-center">
                <FileTextIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                <span>{form._count?.fields || 0} fields</span>
              </div>
              
              <div className="flex items-center">
                <MessageSquareIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                <span>{form._count?.submissions || 0} responses</span>
              </div>
            </div>
            
            {/* Last updated */}
            <div className="text-xs text-gray-500 mb-4">
              Updated {new Date(form.updatedAt).toLocaleDateString()}
            </div>
            
            {/* Actions */}
            <div className="mt-auto">
              <Link
                href={`/forms/${form.id}`}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 text-center text-sm font-medium block mb-2 transition-colors"
              >
                Edit Form
              </Link>
              
              <div className="grid grid-cols-3 gap-2">
                <FormQuickActionButton
                  label={form.published ? "Preview" : "Edit"}
                  icon={form.published ? ExternalLinkIcon : EyeOffIcon}
                  href={form.published ? `/forms/public/${form.clientId}/${form.slug}` : `/forms/${form.id}`}
                  variant={form.published ? "success" : "warning"}
                  isExternal={form.published}
                />
                
                <FormQuickActionButton
                  label="Duplicate"
                  icon={CopyIcon}
                  onClick={() => onDuplicate(form.id)}
                  variant="info"
                />
                
                <FormQuickActionButton
                  label="Delete"
                  icon={TrashIcon}
                  onClick={() => onDelete(form)}
                  variant="danger"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 