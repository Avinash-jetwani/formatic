"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { submissionsService } from '@/services/submissionsService';
import { formsService } from '@/services/formsService';
import { Submission, Form } from '@/types';
import { SubmissionFilterBar } from '@/components/features/submissions/SubmissionFilterBar';
import { SubmissionListView } from '@/components/features/submissions/SubmissionListView';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

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
        }),
        formsService.getAllForms(),
      ]);

      setSubmissions(submissionsResponse.data);
      setPagination({
        ...pagination,
        total: submissionsResponse.total || 0,
      });
      setForms(formsResponse.data);
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

  // Calculate filtered count
  const filteredCount = submissions.length;
  const totalCount = pagination.total;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Submissions</h1>
        
        {selectedSubmissions.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Delete Selected ({selectedSubmissions.length})
          </Button>
        )}
      </div>

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

      {loading && submissions.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedForm !== 'all' || dateRange.start || dateRange.end
              ? 'No submissions match your current filters. Try adjusting or clearing your filters.'
              : 'You don't have any submissions yet.'}
          </p>
          {searchTerm || selectedForm !== 'all' || dateRange.start || dateRange.end ? (
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <>
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
          
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} submissions
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
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
        </>
      )}
    </div>
  );
} 