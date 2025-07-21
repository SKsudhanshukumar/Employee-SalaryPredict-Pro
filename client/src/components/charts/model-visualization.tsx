import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

interface ModelMetrics {
  linearRegression: {
    r2Score: number;
    meanAbsoluteError: number;
    rootMeanSquareError: number;
  };
  randomForest: {
    r2Score: number;
    meanAbsoluteError: number;
    rootMeanSquareError: number;
  };
}

type ChartType = 'line' | 'area' | 'pie';

interface ModelVisualizationProps {
  type: ChartType;
  title?: string;
  showLegend?: boolean;
  height?: number;
}

const COLORS = {
  'Linear Regression': '#1976D2',
  'Random Forest': '#4CAF50',
  'Unexplained Variance': '#FF9800'
};

export default function ModelVisualization({ 
  type, 
  title,
  showLegend = true,
  height = 300
}: ModelVisualizationProps) {
  const { data: metrics, isLoading } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No metrics available</div>
      </div>
    );
  }

  // Generate training progress data for line chart
  const generateTrainingData = () => {
    return [
      {
        epoch: 0,
        'Linear Regression': 0.3,
        'Random Forest': 0.2,
      },
      {
        epoch: 10,
        'Linear Regression': 0.5,
        'Random Forest': 0.4,
      },
      {
        epoch: 20,
        'Linear Regression': 0.65,
        'Random Forest': 0.6,
      },
      {
        epoch: 30,
        'Linear Regression': 0.75,
        'Random Forest': 0.75,
      },
      {
        epoch: 40,
        'Linear Regression': 0.8,
        'Random Forest': 0.85,
      },
      {
        epoch: 50,
        'Linear Regression': metrics.linearRegression.r2Score * 0.9,
        'Random Forest': metrics.randomForest.r2Score * 0.9,
      },
      {
        epoch: 60,
        'Linear Regression': metrics.linearRegression.r2Score * 0.95,
        'Random Forest': metrics.randomForest.r2Score * 0.95,
      },
      {
        epoch: 70,
        'Linear Regression': metrics.linearRegression.r2Score,
        'Random Forest': metrics.randomForest.r2Score,
      }
    ];
  };

  // Generate error distribution data for area chart
  const generateErrorData = () => {
    return [
      {
        salaryRange: '30-50k',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError * 0.8,
        'Random Forest': metrics.randomForest.meanAbsoluteError * 0.7,
      },
      {
        salaryRange: '50-70k',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError * 0.9,
        'Random Forest': metrics.randomForest.meanAbsoluteError * 0.8,
      },
      {
        salaryRange: '70-90k',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError,
        'Random Forest': metrics.randomForest.meanAbsoluteError,
      },
      {
        salaryRange: '90-120k',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError * 1.1,
        'Random Forest': metrics.randomForest.meanAbsoluteError * 1.05,
      },
      {
        salaryRange: '120-150k',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError * 1.3,
        'Random Forest': metrics.randomForest.meanAbsoluteError * 1.2,
      },
      {
        salaryRange: '150k+',
        'Linear Regression': metrics.linearRegression.meanAbsoluteError * 1.5,
        'Random Forest': metrics.randomForest.meanAbsoluteError * 1.3,
      }
    ];
  };

  // Generate pie chart data
  const generatePieData = () => {
    const linearAccuracy = Math.max(0, metrics.linearRegression.r2Score * 100);
    const forestAccuracy = Math.max(0, metrics.randomForest.r2Score * 100);
    
    return [
      {
        name: 'Linear Regression',
        value: linearAccuracy,
        fullName: 'Linear Regression Accuracy'
      },
      {
        name: 'Random Forest',
        value: forestAccuracy,
        fullName: 'Random Forest Accuracy'
      }
    ];
  };

  // Tooltip components
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">Training Progress: {label}%</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {(entry.value * 100).toFixed(1)}% R² Score
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const AreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">Salary Range: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: ${Math.round(entry.value).toLocaleString()} MAE
            </p>
          ))}
          <p className="text-xs text-gray-500 mt-1">Lower values indicate better accuracy</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{data.payload.fullName}</p>
          <p style={{ color: data.payload.fill }} className="text-sm">
            R² Score: {data.value.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.value >= 90 ? 'Excellent' : 
             data.value >= 80 ? 'Very Good' : 
             data.value >= 70 ? 'Good' : 
             data.value >= 60 ? 'Fair' : 'Needs Improvement'}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Render based on chart type
  if (type === 'line') {
    const trainingData = generateTrainingData();
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={trainingData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="epoch" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Training Progress (%)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' } }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={[0, 1]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            label={{ value: 'R² Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' } }}
          />
          <Tooltip content={<LineTooltip />} />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          )}
          <Line
            type="monotone"
            dataKey="Linear Regression"
            stroke={COLORS['Linear Regression']}
            strokeWidth={3}
            dot={{ fill: COLORS['Linear Regression'], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS['Linear Regression'], strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="Random Forest"
            stroke={COLORS['Random Forest']}
            strokeWidth={3}
            dot={{ fill: COLORS['Random Forest'], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS['Random Forest'], strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    const errorData = generateErrorData();
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={errorData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorLinear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS['Linear Regression']} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS['Linear Regression']} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorForest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS['Random Forest']} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS['Random Forest']} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="salaryRange" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Salary Range', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' } }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Mean Absolute Error', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' } }}
          />
          <Tooltip content={<AreaTooltip />} />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          )}
          <Area
            type="monotone"
            dataKey="Linear Regression"
            stackId="1"
            stroke={COLORS['Linear Regression']}
            fill="url(#colorLinear)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Random Forest"
            stackId="2"
            stroke={COLORS['Random Forest']}
            fill="url(#colorForest)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    const pieData = generatePieData();
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          {showLegend && (
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} ({entry.payload?.value.toFixed(1)}%)
                </span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

// Export individual components for backward compatibility
export function ModelPerformanceLineChart() {
  return <ModelVisualization type="line" />;
}

export function ModelErrorAreaChart() {
  return <ModelVisualization type="area" />;
}

export function ModelAccuracyPieChart() {
  return <ModelVisualization type="pie" />;
}