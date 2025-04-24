import React from 'react';
import { Button } from '@/components/ui/button/Button';
import { FilterIcon, SearchIcon, SortAscIcon, SortDescIcon } from 'lucide-react';

interface SearchFilterBarProps {
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
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
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
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Search bar */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search forms..."
            className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filter dropdown */}
        <div className="inline-flex items-center">
          <div className="flex items-center space-x-1 bg-white border rounded-md shadow-sm">
            <label htmlFor="filter" className="flex items-center px-3">
              <FilterIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700 mr-2 hidden sm:inline">Filter:</span>
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as any)}
              className="py-2 px-2 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
            >
              <option value="all">All forms</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort buttons */}
        <div className="flex items-center mr-2 text-sm text-gray-600">
          <span className="mr-2 hidden sm:inline">Sort by:</span>
          <div className="flex border rounded-md shadow-sm">
            <button
              onClick={() => onSortChange('title')}
              className={`px-3 py-1.5 text-sm flex items-center ${
                sortBy === 'title' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'
              }`}
            >
              Title
              {sortBy === 'title' && (
                sortOrder === 'asc' 
                  ? <SortAscIcon className="h-3.5 w-3.5 ml-1" /> 
                  : <SortDescIcon className="h-3.5 w-3.5 ml-1" />
              )}
            </button>
            <button
              onClick={() => onSortChange('date')}
              className={`px-3 py-1.5 text-sm flex items-center border-l ${
                sortBy === 'date' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'
              }`}
            >
              Date
              {sortBy === 'date' && (
                sortOrder === 'asc' 
                  ? <SortAscIcon className="h-3.5 w-3.5 ml-1" /> 
                  : <SortDescIcon className="h-3.5 w-3.5 ml-1" />
              )}
            </button>
            <button
              onClick={() => onSortChange('submissions')}
              className={`px-3 py-1.5 text-sm flex items-center border-l ${
                sortBy === 'submissions' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'
              }`}
            >
              Responses
              {sortBy === 'submissions' && (
                sortOrder === 'asc' 
                  ? <SortAscIcon className="h-3.5 w-3.5 ml-1" /> 
                  : <SortDescIcon className="h-3.5 w-3.5 ml-1" />
              )}
            </button>
          </div>
        </div>
        
        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mr-auto">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`text-xs px-2 py-1 rounded-full ${
                  activeTag === tag
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => onTagClick(activeTag)}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 