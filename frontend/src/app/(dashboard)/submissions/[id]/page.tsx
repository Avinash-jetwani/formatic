// src/app/(dashboard)/submissions/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { submissionsService, formsService } from '@/services/api';
import { 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Download, 
  Trash2, 
  Copy, 
  Mail, 
  FileCheck, 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Printer,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/use-toast/Toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/Tabs';
import { Separator } from '@/components/ui/separator/Separator';
import { Badge } from '@/components/ui/badge/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog/Dialog';
import { Skeleton } from '@/components/ui/skeleton/Skeleton';
import { ScrollArea } from '@/components/ui/scroll-area/ScrollArea';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { toast } = useToast();
  
  const [submission, setSubmission] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'json' | 'metadata'>('data');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isNextSubmissionLoading, setIsNextSubmissionLoading] = useState(false);
  const [isPrevSubmissionLoading, setIsPrevSubmissionLoading] = useState(false);
  const [nextSubmissionId, setNextSubmissionId] = useState<string | null>(null);
  const [prevSubmissionId, setPrevSubmissionId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [siblings, setSiblings] = useState<any>(null);
  const [isLoadingSiblings, setIsLoadingSiblings] = useState(false);

  // Define loadSubmission outside of useEffect to make it available to other functions
  const loadSubmission = async (submissionId: string = id) => {
    try {
      setLoading(true);
      const response = await submissionsService.getSubmission(submissionId);
      const submissionData = response.data as any; // Type assertion
      setSubmission(submissionData);
      
      // Get form details
      const { data: formData, error: formError } = await formsService.getForm(submissionData.formId);
      if (formData && !formError) {
        setForm(formData);
      }
      
      // Get next and previous submission IDs
      try {
        const { data: siblingSubmissions } = await submissionsService.getSubmissionSiblings(
          submissionId, 
          submissionData.formId
        );
        
        if (siblingSubmissions) {
          // Type assertion to specify that next and previous are string properties
          const typedSiblings = siblingSubmissions as { next: string | null; previous: string | null };
          setNextSubmissionId(typedSiblings.next);
          setPrevSubmissionId(typedSiblings.previous);
        }
      } catch (siblingError) {
        console.error('Error loading siblings:', siblingError);
        // Don't set error state for siblings - just silently fail
      }
    } catch (err) {
      console.error('Error loading submission:', err);
      setError('Failed to load submission details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load the submission on mount
  useEffect(() => {
    loadSubmission();
  }, [id]);

  // Add this function to handle navigation between submissions
  const handleNavigation = (siblingId: string | null) => {
    if (!siblingId) return;
    
    // Navigate to the sibling submission
    router.push(`/submissions/${siblingId}`);
    
    // Reload the submission data
    loadSubmission(siblingId);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await submissionsService.deleteSubmission(id);
      toast({
        title: 'Submission Deleted',
        description: 'This submission has been permanently deleted.'
      });
      router.push('/submissions');
    } catch (err) {
      console.error('Error deleting submission:', err);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete submission. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const exportAsCsv = () => {
    if (!submission) return;
    
    setExporting(true);
    try {
      // Get all fields from the submission
      const fields = Object.keys(submission.data);
      
      // Create CSV content
      const headers = ['Field', 'Value'];
      let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
      
      // Add data rows
      fields.forEach(field => {
        const value = submission.data[field];
        const formattedValue = Array.isArray(value) 
          ? `"${value.join(', ').replace(/"/g, '""')}"` 
          : typeof value === 'string' 
            ? `"${value.replace(/"/g, '""')}"` 
            : String(value);
            
        csvContent += `"${field.replace(/"/g, '""')}"` + ',' + formattedValue + '\n';
      });
      
      // Add metadata
      csvContent += '\n"Submission ID",' + `"${submission.id}"` + '\n';
      csvContent += '"Form",' + `"${form?.title || 'Unknown'}"` + '\n';
      csvContent += '"Date",' + `"${new Date(submission.createdAt).toLocaleString()}"` + '\n';
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `submission_${submission.id.substring(0,8)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: 'Submission data exported as CSV.'
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export submission data.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const exportAsPdf = () => {
    // Prepare for print
    window.print();
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(label);
        setTimeout(() => setCopySuccess(null), 2000);
        toast({
          description: `${label} copied to clipboard`,
          duration: 2000
        });
      },
      () => {
        toast({
          description: 'Failed to copy to clipboard',
          variant: 'destructive'
        });
      }
    );
  };
  
  const getFieldColor = (key: string) => {
    // Match field with form field to check if it was required
    if (!form || !form.fields) return '';
    
    const field = form.fields.find((f: any) => f.label === key);
    if (field && field.required) {
      return 'border-l-4 border-blue-500';
    }
    return '';
  };
  
  const getFieldIcon = (key: string) => {
    // Determine icon based on field type from form
    if (!form || !form.fields) return null;
    
    const field = form.fields.find((f: any) => f.label === key);
    if (!field) return null;
    
    switch (field.type) {
      case 'TEXT':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      case 'LONG_TEXT':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
      case 'EMAIL':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'PHONE':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'URL':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'DATE':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'CHECKBOX':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card className="p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => router.push('/submissions')}
                className="mt-4"
              >
                Back to Submissions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Submission not found</h3>
          <p className="text-gray-600 mb-4">
            The submission you're looking for may have been deleted or doesn't exist.
          </p>
          <Button variant="outline" onClick={() => router.push('/submissions')}>
            Back to Submissions
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Button 
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to submissions
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!siblings?.previous}
            onClick={() => handleNavigation(siblings?.previous)}
          >
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            disabled={!siblings?.next}
            onClick={() => handleNavigation(siblings?.next)}
          >
            Next
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">
                    {form?.title || 'Submission Details'}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Submitted on {formatDate(submission.createdAt)}
                  </CardDescription>
                </div>
                
                <Badge className="self-start sm:self-auto" variant="outline">
                  ID: {submission.id.substring(0, 8)}...
                </Badge>
              </div>
            </CardHeader>
            
            <Separator />
            
            <Tabs defaultValue="data" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <div className="px-6 pt-3">
                <TabsList className="w-full sm:w-auto grid grid-cols-3">
                  <TabsTrigger value="data" className="text-sm">Form Data</TabsTrigger>
                  <TabsTrigger value="json" className="text-sm">JSON</TabsTrigger>
                  <TabsTrigger value="metadata" className="text-sm">Metadata</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="data" className="m-0 p-6 space-y-6">
                {Object.keys(submission.data || {}).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(submission.data || {}).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`bg-gray-50 rounded-lg overflow-hidden ${getFieldColor(key)}`}
                      >
                        <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <span>{getFieldIcon(key)}</span>
                            <h3 className="font-medium text-sm">{key}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(
                              Array.isArray(value) ? value.join(', ') : String(value),
                              key
                            )}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="p-4 break-words">
                          {Array.isArray(value) ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {value.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                            <a 
                              href={value} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {value}
                              <ExternalLink className="h-3 w-3 ml-1 inline-block" />
                            </a>
                          ) : (
                            <p>{String(value)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="json" className="m-0 relative">
                <ScrollArea className="h-[500px] relative">
                  <div className="absolute top-2 right-4 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full"
                      onClick={() => copyToClipboard(JSON.stringify(submission.data, null, 2), 'JSON data')}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy JSON
                    </Button>
                  </div>
                  <pre className="p-6 text-sm bg-gray-50 overflow-x-auto">
                    {JSON.stringify(submission.data, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="metadata" className="m-0 p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">Submission ID</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{submission.id}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(submission.id, 'Submission ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">Form ID</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{submission.formId}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(submission.formId, 'Form ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">Created At</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <p className="text-sm">{new Date(submission.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">IP Address</p>
                      <p className="text-sm">{submission.ipAddress || 'Not recorded'}</p>
                    </div>
                    
                    {submission.userAgent && (
                      <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">User Agent</p>
                        <p className="text-sm truncate">{submission.userAgent}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={exportAsCsv}
                disabled={exporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export as CSV'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={exportAsPdf}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print/Save as PDF
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  if (submission.data.email) {
                    window.location.href = `mailto:${submission.data.email}`;
                  } else {
                    toast({
                      description: 'No email address found in submission',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={!submission.data.email}
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Submission
              </Button>
            </CardContent>
          </Card>
          
          {form && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Form Title</p>
                  <p className="text-sm font-medium">{form.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm">{form.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Field Count</p>
                  <p className="text-sm">{form.fields?.length || 0} fields</p>
                </div>
                <Separator className="my-2" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/forms/${form.id}`)}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  View Form
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Print styles - Only applied when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container, .container * {
            visibility: visible;
          }
          button, [role="tablist"], .actions-card {
            display: none !important;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}