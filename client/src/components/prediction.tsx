import { useState } from "react";
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
}

export default function Prediction({ 
  mode, 
  showModelSelector = true,
  className = ""
}: PredictionProps) {
  const [formData, setFormData] = useState<PredictionFormData>({
    jobTitle: '',
    experience: 0,
    department: '',
    location: '',
    educationLevel: '',
    companySize: '',
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch predictions for results display
  const { data: predictions, isLoading: resultsLoading, refetch } = useQuery<PredictionWithFeatures[]>({
    queryKey: ["/api/predictions"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/predictions');
      return response.json();
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: mode === 'results' || mode === 'combined'
  });

  const predictMutation = useMutation({
    mutationFn: async (data: PredictionFormData) => {
      const response = await apiRequest('POST', '/api/predict', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Prediction Generated",
        description: `New salary prediction: $${data.prediction.linearRegressionPrediction.toLocaleString()}`,
      });
      
      // Update cache with new prediction
      queryClient.setQueryData(['/api/predictions'], (oldData: any) => {
        const newPrediction = { prediction: data.prediction, featureImportance: data.featureImportance };
        if (!oldData) return [newPrediction];
        return [newPrediction, ...oldData];
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/predictions'],
        refetchType: 'active'
      });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Failed to generate salary prediction.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.department || !formData.location || 
        !formData.educationLevel || !formData.companySize || formData.experience < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    predictMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PredictionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
              className="bg-primary text-white hover:bg-blue-700 px-8 py-3"
              disabled={predictMutation.isPending}
            >
              <Calculator className="w-4 h-4 mr-2" />
              {predictMutation.isPending ? 'Predicting...' : 'Predict Salary'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  // Results component
  const PredictionResults = () => {
    if (resultsLoading) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-xl font-inter font-semibold text-gray-900">
              Prediction Results
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
            </div>
          </CardContent>
        </Card>
      );
    }

    const latestPrediction = predictions[0];
    const lrRange = calculateRange(latestPrediction.prediction.linearRegressionPrediction, latestPrediction.prediction.confidence);
    const rfRange = calculateRange(latestPrediction.prediction.randomForestPrediction, latestPrediction.prediction.confidence);

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
                {formatCurrency(latestPrediction.prediction.linearRegressionPrediction)}
              </p>
              <p className="text-sm text-blue-600">
                Range: {formatCurrency(lrRange.min)} - {formatCurrency(lrRange.max)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-blue-600 mb-1">
                  <span>Confidence</span>
                  <span>{latestPrediction.prediction.confidence}%</span>
                </div>
                <Progress value={latestPrediction.prediction.confidence} className="h-2" />
              </div>
            </div>

            {/* Random Forest Prediction */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Random Forest</h3>
              <p className="text-3xl font-bold text-green-700 mb-2">
                {formatCurrency(latestPrediction.prediction.randomForestPrediction)}
              </p>
              <p className="text-sm text-green-600">
                Range: {formatCurrency(rfRange.min)} - {formatCurrency(rfRange.max)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>Confidence</span>
                  <span>{latestPrediction.prediction.confidence}%</span>
                </div>
                <Progress value={latestPrediction.prediction.confidence} className="h-2" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-900 mb-4">Feature Importance</h4>
            <div className="space-y-3">
              {Object.entries(latestPrediction.featureImportance).map(([feature, importance]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{feature}</span>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={importance * 100} 
                      className="w-32 h-2"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(importance * 100)}%
                    </span>
                  </div>
                </div>
              ))}
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
export function PredictionForm(props?: { className?: string; showModelSelector?: boolean }) {
  return <Prediction mode="form" {...props} />;
}

export function PredictionResults(props?: { className?: string }) {
  return <Prediction mode="results" {...props} />;
}

export function CombinedPrediction(props?: { className?: string; showModelSelector?: boolean }) {
  return <Prediction mode="combined" {...props} />;
}