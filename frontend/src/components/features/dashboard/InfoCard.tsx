import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/Card';

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  textColor?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  subtitle,
  textColor = 'text-blue-600'
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <p className={`text-5xl font-bold ${textColor}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-2">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}; 