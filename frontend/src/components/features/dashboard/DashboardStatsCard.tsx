import React from 'react';
import { cva } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

// Define props interface
export interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  prevValue?: number | string;
  Icon: LucideIcon;
  borderColor?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
  textColor?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'gray';
  isLoading?: boolean;
}

// Utility for border colors
const borderVariants = cva('', {
  variants: {
    borderColor: {
      blue: 'border-l-blue-500',
      green: 'border-l-green-500',
      yellow: 'border-l-yellow-500',
      purple: 'border-l-purple-500',
      red: 'border-l-red-500',
      gray: 'border-l-gray-500',
    }
  },
  defaultVariants: {
    borderColor: 'blue',
  }
});

// Utility for text colors
const textVariants = cva('', {
  variants: {
    textColor: {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      gray: 'text-gray-600',
    }
  },
  defaultVariants: {
    textColor: 'blue',
  }
});

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  title,
  value,
  prevValue,
  Icon,
  borderColor,
  textColor,
  isLoading = false,
}) => {
  // Calculate percentage change if both current and previous values are provided
  const percentChange = React.useMemo(() => {
    if (prevValue === undefined) return null;
    
    const curr = typeof value === 'string' ? parseFloat(value) : value;
    const prev = typeof prevValue === 'string' ? parseFloat(prevValue) : prevValue;
    
    if (prev === 0) return null; // Avoid division by zero
    
    return ((curr - prev) / prev) * 100;
  }, [value, prevValue]);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow p-4 ${borderVariants({ borderColor })} overflow-hidden`}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ) :
        <>
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <div className={`p-2 rounded-full flex-shrink-0 ${textVariants({ textColor }).replace('text-', 'bg-').replace('-600', '-100')}`}>
              <Icon className={`h-5 w-5 ${textVariants({ textColor })}`} />
            </div>
          </div>
          
          <div className="mt-2 min-w-0">
            <span className={`text-2xl font-bold ${textVariants({ textColor })} break-words`}>
              {value}
            </span>
            
            {percentChange !== null && (
              <div className="flex flex-wrap items-center mt-1 text-xs gap-1">
                {percentChange > 0 ? (
                  <span className="flex items-center text-green-600">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +{percentChange.toFixed(1)}%
                  </span>
                ) : percentChange < 0 ? (
                  <span className="flex items-center text-red-600">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                    </svg>
                    {percentChange.toFixed(1)}%
                  </span>
                ) : (
                  <span className="flex items-center text-gray-600">
                    0% change
                  </span>
                )}
                <span className="text-gray-500">vs. previous</span>
              </div>
            )}
          </div>
        </>
      }
    </div>
  );
};

export default DashboardStatsCard; 