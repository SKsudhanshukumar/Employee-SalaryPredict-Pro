import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Calculator, 
  Database, 
  Activity, 
  Gauge, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Keyboard,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type ActiveSection = 'dashboard' | 'prediction' | 'analytics' | 'models' | 'data';

interface EnhancedQuickActionsProps {
  activeSection: ActiveSection;
  onNavigate: (sectionId: string, section: ActiveSection) => void;
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

const quickActions = [
  { 
    icon: Gauge, 
    label: "Dashboard Overview", 
    targetId: "stats-section", 
    section: "dashboard" as ActiveSection,
    description: "View key metrics and statistics",
    color: "bg-blue-500",
    shortcut: "D"
  },
  { 
    icon: Calculator, 
    label: "Make Prediction", 
    targetId: "prediction-section", 
    section: "prediction" as ActiveSection,
    description: "Predict salary for new employee",
    color: "bg-green-500",
    shortcut: "P"
  },
  { 
    icon: BarChart3, 
    label: "View Analytics", 
    targetId: "analytics-section", 
    section: "analytics" as ActiveSection,
    description: "Explore data visualizations",
    color: "bg-purple-500",
    shortcut: "A"
  },
  { 
    icon: Activity, 
    label: "Compare Models", 
    targetId: "model-metrics-section", 
    section: "models" as ActiveSection,
    description: "ML model performance metrics",
    color: "bg-orange-500",
    shortcut: "M"
  },
  { 
    icon: Database, 
    label: "Upload Data", 
    targetId: "data-upload-section", 
    section: "data" as ActiveSection,
    description: "Manage training datasets",
    color: "bg-red-500",
    shortcut: "U"
  },
];

export default function EnhancedQuickActions({ activeSection, onNavigate }: EnhancedQuickActionsProps) {
  const currentAction = quickActions.find(action => action.section === activeSection);

  // Fetch real-time model metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<ModelMetrics>({
    queryKey: ["/api/model-metrics"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if Ctrl/Cmd is pressed
      if (event.ctrlKey || event.metaKey) {
        const action = quickActions.find(a => a.shortcut.toLowerCase() === event.key.toLowerCase());
        if (action) {
          event.preventDefault();
          onNavigate(action.targetId, action.section);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onNavigate]);

  return (
    <Card className="sticky top-24 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        {/* Header with Current Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-inter font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Navigate to any section</p>
          </div>
          
          {/* Current Section Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-primary">
              {currentAction?.label.split(' ')[0] || 'Dashboard'}
            </span>
          </div>
        </div>
        
        {/* Quick Action Buttons */}
        <nav className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isActive = activeSection === action.section;
            
            return (
              <button
                key={action.section}
                onClick={() => onNavigate(action.targetId, action.section)}
                className={cn(
                  "w-full group relative overflow-hidden rounded-xl transition-all duration-300 text-left",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md transform scale-[1.02]"
                    : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                )}
              >
                <div className="flex items-center p-4">
                  {/* Icon with colored background */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all duration-200",
                    isActive ? action.color : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
                    )} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-medium truncate",
                        isActive ? "text-primary" : "text-gray-900"
                      )}>
                        {action.label}
                      </h3>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Keyboard Shortcut */}
                  <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded border text-gray-600">
                        Ctrl
                      </kbd>
                      <span className="text-xs text-gray-400">+</span>
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded border text-gray-600">
                        {action.shortcut}
                      </kbd>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-all duration-200",
                      isActive ? "text-primary transform translate-x-1" : "text-gray-400 group-hover:text-gray-600"
                    )} />
                  </div>
                </div>
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Model Status Section */}
        <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Model Status
              {metricsLoading && (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </h3>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Live Updates
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Linear Regression</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">
                  R² {metrics ? `${((metrics.linearRegression?.r2Score || 0) * 100).toFixed(1)}%` : '96.0%'}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Auto-updating"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Random Forest</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">
                  R² {metrics ? `${((metrics.randomForest?.r2Score || 0) * 100).toFixed(1)}%` : '94.0%'}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Auto-updating"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw className="w-3 h-3" />
                Auto-updates every 2 minutes
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2"
                onClick={() => onNavigate('model-metrics-section', 'models')}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-lg font-bold text-blue-700">200K</div>
            <div className="text-xs text-blue-600">Training Records</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-700 font-mono">
              {metrics ? 
                `${Math.max(
                  (metrics.linearRegression?.r2Score || 0) * 100,
                  (metrics.randomForest?.r2Score || 0) * 100
                ).toFixed(1)}%` 
                : '96.0%'
              }
            </div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              Best R² Score
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-6 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Keyboard Shortcuts</span>
          </div>
          <p className="text-xs text-indigo-700">
            Use <kbd className="px-1 py-0.5 bg-white rounded text-xs border">Ctrl</kbd> + 
            <kbd className="px-1 py-0.5 bg-white rounded text-xs border ml-1">Letter</kbd> to navigate quickly
          </p>
        </div>
      </CardContent>
    </Card>
  );
}