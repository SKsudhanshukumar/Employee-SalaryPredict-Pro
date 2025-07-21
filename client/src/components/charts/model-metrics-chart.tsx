import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

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

type BarSize = 'small' | 'medium' | 'large' | 'extra-large';
type Spacing = 'tight' | 'normal' | 'wide';
type ChartLayout = 'single' | 'split' | 'controlled';

interface ModelMetricsChartProps {
  barSize?: BarSize;
  spacing?: Spacing;
  layout?: ChartLayout;
  barWidth?: number; // For controlled layout
  barSpacing?: number; // For controlled layout
}

export default function ModelMetricsChart({ 
  barSize = 'medium', 
  spacing = 'normal',
  layout = 'single',
  barWidth = 40,
  barSpacing = 20
}: ModelMetricsChartProps) {
  const { data: metrics, isLoading } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading charts...</div>
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

  // Configuration objects
  const barSizeConfig = {
    'small': { maxBarSize: 30, radius: [2, 2, 0, 0] as [number, number, number, number] },
    'medium': { maxBarSize: 45, radius: [3, 3, 0, 0] as [number, number, number, number] },
    'large': { maxBarSize: 60, radius: [4, 4, 0, 0] as [number, number, number, number] },
    'extra-large': { maxBarSize: 80, radius: [5, 5, 0, 0] as [number, number, number, number] }
  };

  const spacingConfig = {
    'tight': { barCategoryGap: '20%', margin: { top: 15, right: 25, left: 15, bottom: 5 } },
    'normal': { barCategoryGap: '30%', margin: { top: 20, right: 30, left: 20, bottom: 5 } },
    'wide': { barCategoryGap: '40%', margin: { top: 25, right: 35, left: 25, bottom: 10 } }
  };

  const currentBarConfig = barSizeConfig[barSize];
  const currentSpacingConfig = spacingConfig[spacing];

  // Data preparation
  const singleChartData = [
    {
      metric: 'R² Score (%)',
      'Linear Regression': Math.round(metrics.linearRegression.r2Score * 100),
      'Random Forest': Math.round(metrics.randomForest.r2Score * 100),
      unit: '%',
      maxValue: 100
    },
    {
      metric: 'MAE',
      'Linear Regression': Math.round(metrics.linearRegression.meanAbsoluteError),
      'Random Forest': Math.round(metrics.randomForest.meanAbsoluteError),
      unit: '$',
      maxValue: Math.max(metrics.linearRegression.meanAbsoluteError, metrics.randomForest.meanAbsoluteError) * 1.2
    },
    {
      metric: 'RMSE',
      'Linear Regression': Math.round(metrics.linearRegression.rootMeanSquareError),
      'Random Forest': Math.round(metrics.randomForest.rootMeanSquareError),
      unit: '$',
      maxValue: Math.max(metrics.linearRegression.rootMeanSquareError, metrics.randomForest.rootMeanSquareError) * 1.2
    }
  ];

  const accuracyData = [
    {
      model: 'Linear Regression',
      value: Math.round(metrics.linearRegression.r2Score * 100),
      color: '#1976D2'
    },
    {
      model: 'Random Forest',
      value: Math.round(metrics.randomForest.r2Score * 100),
      color: '#4CAF50'
    }
  ];

  const errorData = [
    {
      metric: 'MAE',
      'Linear Regression': Math.round(metrics.linearRegression.meanAbsoluteError),
      'Random Forest': Math.round(metrics.randomForest.meanAbsoluteError),
    },
    {
      metric: 'RMSE',
      'Linear Regression': Math.round(metrics.linearRegression.rootMeanSquareError),
      'Random Forest': Math.round(metrics.randomForest.rootMeanSquareError),
    }
  ];

  // Tooltip components
  const SingleChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = singleChartData.find(d => d.metric === label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: {data?.unit === '%' ? '' : data?.unit}{entry.value.toLocaleString()}{data?.unit === '%' ? '%' : ''}
              {label.includes('R² Score') && ' (higher is better)'}
              {(label === 'MAE' || label === 'RMSE') && ' (lower is better)'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const AccuracyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p style={{ color: payload[0].color }} className="text-sm">
            R² Score: {payload[0].value}% (higher is better)
          </p>
        </div>
      );
    }
    return null;
  };

  const ErrorTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey}: ${entry.value.toLocaleString()} (lower is better)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render based on layout
  if (layout === 'single') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={singleChartData}
          margin={currentSpacingConfig.margin}
          maxBarSize={currentBarConfig.maxBarSize}
          barCategoryGap={currentSpacingConfig.barCategoryGap}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value.toString();
            }}
          />
          <Tooltip content={<SingleChartTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Bar
            dataKey="Linear Regression"
            fill="#1976D2"
            radius={currentBarConfig.radius}
            name="Linear Regression"
          />
          <Bar
            dataKey="Random Forest"
            fill="#4CAF50"
            radius={currentBarConfig.radius}
            name="Random Forest"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (layout === 'controlled') {
    const accuracyChartWidth = (accuracyData.length * barWidth) + (accuracyData.length * barSpacing) + 100;
    const errorChartWidth = (errorData.length * (barWidth * 2)) + (errorData.length * barSpacing) + 150;

    return (
      <div className="space-y-6">
        <div className="flex justify-center gap-4 text-xs text-gray-600">
          <span>Bar Width: {barWidth}px</span>
          <span>Spacing: {barSpacing}px</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 text-center">Model Accuracy (R² Score)</h4>
            <div className="flex justify-center">
              <div style={{ width: Math.min(accuracyChartWidth, 400), height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={accuracyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    width={accuracyChartWidth}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="model" 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<AccuracyTooltip />} />
                    <Bar
                      dataKey="value"
                      barSize={barWidth}
                      radius={[3, 3, 0, 0]}
                    >
                      {accuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 text-center">Error Metrics (Lower is Better)</h4>
            <div className="flex justify-center">
              <div style={{ width: Math.min(errorChartWidth, 400), height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    width={errorChartWidth}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<ErrorTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Bar
                      dataKey="Linear Regression"
                      fill="#1976D2"
                      barSize={barWidth}
                      radius={[3, 3, 0, 0]}
                      name="Linear Regression"
                    />
                    <Bar
                      dataKey="Random Forest"
                      fill="#4CAF50"
                      barSize={barWidth}
                      radius={[3, 3, 0, 0]}
                      name="Random Forest"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Split layout (default for enhanced/multi)
  return (
    <div className="space-y-6">
      {layout === 'split' && (
        <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Bar Size:</span>
            <span className="font-medium capitalize">{barSize}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Spacing:</span>
            <span className="font-medium capitalize">{spacing}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 text-center">Model Accuracy (R² Score)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={accuracyData}
              margin={currentSpacingConfig.margin}
              maxBarSize={currentBarConfig.maxBarSize}
              barCategoryGap={currentSpacingConfig.barCategoryGap}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="model" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<AccuracyTooltip />} />
              <Bar
                dataKey="value"
                radius={currentBarConfig.radius}
              >
                {accuracyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 text-center">Error Metrics (Lower is Better)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={errorData}
              margin={currentSpacingConfig.margin}
              maxBarSize={Math.round(currentBarConfig.maxBarSize * 0.75)}
              barCategoryGap={currentSpacingConfig.barCategoryGap}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="metric" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ErrorTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="Linear Regression"
                fill="#1976D2"
                radius={currentBarConfig.radius}
                name="Linear Regression"
              />
              <Bar
                dataKey="Random Forest"
                fill="#4CAF50"
                radius={currentBarConfig.radius}
                name="Random Forest"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}