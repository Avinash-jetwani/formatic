import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card/Card';

interface DashboardStatsCardProps {
  title: string;
  value: number;
  prevValue?: number;
  Icon: React.FC<any>;
  borderColor: string;
  textColor: string;
  isLoading?: boolean;
}

export const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  title,
  value,
  prevValue,
  Icon,
  borderColor,
  textColor,
  isLoading = false,
}) => {
  const percentChange = prevValue
    ? Math.round(((value - prevValue) / prevValue) * 100)
    : null;

  return (
    <Card className={`${borderColor} border-2 shadow-md`}>
      <CardContent className="p-6 text-center flex flex-col items-center">
        <Icon className={`w-6 h-6 mb-2 ${textColor}`} />
        <p className="text-sm text-gray-500">{title}</p>
        {isLoading ? (
          <div className="animate-pulse h-8 w-16 bg-gray-300 rounded mt-2"></div>
        ) : (
          <>
            <p className={`mt-2 text-3xl font-bold ${textColor}`}>{value}</p>
            {percentChange !== null && (
              <div
                className={`flex items-center mt-1 text-xs ${
                  percentChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {percentChange >= 0 ? (
                  <ArrowUpIcon className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3 mr-1" />
                )}
                <span>{Math.abs(percentChange)}% from previous period</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 