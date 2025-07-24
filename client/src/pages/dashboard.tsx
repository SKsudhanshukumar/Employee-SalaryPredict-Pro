import { useState, useEffect } from "react";
import { TrendingUp, Users, DollarSign, Target, Upload, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation, { BreadcrumbNav } from "@/components/navigation";
import EnhancedQuickActions from "@/components/enhanced-quick-actions";
import { StatsCards, MLStatusBanner } from "@/components/status-display";
import { PredictionForm, PredictionResults } from "@/components/prediction";
import { LazyDepartmentChart, LazyExperienceChart, LazyComprehensiveModelComparison, LazyDataUpload } from "@/components/lazy-components";
import ErrorBoundary from "@/components/error-boundary";

type ActiveSection = 'dashboard' | 'prediction' | 'analytics' | 'models' | 'data';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  // Scroll to section and update active state
  const scrollToSection = (sectionId: string, section: ActiveSection) => {
    setActiveSection(section);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detect which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'stats-section', name: 'dashboard' as ActiveSection },
        { id: 'prediction-section', name: 'prediction' as ActiveSection },
        { id: 'analytics-section', name: 'analytics' as ActiveSection },
        { id: 'model-metrics-section', name: 'models' as ActiveSection },
        { id: 'data-upload-section', name: 'data' as ActiveSection },
      ];

      const scrollPosition = window.scrollY + 100; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].name);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get navigation button styles
  const getNavButtonClass = (section: ActiveSection) => {
    return activeSection === section
      ? "text-primary font-medium border-b-2 border-primary pb-2 transition-all duration-200"
      : "text-gray-500 hover:text-gray-700 transition-colors duration-200 pb-2";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-inter font-semibold text-gray-900">SalaryPredict Pro</h1>
                <p className="text-sm text-gray-500">ML-Powered Salary Analysis</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection('stats-section', 'dashboard')}
                className={getNavButtonClass('dashboard')}
              >
                Dashboard
              </button>
              <button 
                onClick={() => scrollToSection('prediction-section', 'prediction')}
                className={getNavButtonClass('prediction')}
              >
                Prediction
              </button>
              <button 
                onClick={() => scrollToSection('analytics-section', 'analytics')}
                className={getNavButtonClass('analytics')}
              >
                Analytics
              </button>
              <button 
                onClick={() => scrollToSection('model-metrics-section', 'models')}
                className={getNavButtonClass('models')}
              >
                Models
              </button>
              <button 
                onClick={() => scrollToSection('data-upload-section', 'data')}
                className={getNavButtonClass('data')}
              >
                Data
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              {/* Current Section Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-primary capitalize">
                  {activeSection === 'dashboard' ? 'Overview' : activeSection}
                </span>
              </div>
              
              <Button 
                onClick={() => scrollToSection('data-upload-section', 'data')}
                className="bg-primary text-white hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              
              {/* Mobile Navigation */}
              <Navigation 
                mode="mobile"
                activeSection={activeSection}
                onNavigate={scrollToSection}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <BreadcrumbNav 
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <ErrorBoundary>
              <EnhancedQuickActions 
                activeSection={activeSection}
                onNavigate={scrollToSection}
              />
            </ErrorBoundary>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* ML Status Banner */}
            <MLStatusBanner />
            
            {/* Stats Cards */}
            <div id="stats-section">
              <StatsCards />
            </div>

            {/* Prediction Form and Results */}
            <div id="prediction-section">
              <PredictionForm />
              <div className="mt-6">
                <PredictionResults />
              </div>
            </div>

            {/* Data Visualization */}
            <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-inter font-semibold text-gray-900">
                    Salary Distribution by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <LazyDepartmentChart />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-inter font-semibold text-gray-900">
                    Experience vs Salary Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <LazyExperienceChart />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comprehensive Model Performance Analysis */}
            <div id="model-metrics-section">
              <LazyComprehensiveModelComparison />
            </div>

            {/* Data Upload Section */}
            <div id="data-upload-section">
              <LazyDataUpload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
