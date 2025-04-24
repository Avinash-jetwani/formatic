import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Calendar } from '@/components/ui/calendar/Calendar';
import { format } from 'date-fns';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  onChange: (range: DateRange) => void;
  value?: DateRange;
  label?: string;
  maxDate?: Date;
  minDate?: Date;
  presets?: {
    label: string;
    value: () => DateRange;
  }[];
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  className,
  onChange,
  value = { startDate: null, endDate: null },
  label = 'Date Range',
  maxDate,
  minDate,
  presets,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Update the selected range when value prop changes
  useEffect(() => {
    // Deep equality check to avoid unnecessary updates
    if (!value) return;
    
    const isStartDateEqual = value.startDate === selectedRange.startDate ||
      (value.startDate && selectedRange.startDate && 
       value.startDate.getTime() === selectedRange.startDate.getTime());
       
    const isEndDateEqual = value.endDate === selectedRange.endDate ||
      (value.endDate && selectedRange.endDate && 
       value.endDate.getTime() === selectedRange.endDate.getTime());
    
    if (!isStartDateEqual || !isEndDateEqual) {
      setSelectedRange(value);
    }
  }, [value, selectedRange]);

  // Handle click outside to close the date picker
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Close if clicking outside the trigger button AND outside the dropdown
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // For mobile devices, position the dropdown centered
        if (isMobile) {
          const mobileWidth = Math.min(viewportWidth - 32, 500);
          setDropdownPosition({
            top: 80, // Position from top of viewport
            left: (viewportWidth - mobileWidth) / 2,
            width: mobileWidth
          });
          return;
        }
        
        // For desktop, position relative to the trigger button
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceNeeded = 520; // Approximate height of dropdown
        
        // If there's not enough space below, position above
        if (spaceBelow < spaceNeeded && rect.top > spaceNeeded) {
          setDropdownPosition({
            top: rect.top - spaceNeeded - 8,
            left: rect.left,
            width: Math.max(rect.width, 320)
          });
        } else {
          // Default position below
          setDropdownPosition({
            top: rect.bottom + 8,
            left: rect.left,
            width: Math.max(rect.width, 320)
          });
        }
      };
      
      updatePosition();
      
      // Update position on resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, isMobile]);

  // Default presets
  const defaultPresets = [
    {
      label: 'Today',
      value: () => ({
        startDate: new Date(),
        endDate: new Date(),
      }),
    },
    {
      label: 'Last 7 days',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { startDate: start, endDate: end };
      },
    },
    {
      label: 'Last 30 days',
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { startDate: start, endDate: end };
      },
    },
    {
      label: 'This month',
      value: () => {
        const start = new Date();
        start.setDate(1);
        return { startDate: start, endDate: new Date() };
      },
    },
  ];

  const allPresets = presets || defaultPresets;

  const handlePresetClick = (preset: typeof allPresets[0]) => {
    const range = preset.value();
    setSelectedRange(range);
    onChange(range);
    setIsOpen(false);
  };

  const handleDateSelect = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;
    
    // Check if start date is after end date
    let newStart = selectedRange.startDate;
    let newEnd = selectedRange.endDate;
    
    if (isStart) {
      newStart = date;
      
      // If start date is after end date, reset end date
      if (newEnd && date > newEnd) {
        newEnd = null;
      }
    } else {
      newEnd = date;
      
      // If end date is before start date, reset start date
      if (newStart && date < newStart) {
        newStart = date;
      }
    }
    
    setSelectedRange({ startDate: newStart, endDate: newEnd });
  };

  const handleApply = () => {
    onChange(selectedRange);
    setIsOpen(false);
  };

  const handleClear = () => {
    const emptyRange = { startDate: null, endDate: null };
    setSelectedRange(emptyRange);
    onChange(emptyRange);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!selectedRange.startDate) return 'Select date range';

    const formatDate = (date: Date) => {
      return format(date, 'MMM d, yyyy');
    };

    if (!selectedRange.endDate || selectedRange.startDate.getTime() === selectedRange.endDate.getTime()) {
      return formatDate(selectedRange.startDate);
    }

    return `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`;
  };

  // The dropdown content rendered through the portal
  const DropdownContent = isOpen && (
    <div 
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        maxHeight: '90vh',
        overflow: 'auto',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgb(229, 231, 235)',
        zIndex: 9999999 // Extremely high z-index
      }}
    >
      {/* Presets header */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          {allPresets.map((preset, i) => (
            <button
              key={i}
              type="button"
              className="inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Calendar section */}
      <div className="p-4">
        <div className={`flex ${isMobile ? 'flex-col space-y-6' : 'flex-row space-x-6'}`}>
          {/* Start Date Calendar */}
          <div className="flex-1 space-y-2">
            <p className="text-base font-semibold text-gray-700">Start Date</p>
            <div className="border border-gray-200 rounded-md">
              <Calendar
                mode="single"
                selected={selectedRange.startDate || undefined}
                onSelect={(date) => handleDateSelect(date, true)}
                disabled={(date) => 
                  (maxDate ? date > maxDate : false) || 
                  (minDate ? date < minDate : false)
                }
                initialFocus
              />
            </div>
          </div>
          
          {/* End Date Calendar */}
          <div className="flex-1 space-y-2">
            <p className="text-base font-semibold text-gray-700">End Date</p>
            <div className="border border-gray-200 rounded-md">
              <Calendar
                mode="single"
                selected={selectedRange.endDate || undefined}
                onSelect={(date) => handleDateSelect(date, false)}
                disabled={(date) => 
                  (maxDate ? date > maxDate : false) || 
                  (minDate ? date < minDate : false) || 
                  (selectedRange.startDate ? date < selectedRange.startDate : false)
                }
                initialFocus
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className="px-4 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('relative', className)} {...props}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center truncate">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{formatDateRange()}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && ReactDOM.createPortal(DropdownContent, document.body)}
    </div>
  );
}; 