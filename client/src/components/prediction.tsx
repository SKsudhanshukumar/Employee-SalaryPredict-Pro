import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calculator, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { jobTitleOptions, departmentOptions, locationOptions, educationOptions, companySizeOptions } from "@shared/schema";

interface PredictionFormData {
  jobTitle: string;
  experience: number;
  department: string;
  location: string;
  educationLevel: string;
  companySize: string;
}

interface PredictionWithFeatures {
  prediction: {
    id: number;
    linearRegressionPrediction: number;
    randomForestPrediction: number;
    confidence: number;
    jobTitle: string;
    experience: number;
    department: string;
    location: string;
    educationLevel: string;
    companySize: string;
  };
  featureImportance: Record<string, number>;
}

type DisplayMode = 'form' | 'results' | 'combined';

interface PredictionProps {
  mode: DisplayMode;
  showModelSelector?: boolean;
  className?: string;
  onPredictionSuccess?: (data: any) => void;
}

export default function Prediction({ 
  mode, 
  showModelSelector = true,
  className = "",
  onPredictionSuccess
}: PredictionProps) {
  const [formData, setFormData] = useState<PredictionFormData>({
    jobTitle: '',
    experience: 0,
    department: '',
    location: '',
    educationLevel: '',
    companySize: '',
  });
  
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const [isUpdatingResults, setIsUpdatingResults] = useState<boolean>(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch predictions for results display (optimized for performance)
  const { data: predictions, isLoading: resultsLoading, refetch } = useQuery<PredictionWithFeatures[]>({
    queryKey: ['/api/predictions'],
    queryFn: async () => {
      console.log('🔄 Fetching predictions from API...');
      const response = await apiRequest('GET', '/api/predictions');
      const data = await response.json();
      console.log('✅ Predictions fetched:', data);
      return data;
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    refetchOnMount: true,
    enabled: mode === 'results' || mode === 'combined',
    retry: 2,
    retryDelay: 1000
  });

  const predictMutation = useMutation({
    mutationFn: async (data: PredictionFormData) => {
      const startTime = Date.now();
      console.log('🚀 Starting optimized prediction request with data:', data);
      
      // Add request timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        const response = await apiRequest('POST', '/api/predict', data, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const networkTime = Date.now() - startTime;
        console.log(`📡 Network request completed in ${networkTime}ms`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const parseStart = Date.now();
        const result = await response.json();
        const parseTime = Date.now() - parseStart;
        const totalTime = Date.now() - startTime;
        
        console.log(`📊 JSON parsing took ${parseTime}ms`);
        console.log(`⚡ Total prediction completed in ${totalTime}ms`);
        console.log('✅ Prediction result:', result);
        
        // Validate the response structure
        if (!result.prediction || typeof result.prediction.linearRegressionPrediction !== 'number') {
          console.error('❌ Invalid prediction response structure:', result);
          throw new Error('Invalid prediction response from server');
        }
        
        return { ...result, clientResponseTime: totalTime };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Prediction request failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const responseTime = data.clientResponseTime || 0;
      const serverTime = data.responseTime || 0;
      
      console.log('✅ Prediction success handler started');
      
      // Show toast notification
      toast({
        title: "Prediction Generated",
        description: `Salary prediction: ${formatCurrency(data.prediction.linearRegressionPrediction)} (${responseTime}ms)`,
      });
      
      // Always update cache and trigger refetch for all modes
      // This ensures that any PredictionResults component will show the new prediction
      const newPrediction = { 
        prediction: data.prediction, 
        featureImportance: data.featureImportance || {
          experience: 0.35,
          location: 0.25,
          department: 0.20,
          educationLevel: 0.12,
          companySize: 0.08
        }
      };
      
      console.log('🔄 Updating cache with new prediction:', newPrediction);
      setIsUpdatingResults(true);
      
      // Optimistically update the cache for all instances
      queryClient.setQueryData(['/api/predictions'], (oldData: any) => {
        console.log('📝 Current cache data:', oldData);
        if (!oldData) return [newPrediction];
        const updatedData = [newPrediction, ...oldData];
        console.log('📝 Updated cache data:', updatedData);
        return updatedData;
      });
      
      // Invalidate and refetch the predictions query to ensure all components get updated
      console.log('🔄 Invalidating predictions query...');
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
      
      // Force refetch for all prediction queries after a short delay
      setTimeout(() => {
        console.log('🔄 Force refetching all prediction queries...');
        queryClient.refetchQueries({ queryKey: ['/api/predictions'] });
        setIsUpdatingResults(false);
      }, 1000); // Increased delay to ensure backend storage completes
      
      // Call the success callback if provided
      if (onPredictionSuccess) {
        onPredictionSuccess(data);
      }
      
      // Log performance metrics
      if (responseTime > 2000) {
        console.warn(`⚠️ Slow prediction response: ${responseTime}ms (server: ${serverTime}ms)`);
      } else if (responseTime > 1000) {
        console.log(`⚡ Moderate prediction response: ${responseTime}ms (server: ${serverTime}ms)`);
      } else {
        console.log(`🚀 Fast prediction response: ${responseTime}ms (server: ${serverTime}ms)`);
      }
      
      console.log('✅ Prediction success handler completed');
    },
    onError: (error: any) => {
      console.error('❌ Prediction error details:', error);
      
      let errorMessage = "Failed to generate salary prediction.";
      let title = "Prediction Failed";
      
      if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
        errorMessage = "Request timed out. The server may be busy - please try again in a moment.";
        title = "Request Timeout";
      } else if (error.message?.includes('408')) {
        errorMessage = "Prediction is taking longer than expected. The system is optimizing - please try again.";
        title = "Processing Delay";
      } else if (error.message?.includes('500')) {
        errorMessage = "Server error occurred. Please try again in a few moments.";
        title = "Server Error";
      } else if (error.message?.includes('400')) {
        errorMessage = "Invalid data provided. Please check all fields and try again.";
        title = "Validation Error";
      } else if (error.message?.includes('Invalid prediction response')) {
        errorMessage = "Server returned invalid data. Please try again.";
        title = "Response Error";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
        title = "Network Error";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Log additional debugging info
      console.error('❌ Error context:', {
        formData,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent rapid successive requests (debouncing)
    const now = Date.now();
    if (now - lastRequestTime < 1000) { // 1 second debounce
      if (!isDebouncing) {
        setIsDebouncing(true);
        toast({
          title: "Please Wait",
          description: "Processing your previous request...",
          variant: "default",
        });
        setTimeout(() => setIsDebouncing(false), 1000);
      }
      return;
    }
    
    // Enhanced validation
    if (!formData.jobTitle || !formData.department || !formData.location || 
        !formData.educationLevel || !formData.companySize) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.experience < 0 || formData.experience > 50) {
      toast({
        title: "Validation Error",
        description: "Experience must be between 0 and 50 years.",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 Submitting prediction with data:', formData);
    setLastRequestTime(now);
    predictMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PredictionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Utility functions (optimized with memoization)
  const formatCurrency = React.useMemo(() => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
    return (amount: number) => formatter.format(amount);
  }, []);

  const calculateRange = (prediction: number, confidence: number) => {
    const margin = prediction * (1 - confidence / 100) * 0.5;
    return {
      min: Math.round(prediction - margin),
      max: Math.round(prediction + margin),
    };
  };

  // Form component
  const PredictionForm = () => (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-inter font-semibold text-gray-900">
            Salary Prediction
          </CardTitle>
          {showModelSelector && (
            <Select defaultValue="both">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear Regression</SelectItem>
                <SelectItem value="forest">Random Forest</SelectItem>
                <SelectItem value="both">Both Models</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </Label>
            <Select onValueChange={(value) => handleInputChange('jobTitle', value)} value={formData.jobTitle}>
              <SelectTrigger>
                <SelectValue placeholder="Select job title" />
              </SelectTrigger>
              <SelectContent>
                {jobTitleOptions.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Experience (Years)
            </Label>
            <Input
              id="experience"
              type="number"
              placeholder="e.g., 5"
              min="0"
              max="50"
              value={formData.experience || ''}
              onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </Label>
            <Select onValueChange={(value) => handleInputChange('department', value)} value={formData.department}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </Label>
            <Select onValueChange={(value) => handleInputChange('location', value)} value={formData.location}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </Label>
            <Select onValueChange={(value) => handleInputChange('educationLevel', value)} value={formData.educationLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {educationOptions.map((edu) => (
                  <SelectItem key={edu} value={edu}>
                    {edu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              Company Size
            </Label>
            <Select onValueChange={(value) => handleInputChange('companySize', value)} value={formData.companySize}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-center">
            <Button 
              type="submit" 
              className="bg-primary text-white hover:bg-blue-700 px-8 py-3 transition-all duration-200 relative"
              disabled={predictMutation.isPending || isDebouncing}
            >
              {predictMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Prediction...
                </>
              ) : isDebouncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-pulse" />
                  Please Wait...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Predict Salary
                </>
              )}
              {predictMutation.isPending && (
                <div className="absolute inset-0 bg-blue-600 opacity-20 animate-pulse rounded"></div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Results component
  const PredictionResults = () => {
    console.log('🔍 PredictionResults render:', { 
      resultsLoading, 
      predictions, 
      predictionsLength: predictions?.length,
      mode,
      isUpdatingResults
    });

    if (resultsLoading || isUpdatingResults) {
      console.log('⏳ Results loading or updating...');
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-xl font-inter font-semibold text-gray-900 flex items-center">
              Prediction Results
              {isUpdatingResults && (
                <span className="ml-2 text-sm text-blue-600 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Updating...
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-200 rounded-xl h-32"></div>
                <div className="bg-gray-200 rounded-xl h-32"></div>
              </div>
              <div className="bg-gray-200 rounded-xl h-64"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!predictions || predictions.length === 0) {
      console.log('📭 No predictions available');
      return (
        <Card data-prediction-results className={className}>
          <CardHeader>
            <CardTitle className="text-xl font-inter font-semibold text-gray-900">
              Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">No predictions available. Submit a prediction form to see results.</p>
              <Button
                onClick={() => {
                  console.log('🔄 Manual refetch triggered');
                  refetch();
                }}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Loading Results
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    const latestPrediction = predictions[0];
    console.log('📊 Displaying prediction:', latestPrediction);
    
    // Validate prediction data structure
    if (!latestPrediction?.prediction) {
      console.error('❌ Invalid prediction data structure:', latestPrediction);
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-xl font-inter font-semibold text-gray-900">
              Prediction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-500">Invalid prediction data. Please try submitting a new prediction.</p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    const lrRange = calculateRange(
      latestPrediction.prediction.linearRegressionPrediction || 0, 
      latestPrediction.prediction.confidence || 85
    );
    const rfRange = calculateRange(
      latestPrediction.prediction.randomForestPrediction || 0, 
      latestPrediction.prediction.confidence || 85
    );

    return (
      <Card key={`prediction-${latestPrediction.prediction.id}`} data-prediction-results className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-inter font-semibold text-gray-900">
              Prediction Results
            </CardTitle>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Linear Regression Prediction */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Linear Regression</h3>
              <p className="text-3xl font-bold text-blue-700 mb-2">
                {formatCurrency(latestPrediction.prediction.linearRegressionPrediction || 0)}
              </p>
              <p className="text-sm text-blue-600">
                Range: {formatCurrency(lrRange.min)} - {formatCurrency(lrRange.max)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-blue-600 mb-1">
                  <span>Confidence</span>
                  <span>{latestPrediction.prediction.confidence || 85}%</span>
                </div>
                <Progress value={latestPrediction.prediction.confidence || 85} className="h-2" />
              </div>
            </div>

            {/* Random Forest Prediction */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Random Forest</h3>
              <p className="text-3xl font-bold text-green-700 mb-2">
                {formatCurrency(latestPrediction.prediction.randomForestPrediction || 0)}
              </p>
              <p className="text-sm text-green-600">
                Range: {formatCurrency(rfRange.min)} - {formatCurrency(rfRange.max)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>Confidence</span>
                  <span>{latestPrediction.prediction.confidence || 85}%</span>
                </div>
                <Progress value={latestPrediction.prediction.confidence || 85} className="h-2" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-900 mb-4">Feature Importance</h4>
            <div className="space-y-3">
              {latestPrediction.featureImportance && Object.entries(latestPrediction.featureImportance).length > 0 ? (
                Object.entries(latestPrediction.featureImportance).map(([feature, importance]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{feature}</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(importance as number) * 100} 
                        className="w-32 h-2"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round((importance as number) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Feature importance data not available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render based on mode
  if (mode === 'form') {
    return <PredictionForm />;
  }

  if (mode === 'results') {
    return <PredictionResults />;
  }

  if (mode === 'combined') {
    return (
      <div className={`space-y-6 ${className}`}>
        <PredictionForm />
        <PredictionResults />
      </div>
    );
  }

  return null;
}

// Export individual components for backward compatibility
export function PredictionForm(props?: { className?: string; showModelSelector?: boolean; onPredictionSuccess?: (data: any) => void }) {
  return <Prediction mode="form" {...props} />;
}

export function PredictionResults(props?: { className?: string }) {
  console.log('🔍 PredictionResults component created');
  return <Prediction mode="results" {...props} />;
}

export function CombinedPrediction(props?: { className?: string; showModelSelector?: boolean; onPredictionSuccess?: (data: any) => void }) {
  return <Prediction mode="combined" {...props} />;
}