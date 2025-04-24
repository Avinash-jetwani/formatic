import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card/Card';

// Default color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  className,
  title,
  description,
  height = 300,
  loading = false,
  children,
  ...props
}) => {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className={`animate-pulse bg-gray-100 rounded w-full h-${height}`}></div>
        ) : (
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export interface LineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke?: string;
    name?: string;
  }[];
  xAxisDataKey: string;
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const LineChartComponent: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisDataKey,
  title,
  description,
  height = 300,
  loading = false,
  className,
  showGrid = true,
  showLegend = true,
}) => {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      loading={loading}
      className={className}
    >
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        <XAxis 
          dataKey={xAxisDataKey} 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip />
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke || COLORS[index % COLORS.length]}
            name={line.name || line.dataKey}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};

export interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    fill?: string;
    name?: string;
  }[];
  xAxisDataKey: string;
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisDataKey,
  title,
  description,
  height = 300,
  loading = false,
  className,
  showGrid = true,
  showLegend = true,
  stacked = false,
}) => {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      loading={loading}
      className={className}
    >
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xAxisDataKey}
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.fill || COLORS[index % COLORS.length]}
            name={bar.name || bar.dataKey}
            stackId={stacked ? 'stack' : undefined}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title?: string;
  description?: string;
  height?: number;
  loading?: boolean;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

export const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  description,
  height = 300,
  loading = false,
  className,
  innerRadius = 0,
  outerRadius = 80,
  colors = COLORS,
}) => {
  return (
    <ChartContainer
      title={title}
      description={description}
      height={height}
      loading={loading}
      className={className}
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
}; 