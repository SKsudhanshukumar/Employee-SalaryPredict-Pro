import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BarChartConfigurator from "@/components/charts/bar-chart-configurator";
import ModelMetricsChart from "@/components/charts/model-metrics-chart";
import ModelComparisonChart from "@/components/charts/model-comparison-chart";
import ComprehensiveModelComparison from "@/components/charts/comprehensive-model-comparison";

export default function ChartTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Components Test</h1>
          <p className="text-gray-600">Testing all model comparison chart components</p>
        </div>

        {/* Advanced Bar Chart Configurator */}
        <BarChartConfigurator mode="advanced" />

        {/* Simple Bar Chart Test */}
        <Card>
          <CardHeader>
            <CardTitle>Simple Unified Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ModelMetricsChart layout="single" />
            </div>
          </CardContent>
        </Card>

        {/* Split Layout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Split Layout Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ModelMetricsChart layout="split" barSize="large" spacing="wide" />
            </div>
          </CardContent>
        </Card>

        {/* Bar Size Presets */}
        <BarChartConfigurator mode="presets" />

        {/* Original Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Original Radar Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ModelComparisonChart />
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Model Comparison Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <ComprehensiveModelComparison />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}