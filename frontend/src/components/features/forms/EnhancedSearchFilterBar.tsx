import React, { useState } from 'react';
import { 
  SearchIcon, 
  FilterIcon, 
  SlidersIcon, 
  XIcon,
  TagIcon,
  CalendarIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ListFilterIcon,
  AlignLeftIcon,
  MessageSquareIcon
} from 'lucide-react';
import { cva } from 'class-variance-authority';

const filterButtonVariants = cva(
  "flex items-center px-3 py-1.5 text-sm border rounded-md transition-colors",
  {
    variants: {
      active: {
        true: "bg-blue-50 text-blue-700 border-blue-200",
        false: "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

const sortButtonVariants = cva(
  "flex items-center justify-between px-3 py-2 text-sm border rounded-md transition-colors gap-2",
  {
    variants: {
      active: {
        true: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
        false: "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

const tagVariants = cva(
  "inline-flex items-center px-2 py-1 text-xs rounded-full transition-colors",
  {
    variants: {
      active: {
        true: "bg-blue-100 text-blue-700",
        false: "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

interface EnhancedSearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: 'all' | 'published' | 'draft';
  onFilterChange: (filter: 'all' | 'published' | 'draft') => void;
  sortBy: 'title' | 'date' | 'submissions';
  sortOrder: 'asc' | 'desc';
  onSortChange: (by: 'title' | 'date' | 'submissions') => void;
  tags: string[];
  activeTag: string | null;
  onTagClick: (tag: string) => void;
  formCount?: number;
}

export const EnhancedSearchFilterBar: React.FC<EnhancedSearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  tags,
  activeTag,
  onTagClick,
  formCount
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const hasActiveFilters = searchTerm || filter !== 'all' || activeTag;
  const visibleTags = showAllTags ? tags : tags.slice(0, 5);

  return (
    <div className="mb-6 space-y-4 bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search forms by name or description..."
            className="pl-10 pr-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={filterButtonVariants({ active: filter === 'all' })}
          >
            All Forms
            {formCount !== undefined && <span className="ml-1 text-xs opacity-70">({formCount})</span>}
          </button>
          
          <button
            onClick={() => onFilterChange('published')}
            className={filterButtonVariants({ active: filter === 'published' })}
          >
            <CheckIcon className={`w-3.5 h-3.5 mr-1 ${filter === 'published' ? 'text-blue-500' : 'text-gray-400'}`} />
            Published
          </button>
          
          <button
            onClick={() => onFilterChange('draft')}
            className={filterButtonVariants({ active: filter === 'draft' })}
          >
            <span className={`inline-block w-3.5 h-3.5 mr-1 rounded-full ${filter === 'draft' ? 'bg-blue-500' : 'bg-gray-400'}`} />
            Drafts
          </button>
          
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={filterButtonVariants({ 
              active: showAdvancedFilters || sortBy !== 'date' || sortOrder !== 'desc' 
            })}
          >
            <SlidersIcon className="w-3.5 h-3.5 mr-1" />
            Sort & Filter
            {(showAdvancedFilters || sortBy !== 'date' || sortOrder !== 'desc') && (
              <span className="ml-1 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
                if (activeTag) onTagClick(activeTag);
              }}
              className="flex items-center px-3 py-1.5 text-sm border border-red-300 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <XIcon className="w-3.5 h-3.5 mr-1" />
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Advanced filters section */}
      {showAdvancedFilters && (
        <div className="pt-4 mt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sort options */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <ListFilterIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                Sort Results
              </h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => onSortChange('title')}
                  className={sortButtonVariants({ active: sortBy === 'title' })}
                  aria-label={`Sort by name ${sortBy === 'title' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                >
                  <div className="flex items-center">
                    <AlignLeftIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Form Name</span>
                  </div>
                  {sortBy === 'title' && (
                    sortOrder === 'asc' 
                      ? <ArrowUpIcon className="w-4 h-4 text-blue-600" /> 
                      : <ArrowDownIcon className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                
                <button
                  onClick={() => onSortChange('date')}
                  className={sortButtonVariants({ active: sortBy === 'date' })}
                  aria-label={`Sort by date ${sortBy === 'date' ? (sortOrder === 'asc' ? 'oldest first' : 'newest first') : ''}`}
                >
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Creation Date</span>
                  </div>
                  {sortBy === 'date' && (
                    sortOrder === 'asc' 
                      ? <ArrowUpIcon className="w-4 h-4 text-blue-600" /> 
                      : <ArrowDownIcon className="w-4 h-4 text-blue-600" />
                  )}
                </button>
                
                <button
                  onClick={() => onSortChange('submissions')}
                  className={sortButtonVariants({ active: sortBy === 'submissions' })}
                  aria-label={`Sort by submissions ${sortBy === 'submissions' ? (sortOrder === 'asc' ? 'lowest first' : 'highest first') : ''}`}
                >
                  <div className="flex items-center">
                    <MessageSquareIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Response Count</span>
                  </div>
                  {sortBy === 'submissions' && (
                    sortOrder === 'asc' 
                      ? <ArrowUpIcon className="w-4 h-4 text-blue-600" /> 
                      : <ArrowDownIcon className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              </div>
              {sortBy && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {sortBy === 'title' && (sortOrder === 'asc' ? 'Alphabetical (A-Z)' : 'Alphabetical (Z-A)')}
                  {sortBy === 'date' && (sortOrder === 'asc' ? 'Oldest first' : 'Newest first')}
                  {sortBy === 'submissions' && (sortOrder === 'asc' ? 'Least responses first' : 'Most responses first')}
                </p>
              )}
            </div>
            
            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <TagIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                  Filter by Tag
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {visibleTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => onTagClick(tag)}
                      className={tagVariants({ active: activeTag === tag })}
                    >
                      #{tag}
                    </button>
                  ))}
                  {tags.length > 5 && (
                    <button
                      onClick={() => setShowAllTags(!showAllTags)}
                      className="text-xs text-blue-600 hover:text-blue-800 ml-1"
                    >
                      {showAllTags ? 'Show Less' : `+${tags.length - 5} More Tags`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 