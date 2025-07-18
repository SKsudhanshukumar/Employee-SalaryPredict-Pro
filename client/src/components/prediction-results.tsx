import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

export default function PredictionResults() {
  const { data: predictions, isLoading } = useQuery<PredictionWithFeatures[]>({
    queryKey: ["/api/predictions"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <Card>
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
      <Card>
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

  const lrRange = calculateRange(latestPrediction.prediction.linearRegressionPrediction, latestPrediction.prediction.confidence);
  const rfRange = calculateRange(latestPrediction.prediction.randomForestPrediction, latestPrediction.prediction.confidence);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-inter font-semibold text-gray-900">
          Prediction Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Linear Regression</h3>
            <div className="text-3xl font-inter font-bold text-primary mb-2">
              {formatCurrency(latestPrediction.prediction.linearRegressionPrediction)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Confidence:</span>{" "}
              <span className="text-success font-medium">{latestPrediction.prediction.confidence}%</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Range:</span>{" "}
              <span>{formatCurrency(lrRange.min)} - {formatCurrency(lrRange.max)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Random Forest</h3>
            <div className="text-3xl font-inter font-bold text-success mb-2">
              {formatCurrency(latestPrediction.prediction.randomForestPrediction)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Confidence:</span>{" "}
              <span className="text-success font-medium">{Math.min(95, latestPrediction.prediction.confidence + 3)}%</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Range:</span>{" "}
              <span>{formatCurrency(rfRange.min)} - {formatCurrency(rfRange.max)}</span>
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
}
