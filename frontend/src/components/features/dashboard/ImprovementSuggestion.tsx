import React from 'react';
import { AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

interface ImprovementSuggestionProps {
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'error';
}

export const ImprovementSuggestion: React.FC<ImprovementSuggestionProps> = ({
  title,
  description,
  type,
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          title: 'text-yellow-800',
          description: 'text-yellow-700',
          icon: <AlertTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0" />,
        };
      case 'info':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          title: 'text-blue-800',
          description: 'text-blue-700',
          icon: <AlertTriangleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />,
        };
      case 'success':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          title: 'text-green-800',
          description: 'text-green-700',
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          title: 'text-red-800',
          description: 'text-red-700',
          icon: <AlertTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />,
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          title: 'text-blue-800',
          description: 'text-blue-700',
          icon: <AlertTriangleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`flex space-x-4 p-4 border rounded-lg ${styles.border} ${styles.bg}`}>
      {styles.icon}
      <div>
        <h3 className={`font-medium ${styles.title}`}>{title}</h3>
        <p className={`text-sm ${styles.description}`}>{description}</p>
      </div>
    </div>
  );
}; 