import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon, TrendingUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card/Card';

interface DashboardAlertProps {
  message: string;
  type?: 'info' | 'warning' | 'success';
}

export const DashboardAlert: React.FC<DashboardAlertProps> = ({
  message,
  type = 'info',
}) => {
  const bgColor =
    type === 'warning'
      ? 'bg-yellow-100'
      : type === 'success'
      ? 'bg-green-100'
      : 'bg-blue-100';
  
  const textColor =
    type === 'warning'
      ? 'text-yellow-800'
      : type === 'success'
      ? 'text-green-800'
      : 'text-blue-800';
  
  const Icon =
    type === 'warning'
      ? AlertTriangleIcon
      : type === 'success'
      ? CheckCircleIcon
      : TrendingUpIcon;

  return (
    <Card className={`${bgColor} border-0 shadow-sm`}>
      <CardContent className={`${textColor} p-4 flex items-start`}>
        <Icon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>{message}</div>
      </CardContent>
    </Card>
  );
}; 