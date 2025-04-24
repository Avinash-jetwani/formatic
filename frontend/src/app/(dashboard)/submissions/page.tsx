"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { submissionsService, formsService } from '@/services/api';
import { Submission, Form } from '@/types';
import { SubmissionFilterBar } from '@/components/features/submissions/SubmissionFilterBar';
import { SubmissionListView } from '@/components/features/submissions/SubmissionListView';
import { AlertCircle, Loader2, Download, Filter, RefreshCw, List, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/use-toast/Toast';
import { Card } from '@/components/ui/card/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/Tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu/DropdownMenu';
import { Badge } from '@/components/ui/badge/Badge';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';

export default function SubmissionsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [selectedForm, setSelectedForm] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch submissions and forms
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [submissionsResponse, formsResponse] = await Promise.all([
        submissionsService.getAllSubmissions({
          formId: selectedForm !== 'all' ? selectedForm : undefined,
          search: searchTerm || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
          page: pagination.page,
          limit: pagination.limit,
        } as any),
        formsService.getAllForms(),
      ]);

      setSubmissions(submissionsResponse.data as Submission[]);
      setPagination({
        ...pagination,
        total: (submissionsResponse as any).total || 0,
      });
      setForms(formsResponse.data as Form[]);
    } catch (err) {
      console.error('Error fetching submissions data:', err);
      setError('Failed to load submissions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedForm, searchTerm, dateRange, sortConfig, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form filter change
  const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedForm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 1 });
  };

  // Handle date range filter change
  const handleDateRangeChange = (range: { start: string; end: string }) => {
    setDateRange(range);
    setPagination({ ...pagination, page: 1 });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedForm('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setPagination({ ...pagination, page: 1 });
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key
          ? sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc',
    });
  };

  // Handle bulk selection
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedSubmissions(submissions.map((s) => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSubmission = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSubmissions([...selectedSubmissions, id]);
    } else {
      setSelectedSubmissions(selectedSubmissions.filter((s) => s !== id));
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (!selectedSubmissions.length) return;

    if (!confirm(`Are you sure you want to delete ${selectedSubmissions.length} submission(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        selectedSubmissions.map((id) => submissionsService.deleteSubmission(id))
      );
      toast({
        title: 'Submissions Deleted',
        description: `Successfully deleted ${selectedSubmissions.length} submission(s).`,
      });
      setSelectedSubmissions([]);
      fetchData();
    } catch (err) {
      console.error('Error deleting submissions:', err);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete submissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export selected submissions as CSV
  const handleExportCSV = async () => {
    if (!selectedSubmissions.length) {
      toast({
        title: 'No Submissions Selected',
        description: 'Please select at least one submission to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      // Get selected submissions data
      const selectedData = submissions.filter(sub => selectedSubmissions.includes(sub.id));
      
      // Create CSV headers based on all potential fields
      let allFields = new Set<string>();
      selectedData.forEach(sub => {
        Object.keys(sub.data || {}).forEach(key => allFields.add(key));
      });
      
      const headers = ['ID', 'Form Name', 'Submitted At', ...Array.from(allFields)];
      let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
      
      // Add data rows
      selectedData.forEach(sub => {
        const formName = forms.find(f => f.id === sub.formId)?.title || 'Unknown';
        const row = [
          sub.id,
          `"${formName.replace(/"/g, '""')}"`,
          new Date(sub.createdAt).toLocaleString()
        ];
        
        // Add all field values (or empty string if field doesn't exist for this submission)
        Array.from(allFields).forEach(field => {
          const value = sub.data?.[field];
          const formattedValue = value === undefined ? '' : 
            Array.isArray(value) ? `"${value.join(', ').replace(/"/g, '""')}"` :
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` :
            String(value);
          row.push(formattedValue);
        });
        
        csvContent += row.join(',') + '\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `submissions_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${selectedSubmissions.length} submission(s).`,
      });
    } catch (err) {
      console.error('Error exporting submissions:', err);
      toast({
        title: 'Export Failed',
        description: 'Failed to export submissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate filtered count
  const filteredCount = submissions.length;
  const totalCount = pagination.total;
  
  // Get active filter count
  const activeFilterCount = [
    selectedForm !== 'all',
    !!searchTerm,
    !!dateRange.start,
    !!dateRange.end
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto py-4 px-3 sm:px-6 lg:px-8 max-w-7xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount > 0 ? `${totalCount} submissions collected across all your forms` : 'No submissions yet'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <div className="hidden sm:flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-r-none h-9"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none h-9"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={selectedSubmissions.length === 0}
                className="flex items-center gap-1"
              >
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {selectedSubmissions.length} selected
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleBulkDelete}
                className="text-red-600 focus:text-red-600"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-4">
        <Card className="p-4">
          <SubmissionFilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedForm={selectedForm}
            onFormChange={handleFormChange}
            forms={forms}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            resetFilters={resetFilters}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        </Card>
      </div>

      {loading && submissions.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedForm !== 'all' || dateRange.start || dateRange.end
              ? 'No submissions match your current filters. Try adjusting or clearing your filters.'
              : 'You haven\'t received any submissions yet.'}
          </p>
          {searchTerm || selectedForm !== 'all' || dateRange.start || dateRange.end ? (
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          ) : null}
        </Card>
      ) : (
        <Tabs defaultValue="list" value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'grid')}>
          <TabsList className="hidden">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="m-0">
            <SubmissionListView
              submissions={submissions}
              forms={forms}
              selectedSubmissions={selectedSubmissions}
              onSelectAll={handleSelectAll}
              onSelectSubmission={handleSelectSubmission}
              onSort={handleSort}
              sortConfig={sortConfig}
              onDelete={handleBulkDelete}
            />
          </TabsContent>
          
          <TabsContent value="grid" className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((submission) => {
                const form = forms.find((f) => f.id === submission.formId);
                const isSelected = selectedSubmissions.includes(submission.id);
                
                return (
                  <Card 
                    key={submission.id}
                    className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                  >
                    <div className="p-4 border-b relative">
                      <div className="absolute right-2 top-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectSubmission(submission.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <h3 className="font-medium text-sm truncate pr-6">
                        Form: {form?.title || 'Unknown'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div 
                      className="p-4"
                      onClick={() => window.location.href = `/submissions/${submission.id}`}
                    >
                      <div className="space-y-2">
                        {Object.entries(submission.data || {}).slice(0, 3).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs font-medium text-gray-500">{key}</p>
                            <p className="text-sm truncate">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </p>
                          </div>
                        ))}
                        {Object.keys(submission.data || {}).length > 3 && (
                          <p className="text-xs text-gray-400 italic">
                            +{Object.keys(submission.data || {}).length - 3} more fields
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} submissions
          </p>
          <div className="flex space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, Math.ceil(pagination.total / pagination.limit)))].map((_, i) => {
                const pageNum = i + 1;
                // Display only current page and surrounding pages
                if (
                  pageNum === 1 ||
                  pageNum === Math.ceil(pagination.total / pagination.limit) ||
                  Math.abs(pageNum - pagination.page) <= 1
                ) {
                  return (
                    <Button
                      key={i}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  (pageNum === 2 && pagination.page > 3) ||
                  (pageNum === Math.ceil(pagination.total / pagination.limit) - 1 && 
                   pagination.page < Math.ceil(pagination.total / pagination.limit) - 2)
                ) {
                  return <span key={i} className="px-1">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page * pagination.limit >= pagination.total || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 