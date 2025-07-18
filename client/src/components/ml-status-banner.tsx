import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Database, TrendingUp } from 'lucide-react';

interface ModelStatus {
  isTraining: boolean;
  isInitialized: boolean;
  totalRecords: number;
  message: string;
}

export function MLStatusBanner() {
  const [status, setStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/model-status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch model status:', error);
      }
    };

    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Real Machine Learning Engine
              </span>
            </div>
            <Badge variant={status.isInitialized ? "default" : "secondary"} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {status.isInitialized ? "Active" : "Initializing"}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>{status.totalRecords.toLocaleString()} records</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Linear Regression + Random Forest</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          {status.message}
        </p>
      </CardContent>
    </Card>
  );
}