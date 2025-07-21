import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, Radar, TrendingUp, Activity, RefreshCw } from "lucide-react";
import ModelComparisonChart from "./model-comparison-chart";
import BarChartConfigurator from "./bar-chart-configurator";
import ModelVisualization from "./model-visualization";
import { useQuery } from "@tanstack/react-query";

interface ModelMetrics {
  linearRegression: {
    r2Score: number;
    meanAbsoluteError: number;
    rootMeanSquareError: number;
    oobScore?: number;
  };
  randomForest: {
    r2Score: number;
    meanAbsoluteError: number;
    rootMeanSquareError: number;
    oobScore?: number;
  };
}

export default function ComprehensiveModelComparison() {
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: metrics, isLoading, refetch } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes instead of 30 seconds
    refetchIntervalInBackground: false, // Don't refresh in background
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
  });

  // Update last updated time when data changes
  useEffect(() => {
    if (metrics) {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }
  }, [metrics]);

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
  };

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getPerformanceBadge = (r2Score: number) => {
    if (r2Score >= 0.9) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (r2Score >= 0.8) return <Badge className="bg-blue-100 text-blue-800">Very Good</Badge>;
    if (r2Score >= 0.7) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (r2Score >= 0.6) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Loading Model Metrics...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Loading Model Metrics...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">Unable to load model metrics. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Update Status Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className={`h-4 w-4 text-green-600 dark:text-green-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium text-green-900 dark:text-green-100">
                  Auto-Updating R² Scores
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Live
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Model R² scores update automatically every 2 minutes to show current performance metrics
          </p>
        </CardContent>
      </Card>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Linear Regression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    R² Score
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-updating"></div>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium transition-all duration-300 hover:scale-105">
                      {((metrics?.linearRegression?.r2Score || 0) * 100).toFixed(1)}%
                    </span>
                    {getPerformanceBadge(metrics?.linearRegression?.r2Score || 0)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MAE</span>
                  <span className="font-mono text-sm font-medium">
                    ${Math.round(metrics?.linearRegression?.meanAbsoluteError || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Random Forest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    R² Score
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-updating"></div>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium transition-all duration-300 hover:scale-105">
                      {((metrics?.randomForest?.r2Score || 0) * 100).toFixed(1)}%
                    </span>
                    {getPerformanceBadge(metrics?.randomForest?.r2Score || 0)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">MAE</span>
                  <span className="font-mono text-sm font-medium">
                    ${Math.round(metrics?.randomForest?.meanAbsoluteError || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      

      {/* Chart Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
                <Radar className="h-3 w-3" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="training" className="flex items-center gap-1 text-xs">
                <LineChart className="h-3 w-3" />
                Training
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-1 text-xs">
                <Activity className="h-3 w-3" />
                Errors
              </TabsTrigger>
              <TabsTrigger value="accuracy" className="flex items-center gap-1 text-xs">
                <PieChart className="h-3 w-3" />
                Accuracy
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Model Performance Radar</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive comparison across multiple performance dimensions
                  </p>
                </div>
                <div className="h-80">
                  <ModelComparisonChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <div className="space-y-4">
                <BarChartConfigurator mode="advanced" />
              </div>
            </TabsContent>

            <TabsContent value="training" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Training Progress</h3>
                  <p className="text-sm text-gray-600">
                    Model performance improvement during training process
                  </p>
                </div>
                <div className="h-80">
                  <ModelVisualization type="line" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Distribution</h3>
                  <p className="text-sm text-gray-600">
                    Model accuracy across different salary ranges
                  </p>
                </div>
                <div className="h-80">
                  <ModelVisualization type="area" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accuracy" className="mt-6">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Accuracy Breakdown</h3>
                  <p className="text-sm text-gray-600">
                    Proportion of variance explained by each model
                  </p>
                </div>
                <div className="h-80">
                  <ModelVisualization type="pie" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Model Insights & Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Key findings and actionable recommendations
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Linear Regression
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900">Strengths:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Fast training and prediction</li>
                          <li>• Highly interpretable results</li>
                          <li>• Good baseline performance</li>
                          <li>• Low computational requirements</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900">Best for:</h4>
                        <p className="text-sm text-blue-800">
                          Quick predictions, understanding feature relationships, and scenarios requiring model interpretability.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-900 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Random Forest
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-900">Strengths:</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Higher accuracy and robustness</li>
                          <li>• Handles non-linear relationships</li>
                          <li>• Resistant to overfitting</li>
                          <li>• Works well with mixed data types</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-900">Best for:</h4>
                        <p className="text-sm text-green-800">
                          Production deployments, complex datasets, and scenarios where accuracy is the primary concern.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-gray-200 bg-gray-50">
                  <CardHeader>
                    <CardTitle className="text-base text-gray-900">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">
                            <strong>For Production:</strong> Use Random Forest for final predictions due to higher accuracy and robustness.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">
                            <strong>For Analysis:</strong> Use Linear Regression to understand feature importance and relationships.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm text-gray-800">
                            <strong>For Validation:</strong> Compare predictions from both models to identify potential outliers or edge cases.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}