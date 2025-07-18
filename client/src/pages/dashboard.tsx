import { TrendingUp, Users, DollarSign, Target, Upload, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import PredictionForm from "@/components/prediction-form";
import PredictionResults from "@/components/prediction-results";
import DataUpload from "@/components/data-upload";
import DepartmentChart from "@/components/charts/department-chart";
import ExperienceChart from "@/components/charts/experience-chart";
import ModelComparisonChart from "@/components/charts/model-comparison-chart";
import { MLStatusBanner } from "@/components/ml-status-banner";

export default function Dashboard() {
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
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-primary font-medium border-b-2 border-primary pb-2"
              >
                Dashboard
              </button>
              <button 
                onClick={() => document.getElementById('prediction-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Prediction
              </button>
              <button 
                onClick={() => document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Analytics
              </button>
              <button 
                onClick={() => document.getElementById('data-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Data Management
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => document.getElementById('data-upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary text-white hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* ML Status Banner */}
            <MLStatusBanner />
            
            {/* Stats Cards */}
            <div id="stats-section">
              <StatsCards />
            </div>

            {/* Prediction Form */}
            <div id="prediction-section">
              <PredictionForm />
            </div>

            {/* Prediction Results */}
            <PredictionResults />

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
                    <DepartmentChart />
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
                    <ExperienceChart />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Upload Section */}
            <div id="data-upload-section">
              <DataUpload />
            </div>

            {/* Model Performance */}
            <Card id="model-metrics-section">
              <CardHeader>
                <CardTitle className="text-xl font-inter font-semibold text-gray-900">
                  Model Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Linear Regression</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">R² Score</span>
                        <span className="font-roboto-mono text-sm font-medium">0.947</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Mean Absolute Error</span>
                        <span className="font-roboto-mono text-sm font-medium">$3,420</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Root Mean Square Error</span>
                        <span className="font-roboto-mono text-sm font-medium">$4,850</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Random Forest</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">R² Score</span>
                        <span className="font-roboto-mono text-sm font-medium">0.968</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Mean Absolute Error</span>
                        <span className="font-roboto-mono text-sm font-medium">$2,780</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Root Mean Square Error</span>
                        <span className="font-roboto-mono text-sm font-medium">$3,920</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Model Comparison</h4>
                  <div className="h-64">
                    <ModelComparisonChart />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
