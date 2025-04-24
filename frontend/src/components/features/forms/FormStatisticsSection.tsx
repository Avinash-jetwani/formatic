import React from 'react';
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  FileQuestionIcon, 
  BarChart4Icon
} from 'lucide-react';
import DashboardStatsCard from '@/components/features/dashboard/DashboardStatsCard';

interface FormStatisticsSectionProps {
  totalForms: number;
  publishedForms: number;
  totalSubmissions: number;
  isLoading?: boolean;
  prevPeriodData?: {
    totalForms?: number;
    publishedForms?: number;
    totalSubmissions?: number;
  };
  className?: string;
}

export const FormStatisticsSection: React.FC<FormStatisticsSectionProps> = ({
  totalForms,
  publishedForms,
  totalSubmissions,
  isLoading = false,
  prevPeriodData,
  className = '',
}) => {
  const draftForms = totalForms - publishedForms;
  const prevDraftForms = prevPeriodData 
    ? (prevPeriodData.totalForms || 0) - (prevPeriodData.publishedForms || 0) 
    : undefined;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <DashboardStatsCard
        title="Total Forms"
        value={totalForms}
        prevValue={prevPeriodData?.totalForms}
        Icon={FileTextIcon}
        borderColor="blue"
        textColor="blue"
        isLoading={isLoading}
      />
      
      <DashboardStatsCard
        title="Published Forms"
        value={publishedForms}
        prevValue={prevPeriodData?.publishedForms}
        Icon={CheckCircleIcon}
        borderColor="green"
        textColor="green"
        isLoading={isLoading}
      />
      
      <DashboardStatsCard
        title="Draft Forms"
        value={draftForms}
        prevValue={prevDraftForms}
        Icon={FileQuestionIcon}
        borderColor="yellow"
        textColor="yellow"
        isLoading={isLoading}
      />
      
      <DashboardStatsCard
        title="Total Submissions"
        value={totalSubmissions}
        prevValue={prevPeriodData?.totalSubmissions}
        Icon={BarChart4Icon}
        borderColor="purple"
        textColor="purple"
        isLoading={isLoading}
      />
    </div>
  );
}; 