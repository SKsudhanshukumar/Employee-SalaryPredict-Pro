import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load heavy components
const ComprehensiveModelComparison = lazy(() => import('./charts/comprehensive-model-comparison'));
const DepartmentChart = lazy(() => import('./charts/analytics-chart').then(module => ({ default: module.DepartmentChart })));
const ExperienceChart = lazy(() => import('./charts/analytics-chart').then(module => ({ default: module.ExperienceChart })));
const DataUpload = lazy(() => import('./data-upload'));

// Loading fallback component
const ComponentSkeleton = ({ height = "h-64" }: { height?: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className={`animate-pulse bg-gray-200 rounded ${height}`}></div>
    </CardContent>
  </Card>
);

// Wrapped lazy components with suspense
export const LazyComprehensiveModelComparison = () => (
  <Suspense fallback={<ComponentSkeleton height="h-96" />}>
    <ComprehensiveModelComparison />
  </Suspense>
);

export const LazyDepartmentChart = () => (
  <Suspense fallback={<ComponentSkeleton />}>
    <DepartmentChart />
  </Suspense>
);

export const LazyExperienceChart = () => (
  <Suspense fallback={<ComponentSkeleton />}>
    <ExperienceChart />
  </Suspense>
);

export const LazyDataUpload = () => (
  <Suspense fallback={<ComponentSkeleton height="h-80" />}>
    <DataUpload />
  </Suspense>
);