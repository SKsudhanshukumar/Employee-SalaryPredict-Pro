import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings } from "lucide-react";
import ModelMetricsChart from "./model-metrics-chart";

type BarSize = 'small' | 'medium' | 'large' | 'extra-large';
type Spacing = 'tight' | 'normal' | 'wide';
type ConfigMode = 'simple' | 'advanced' | 'presets';

interface BarChartConfiguratorProps {
  mode?: ConfigMode;
  showControls?: boolean;
  defaultBarSize?: BarSize;
  defaultSpacing?: Spacing;
}

export default function BarChartConfigurator({
  mode = 'simple',
  showControls = false,
  defaultBarSize = 'medium',
  defaultSpacing = 'normal'
}: BarChartConfiguratorProps) {
  const [selectedSize, setSelectedSize] = useState<BarSize>(defaultBarSize);
  const [selectedSpacing, setSelectedSpacing] = useState<Spacing>(defaultSpacing);
  const [controlsVisible, setControlsVisible] = useState(showControls);
  const [activePreset, setActivePreset] = useState<string>('standard');

  const sizeOptions = {
    small: { barWidth: 25, spacing: 15, label: 'Small', description: '25px bars', maxBarSize: 30 },
    medium: { barWidth: 40, spacing: 20, label: 'Medium', description: '40px bars', maxBarSize: 45 },
    large: { barWidth: 55, spacing: 25, label: 'Large', description: '55px bars', maxBarSize: 60 },
    'extra-large': { barWidth: 70, spacing: 30, label: 'Extra Large', description: '70px bars', maxBarSize: 80 }
  };

  const spacingOptions: { value: Spacing; label: string; description: string }[] = [
    { value: 'tight', label: 'Tight', description: 'Minimal spacing (20%)' },
    { value: 'normal', label: 'Normal', description: 'Standard spacing (30%)' },
    { value: 'wide', label: 'Wide', description: 'Generous spacing (40%)' }
  ];

  const presets = [
    {
      id: 'compact',
      name: "Compact View",
      description: "Small bars with tight spacing - good for dashboards",
      barSize: 'small' as const,
      spacing: 'tight' as const
    },
    {
      id: 'standard',
      name: "Standard View", 
      description: "Medium bars with normal spacing - balanced appearance",
      barSize: 'medium' as const,
      spacing: 'normal' as const
    },
    {
      id: 'presentation',
      name: "Presentation View",
      description: "Large bars with wide spacing - great for presentations",
      barSize: 'large' as const,
      spacing: 'wide' as const
    },
    {
      id: 'bold',
      name: "Bold View",
      description: "Extra large bars with normal spacing - maximum impact",
      barSize: 'extra-large' as const,
      spacing: 'normal' as const
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setSelectedSize(preset.barSize);
    setSelectedSpacing(preset.spacing);
    setActivePreset(preset.id);
  };

  const currentConfig = sizeOptions[selectedSize];

  if (mode === 'presets') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bar Chart Size Presets</h2>
          <p className="text-gray-600">Choose the bar size configuration that works best for your needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {presets.map((preset, index) => (
            <Card 
              key={index} 
              className={`border-2 hover:border-blue-200 transition-colors cursor-pointer ${
                activePreset === preset.id ? 'border-blue-300 bg-blue-50' : ''
              }`}
              onClick={() => handlePresetSelect(preset)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                  {preset.name}
                  {activePreset === preset.id && (
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ModelMetricsChart 
                    barSize={preset.barSize}
                    spacing={preset.spacing}
                    layout="split"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Size Reference Guide */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Size Reference Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Bar Sizes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Small:</strong> 30px max width</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Medium:</strong> 45px max width</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Large:</strong> 60px max width</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-3 bg-blue-500 rounded"></div>
                    <span><strong>Extra Large:</strong> 80px max width</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Spacing Options</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Tight:</strong> 20% gap between categories</div>
                  <div><strong>Normal:</strong> 30% gap between categories</div>
                  <div><strong>Wide:</strong> 40% gap between categories</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Model Performance Metrics
          </CardTitle>
          
          {mode === 'simple' ? (
            <Badge variant="outline" className="text-xs">
              {currentConfig.label} ({currentConfig.description})
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setControlsVisible(!controlsVisible)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {controlsVisible ? 'Hide' : 'Show'} Controls
            </Button>
          )}
        </div>
        
        {mode === 'simple' && (
          <div className="flex gap-2 pt-2">
            {Object.entries(sizeOptions).map(([key, config]) => (
              <Button
                key={key}
                variant={selectedSize === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSize(key as BarSize)}
                className="text-xs"
              >
                {config.label}
              </Button>
            ))}
          </div>
        )}
        
        {mode === 'advanced' && controlsVisible && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bar Size Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Bar Size</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(sizeOptions).map(([key, option]) => (
                    <Button
                      key={key}
                      variant={selectedSize === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(key as BarSize)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {sizeOptions[selectedSize]?.description}
                </p>
              </div>

              {/* Spacing Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Bar Spacing</h4>
                <div className="grid grid-cols-3 gap-2">
                  {spacingOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedSpacing === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSpacing(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {spacingOptions.find(opt => opt.value === selectedSpacing)?.description}
                </p>
              </div>
            </div>

            {/* Current Settings Display */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Current:</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedSize} bars
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedSpacing} spacing
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={mode === 'advanced' ? "h-96" : "h-80"}>
          <ModelMetricsChart 
            barSize={selectedSize}
            spacing={selectedSpacing}
            layout={mode === 'simple' ? 'controlled' : 'split'}
            barWidth={currentConfig.barWidth}
            barSpacing={currentConfig.spacing}
          />
        </div>
      </CardContent>
    </Card>
  );
}