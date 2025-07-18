import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function ExperienceChart() {
  const { data: experienceData, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/analytics/experience-salaries"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!experienceData || Object.keys(experienceData).length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const chartData = Object.entries(experienceData).map(([range, avgSalary]) => ({
    range,
    avgSalary: Math.round(avgSalary),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="range" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Average Salary']}
          labelStyle={{ color: '#374151' }}
        />
        <Area
          type="monotone"
          dataKey="avgSalary"
          stroke="#1976D2"
          fill="rgba(25, 118, 210, 0.1)"
          strokeWidth={3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
