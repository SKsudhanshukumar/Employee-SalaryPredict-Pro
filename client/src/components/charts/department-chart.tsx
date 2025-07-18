import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DepartmentChart() {
  const { data: departmentData, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/analytics/department-salaries"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (!departmentData || Object.keys(departmentData).length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const chartData = Object.entries(departmentData).map(([department, avgSalary]) => ({
    department,
    avgSalary: Math.round(avgSalary),
  }));

  const colors = ['#1976D2', '#00ACC1', '#4CAF50', '#FF9800', '#F44336'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="department" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Average Salary']}
          labelStyle={{ color: '#374151' }}
        />
        <Bar 
          dataKey="avgSalary" 
          fill="#1976D2"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
