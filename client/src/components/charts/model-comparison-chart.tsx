import { useQuery } from "@tanstack/react-query";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

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

export default function ModelComparisonChart() {
  const { data: metrics, isLoading } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
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

  // Convert metrics to radar chart format (0-100 scale)
  const chartData = [
    {
      metric: 'Accuracy',
      'Linear Regression': Math.round(metrics.linearRegression.r2Score * 100),
      'Random Forest': Math.round(metrics.randomForest.r2Score * 100),
    },
    {
      metric: 'Speed',
      'Linear Regression': 95, // Linear regression is typically faster
      'Random Forest': 70,     // Random forest is slower
    },
    {
      metric: 'Interpretability',
      'Linear Regression': 90, // More interpretable
      'Random Forest': 60,     // Less interpretable
    },
    {
      metric: 'Robustness',
      'Linear Regression': 75, // Less robust to outliers
      'Random Forest': 90,     // More robust
    },
    {
      metric: 'Generalization',
      'Linear Regression': 80,
      'Random Forest': 85,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 100]} 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickCount={6}
        />
        <Radar
          name="Linear Regression"
          dataKey="Linear Regression"
          stroke="#1976D2"
          fill="rgba(25, 118, 210, 0.2)"
          strokeWidth={2}
        />
        <Radar
          name="Random Forest"
          dataKey="Random Forest"
          stroke="#4CAF50"
          fill="rgba(76, 175, 80, 0.2)"
          strokeWidth={2}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="line"
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
