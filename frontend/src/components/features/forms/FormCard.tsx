import React from 'react';
import { Card, CardContent } from '@/components/ui/card/Card';
import Link from 'next/link';
import {
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';

interface FormCardProps {
  form: {
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
  };
  onDelete: (form: any) => void;
  onDuplicate: (formId: string) => void;
  extractTags?: (description: string) => string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
}

export const FormCard: React.FC<FormCardProps> = ({
  form,
  onDelete,
  onDuplicate,
  extractTags,
  onTagClick,
  activeTag,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const formattedDate = new Date(form.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const tags = extractTags ? extractTags(form.description || '') : [];

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md overflow-hidden">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link href={`/forms/${form.id}`} className="hover:underline">
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{form.title}</h3>
            </Link>
            
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2 gap-y-1 gap-x-3">
              <span className="flex items-center">
                <FileTextIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                {form._count?.fields || 0} fields
              </span>
              
              <span>
                {form.published ? (
                  <span className="flex items-center text-green-600">
                    <EyeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    Published
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500">
                    <EyeOffIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    Draft
                  </span>
                )}
              </span>

              {form._count?.submissions !== undefined && (
                <span className="text-sm text-gray-500">
                  {form._count.submissions} {form._count.submissions === 1 ? 'response' : 'responses'}
                </span>
              )}
            </div>
          </div>
          
          <div className="relative ml-2 flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Form actions"
            >
              <MoreHorizontalIcon className="w-5 h-5 text-gray-500" />
            </button>
            
            {showActions && (
              <div 
                className="absolute right-0 top-8 bg-white shadow-lg rounded-md w-48 py-1 z-10 border border-gray-200"
                onMouseLeave={() => setShowActions(false)}
              >
                <Link 
                  href={`/forms/${form.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <EyeIcon className="w-4 h-4 mr-2 flex-shrink-0" /> View & Edit
                </Link>
                
                <Link 
                  href={`/forms/${form.id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <PencilIcon className="w-4 h-4 mr-2 flex-shrink-0" /> Edit Details
                </Link>
                
                <button 
                  onClick={() => onDuplicate(form.id)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <ClipboardIcon className="w-4 h-4 mr-2 flex-shrink-0" /> Duplicate
                </button>
                
                <button 
                  onClick={() => onDelete(form)}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <TrashIcon className="w-4 h-4 mr-2 flex-shrink-0" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {form.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{form.description}</p>
        )}
        
        {tags.length > 0 && (
          <div className="flex flex-wrap mt-1 mb-2 gap-1">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick && onTagClick(tag)}
                className={`text-xs px-2 py-1 rounded-full ${
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
        
        <div className="mt-auto pt-3 flex justify-between items-center text-xs text-gray-500">
          <span className="truncate">Last updated: {formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}; 