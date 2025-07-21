import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  label: string;
  completed: boolean;
  duration?: number;
}

interface ProgressiveLoaderProps {
  steps: LoadingStep[];
  onComplete?: () => void;
}

export default function ProgressiveLoader({ steps, onComplete }: ProgressiveLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      const duration = step.duration || 1000;
      
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setProgress(((currentStep + 1) / steps.length) * 100);
      }, duration);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentStep, steps, onComplete]);

  const completedSteps = steps.slice(0, currentStep);
  const activeStep = steps[currentStep];
  const remainingSteps = steps.slice(currentStep + 1);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Loading Dashboard</h3>
            <p className="text-sm text-gray-600">Optimizing your experience...</p>
          </div>

          <Progress value={progress} className="w-full" />

          <div className="space-y-2">
            {/* Completed steps */}
            {completedSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{step.label}</span>
              </div>
            ))}

            {/* Active step */}
            {activeStep && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{activeStep.label}</span>
              </div>
            )}

            {/* Remaining steps */}
            {remainingSteps.map((step) => (
              <div key={step.id} className="flex items-center space-x-2 text-gray-400">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                <span className="text-sm">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </CardContent>
    </Card>
  );
}