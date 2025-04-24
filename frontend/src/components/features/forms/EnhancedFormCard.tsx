import React from 'react';
import { Card, CardContent } from '@/components/ui/card/Card';
import Link from 'next/link';
import {
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';

interface EnhancedFormCardProps {
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
  tags?: string[];
  onTagClick?: (tag: string) => void;
  activeTag?: string | null;
  showClientInfo?: boolean;
}

export const EnhancedFormCard: React.FC<EnhancedFormCardProps> = ({
  form,
  onDelete,
  onDuplicate,
  tags = [],
  onTagClick,
  activeTag,
  showClientInfo = false,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const formattedDate = new Date(form.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md overflow-hidden">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link 
                href={`/forms/${form.id}`} 
                className="hover:underline text-lg font-semibold text-gray-900 truncate max-w-full block"
              >
                {form.title}
              </Link>
              
              {showClientInfo && form.client && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                  {form.client.name}
                </span>
              )}
            </div>
            
            {form.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{form.description}</p>
            )}
          </div>
          
          <div className="relative flex-shrink-0">
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
                
                {form.published && (
                  <Link 
                    href={`/forms/public/${form.clientId}/${form.slug}`}
                    target="_blank"
                    className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                  >
                    <EyeIcon className="w-4 h-4 mr-2 flex-shrink-0" /> Preview
                  </Link>
                )}
                
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
        
        <div className="mt-2 flex flex-wrap items-center text-xs gap-x-4 gap-y-1 text-gray-500">
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 flex-shrink-0 ${
              form.published ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            {form.published ? 'Published' : 'Draft'}
          </div>
          
          <div className="flex items-center">
            <FileTextIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            {form._count?.fields || 0} fields
          </div>
          
          <div className="flex items-center">
            <MessageSquareIcon className="w-3 h-3 mr-1 flex-shrink-0" />
            {form._count?.submissions || 0} {form._count?.submissions === 1 ? 'response' : 'responses'}
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap mt-3 gap-1 overflow-hidden">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick && onTagClick(tag)}
                className={`text-xs px-2 py-0.5 rounded-full truncate max-w-[120px] ${
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
        
        <div className="mt-auto pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/forms/${form.id}`}
              className="w-full bg-white border border-gray-300 text-gray-800 py-1.5 px-3 rounded-md hover:bg-gray-50 text-center text-sm inline-flex items-center justify-center"
            >
              <PencilIcon className="w-3.5 h-3.5 mr-1.5" /> Edit Form
            </Link>
            
            {form.published && (
              <Link
                href={`/forms/public/${form.clientId}/${form.slug}`}
                target="_blank"
                className="w-full bg-green-50 text-green-700 py-1.5 px-3 rounded-md hover:bg-green-100 text-center text-sm inline-flex items-center justify-center"
              >
                <EyeIcon className="w-3.5 h-3.5 mr-1.5" /> Preview
              </Link>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-2 truncate">
            Last updated: {formattedDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 