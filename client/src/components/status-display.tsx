import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Target, Brain, Database, TrendingUp, RefreshCw } from "lucide-react";

interface Stats {
  totalEmployees: number;
  avgSalary: number;
  modelAccuracy: number;
}

interface ModelStatus {
  isTraining: boolean;
  isInitialized: boolean;
  totalRecords: number;
  message: string;
}

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

type DisplayType = 'cards' | 'banner' | 'compact';

interface StatusDisplayProps {
  type: DisplayType;
  showModelMetrics?: boolean;
  className?: string;
}

export default function StatusDisplay({ 
  type, 
  showModelMetrics = true,
  className = ""
}: StatusDisplayProps) {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  // Fetch stats data
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/analytics/stats"],
  });

  // Fetch model metrics with auto-refresh
  const { data: metrics, isLoading: metricsLoading } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    refetchIntervalInBackground: false,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
  });

  // Fetch model status
  useEffect(() => {
    if (type === 'banner' || showModelMetrics) {
      const fetchStatus = async () => {
        try {
          const response = await fetch('/api/model-status');
          const data = await response.json();
          setModelStatus(data);
        } catch (error) {
          console.error('Failed to fetch model status:', error);
        }
      };

      fetchStatus();
      // Refresh status every 2 minutes
      const interval = setInterval(fetchStatus, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [type, showModelMetrics]);

  // Utility functions
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Cards display type
  if (type === 'cards') {
    if (statsLoading) {
      return (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-inter font-bold text-gray-900">
                  {stats ? formatNumber(stats.totalEmployees) : '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-success font-medium">+12%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Salary</p>
                <p className="text-2xl font-inter font-bold text-gray-900">
                  {stats ? formatCurrency(stats.avgSalary) : '$0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-success font-medium">+5.2%</span>
              <span className="text-gray-500 ml-2">from last year</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                <p className="text-2xl font-inter font-bold text-gray-900">
                  {stats ? `${stats.modelAccuracy}%` : '0%'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-success font-medium">+2.1%</span>
              <span className="text-gray-500 ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Banner display type
  if (type === 'banner') {
    if (!modelStatus) return null;

    return (
      <Card className={`mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Real Machine Learning Engine
                </span>
              </div>
              <Badge variant={modelStatus.isInitialized ? "default" : "secondary"} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {modelStatus.isInitialized ? "Active" : "Initializing"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>{modelStatus.totalRecords.toLocaleString()} records</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Linear Regression + Random Forest</span>
              </div>
              {metrics && !metricsLoading && (
                <>
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">
                      LR: {((metrics.linearRegression.r2Score || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="h-4 w-4 text-green-500" />
                    <span className="font-medium">
                      RF: {((metrics.randomForest.r2Score || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            {modelStatus.message}
            {metrics && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                • R² scores auto-update every 2 minutes
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Compact display type
  if (type === 'compact') {
    return (
      <div className={`flex items-center space-x-6 p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">
            {stats ? formatNumber(stats.totalEmployees) : '0'} employees
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">
            {stats ? formatCurrency(stats.avgSalary) : '$0'} avg
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium">
            {stats ? `${stats.modelAccuracy}%` : '0%'} accuracy
          </span>
        </div>
        {metrics && showModelMetrics && (
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              LR: {((metrics.linearRegression.r2Score || 0) * 100).toFixed(1)}% | 
              RF: {((metrics.randomForest.r2Score || 0) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Export individual components for backward compatibility
export function StatsCards(props?: { className?: string }) {
  return <StatusDisplay type="cards" {...props} />;
}

export function MLStatusBanner(props?: { className?: string }) {
  return <StatusDisplay type="banner" {...props} />;
}

export function CompactStatus(props?: { className?: string; showModelMetrics?: boolean }) {
  return <StatusDisplay type="compact" {...props} />;
}