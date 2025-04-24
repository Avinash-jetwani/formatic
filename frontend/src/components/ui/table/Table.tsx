import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  isStriped?: boolean;
  isBordered?: boolean;
  isHoverable?: boolean;
  isCompact?: boolean;
  isSortable?: boolean;
  fullWidth?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      isStriped = false,
      isBordered = false,
      isHoverable = false,
      isCompact = false,
      isSortable = false,
      fullWidth = true,
      ...props
    },
    ref
  ) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn(
          'min-w-full divide-y divide-gray-200 text-sm',
          isStriped && 'table-striped',
          isBordered && 'border border-gray-200',
          isHoverable && 'table-hover',
          isCompact && 'table-compact',
          isSortable && 'table-sortable',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-gray-50', className)}
    {...props}
  />
));

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y divide-gray-200 bg-white', className)}
    {...props}
  />
));

TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-gray-50 font-medium', className)}
    {...props}
  />
));

TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }
>(({ className, isSelected, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'hover:bg-gray-50',
      isSelected && 'bg-blue-50',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
      className
    )}
    {...props}
  />
));

TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 whitespace-nowrap text-sm text-gray-500', className)}
    {...props}
  />
));

TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-gray-500', className)}
    {...props}
  />
));

TableCaption.displayName = 'TableCaption';

// Responsive table for small screens
export const ResponsiveTable: React.FC<
  {
    headers: string[];
    data: Record<string, React.ReactNode>[];
    keyField?: string;
    isLoading?: boolean;
    emptyMessage?: string;
  } & HTMLAttributes<HTMLDivElement>
> = ({
  headers,
  data,
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No data available',
  className,
  ...props
}) => {
  // Regular table for desktop
  const desktopTable = (
    <Table className="hidden md:table" fullWidth>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableHead key={index}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={row[keyField]?.toString() || rowIndex}>
            {headers.map((header, colIndex) => (
              <TableCell key={colIndex}>{row[header]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // Card-based layout for mobile
  const mobileCards = (
    <div className="md:hidden space-y-4">
      {data.map((row, rowIndex) => (
        <div
          key={row[keyField]?.toString() || rowIndex}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
        >
          {headers.map((header, colIndex) => (
            <div key={colIndex} className="py-2 flex justify-between border-b border-gray-100 last:border-0">
              <div className="font-medium text-sm text-gray-500">{header}</div>
              <div className="text-sm text-right">{row[header]}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-40 rounded" {...props} />;
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center p-8 text-gray-500 text-center rounded-lg border border-gray-200"
        {...props}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {desktopTable}
      {mobileCards}
    </div>
  );
}; 