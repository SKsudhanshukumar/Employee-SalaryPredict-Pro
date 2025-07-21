import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line
} from "recharts";

type ChartType = 'bar' | 'area' | 'line';
type DataType = 'department' | 'experience';

interface AnalyticsChartProps {
  type: ChartType;
  dataType: DataType;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export default function AnalyticsChart({
  type,
  dataType,
  height = 300,
  color = '#1976D2',
  showGrid = true,
  showTooltip = true
}: AnalyticsChartProps) {
  
  const apiEndpoint = dataType === 'department' 
    ? "/api/analytics/department-salaries"
    : "/api/analytics/experience-salaries";

  const { data: rawData, isLoading } = useQuery<Record<string, number>>({
    queryKey: [apiEndpoint],
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!rawData || Object.keys(rawData).length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  // Transform data based on type
  const chartData = Object.entries(rawData).map(([key, avgSalary]) => ({
    [dataType]: key,
    avgSalary: Math.round(avgSalary),
  }));

  // Common chart props
  const commonProps = {
    data: chartData,
    margin: { top: 20, right: 30, left: 20, bottom: 5 }
  };

  // Common axis props
  const xAxisProps = {
    dataKey: dataType,
    tick: { fontSize: 12 },
    ...(dataType === 'department' && {
      angle: -45,
      textAnchor: 'end' as const,
      height: 60
    })
  };

  const yAxisProps = {
    tick: { fontSize: 12 },
    tickFormatter: (value: number) => `$${(value / 1000).toFixed(0)}K`
  };

  // Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && showTooltip) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">
            {dataType === 'department' ? 'Department' : 'Experience Range'}: {label}
          </p>
          <p style={{ color: payload[0].color }} className="text-sm">
            Average Salary: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render based on chart type
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Bar 
            dataKey="avgSalary" 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Area
            type="monotone"
            dataKey="avgSalary"
            stroke={color}
            fill={`${color}1A`} // Add transparency
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Line
            type="monotone"
            dataKey="avgSalary"
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

// Export individual components for backward compatibility
export function DepartmentChart() {
  return <AnalyticsChart type="bar" dataType="department" />;
}

export function ExperienceChart() {
  return <AnalyticsChart type="area" dataType="experience" />;
}

// Additional preset configurations
export function DepartmentBarChart(props?: Partial<AnalyticsChartProps>) {
  return <AnalyticsChart type="bar" dataType="department" {...props} />;
}

export function DepartmentLineChart(props?: Partial<AnalyticsChartProps>) {
  return <AnalyticsChart type="line" dataType="department" {...props} />;
}

export function ExperienceBarChart(props?: Partial<AnalyticsChartProps>) {
  return <AnalyticsChart type="bar" dataType="experience" {...props} />;
}

export function ExperienceLineChart(props?: Partial<AnalyticsChartProps>) {
  return <AnalyticsChart type="line" dataType="experience" {...props} />;
}