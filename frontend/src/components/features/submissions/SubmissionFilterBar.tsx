import React from 'react';
import { 
  Search, 
  X,
  CalendarRange
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Badge } from '@/components/ui/badge/Badge';
import { format } from 'date-fns';

interface Form {
  id: string;
  title: string;
  published: boolean;
}

interface SubmissionFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedForm: string;
  onFormChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  forms: Form[];
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const SubmissionFilterBar: React.FC<SubmissionFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedForm,
  onFormChange,
  forms,
  dateRange,
  onDateRangeChange,
  resetFilters,
  filteredCount,
  totalCount
}) => {
  // Handle direct form selection
  const handleFormSelect = (value: string) => {
    const syntheticEvent = {
      target: {
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onFormChange(syntheticEvent);
  };

  const hasActiveFilters = searchTerm || selectedForm !== 'all' || dateRange.start || dateRange.end;
  const hasDateFilter = dateRange.start || dateRange.end;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search and form filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search submissions..."
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1.5 h-6 w-6 p-0"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>

        {/* Form selector */}
        <div className="w-full sm:w-auto">
          <select 
            value={selectedForm} 
            onChange={(e) => handleFormSelect(e.target.value)}
            className="flex h-10 w-full sm:w-[220px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Forms</option>
            <optgroup label="Your Forms">
              {forms.map(form => (
                <option key={form.id} value={form.id}>
                  {form.title} {!form.published && '(Draft)'}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Date inputs - simplified approach */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex flex-col w-full">
            <label className="text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ 
                start: e.target.value, 
                end: dateRange.end
              })}
              className="h-10 px-3 py-2 rounded-md border border-gray-300 text-sm w-full"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ 
                start: dateRange.start, 
                end: e.target.value
              })}
              className="h-10 px-3 py-2 rounded-md border border-gray-300 text-sm w-full"
            />
          </div>
        </div>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          <span className="text-xs self-center">Active filters:</span>
          
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
              Search: {searchTerm.length > 15 ? searchTerm.slice(0, 15) + '...' : searchTerm}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          )}
          
          {selectedForm !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
              Form: {forms.find(f => f.id === selectedForm)?.title || 'Unknown'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFormSelect('all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          )}
          
          {hasDateFilter && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
              Date: {dateRange.start && format(new Date(dateRange.start), 'MMM d')}
              {dateRange.start && dateRange.end && " - "}
              {dateRange.end && format(new Date(dateRange.end), 'MMM d')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange({ start: '', end: '' })}
                className="h-4 w-4 p-0 ml-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex justify-between text-sm text-gray-500">
        <div>
          Showing <span className="font-medium text-gray-900">{filteredCount}</span> of <span className="font-medium text-gray-900">{totalCount}</span> submissions
        </div>
      </div>
    </div>
  );
}; 