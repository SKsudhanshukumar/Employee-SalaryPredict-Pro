import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calculator, Database, Settings, Gauge, Activity, Menu, X, TrendingUp, Target, Home, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveSection = 'dashboard' | 'prediction' | 'analytics' | 'models' | 'data';
type NavigationMode = 'sidebar' | 'mobile';

interface NavigationItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  targetId: string;
  section: ActiveSection;
  description: string;
}

interface NavigationProps {
  activeSection: ActiveSection;
  onNavigate: (sectionId: string, section: ActiveSection) => void;
  mode?: NavigationMode;
  showModelStatus?: boolean;
}

const navigationItems: NavigationItem[] = [
  { 
    icon: Gauge, 
    label: "Dashboard", 
    targetId: "stats-section", 
    section: "dashboard",
    description: "Overview & Statistics"
  },
  { 
    icon: Calculator, 
    label: "Salary Prediction", 
    targetId: "prediction-section", 
    section: "prediction",
    description: "Make Predictions"
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    targetId: "analytics-section", 
    section: "analytics",
    description: "Data Visualization"
  },
  { 
    icon: Activity, 
    label: "Model Comparison", 
    targetId: "model-metrics-section", 
    section: "models",
    description: "ML Models"
  },
  { 
    icon: Database, 
    label: "Data Upload", 
    targetId: "data-upload-section", 
    section: "data",
    description: "Manage Data"
  },
];

function SidebarNavigation({ activeSection, onNavigate, showModelStatus = true }: Omit<NavigationProps, 'mode'>) {
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-inter font-semibold text-gray-900">Quick Actions</h2>
          {/* Current Section Indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-md">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-primary capitalize">
              {activeSection === 'dashboard' ? 'Overview' : activeSection}
            </span>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.targetId, item.section)}
                className={cn(
                  "w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group",
                  isActive
                    ? "bg-blue-50 text-primary font-medium border border-blue-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                )} />
                <div className="flex-1">
                  <div className={cn(
                    "font-medium",
                    isActive ? "text-primary" : "text-gray-900"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-2" />
                )}
              </button>
            );
          })}
        </nav>

        {showModelStatus && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Model Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Linear Regression</span>
                <span className="text-xs bg-success text-white px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Random Forest</span>
                <span className="text-xs bg-success text-white px-2 py-1 rounded">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Training</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MobileNavigation({ activeSection, onNavigate }: Omit<NavigationProps, 'mode' | 'showModelStatus'>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (sectionId: string, section: ActiveSection) => {
    onNavigate(sectionId, section);
    setIsOpen(false);
  };

  const currentSection = navigationItems.find(item => item.section === activeSection);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3">
        {/* Current Section Display */}
        <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-lg">
          {currentSection && (
            <>
              <currentSection.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {currentSection.label}
              </span>
            </>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl transform transition-transform">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = activeSection === item.section;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.section}
                    onClick={() => handleNavigate(item.targetId, item.section)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-primary border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isActive ? 'text-primary' : 'text-gray-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Current Section Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Currently Viewing</div>
                <div className="flex items-center justify-center gap-2">
                  {currentSection && (
                    <>
                      <currentSection.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-primary">
                        {currentSection.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navigation({ 
  activeSection, 
  onNavigate, 
  mode = 'sidebar',
  showModelStatus = true 
}: NavigationProps) {
  if (mode === 'mobile') {
    return <MobileNavigation activeSection={activeSection} onNavigate={onNavigate} />;
  }
  
  return <SidebarNavigation activeSection={activeSection} onNavigate={onNavigate} showModelStatus={showModelStatus} />;
}

// Breadcrumb Navigation Component
function BreadcrumbNavigation({ activeSection, onNavigate }: Omit<NavigationProps, 'mode' | 'showModelStatus'>) {
  const sectionInfo = {
    dashboard: { label: 'Dashboard', description: 'Overview & Statistics' },
    prediction: { label: 'Prediction', description: 'Salary Predictions' },
    analytics: { label: 'Analytics', description: 'Data Visualization' },
    models: { label: 'Models', description: 'ML Model Comparison' },
    data: { label: 'Data', description: 'Data Management' }
  };

  const currentInfo = sectionInfo[activeSection];

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => onNavigate('stats-section', 'dashboard')}
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{currentInfo.label}</span>
          </nav>

          {/* Section Description */}
          <div className="hidden md:block">
            <p className="text-sm text-gray-600">{currentInfo.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export individual components for backward compatibility
export { SidebarNavigation as Sidebar, MobileNavigation as MobileNav, BreadcrumbNavigation as BreadcrumbNav };