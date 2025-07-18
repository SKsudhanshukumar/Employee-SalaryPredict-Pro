import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { departmentOptions, locationOptions, educationOptions, companySizeOptions } from "@shared/schema";

interface PredictionFormData {
  jobTitle: string;
  experience: number;
  department: string;
  location: string;
  educationLevel: string;
  companySize: string;
}

export default function PredictionForm() {
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

  const predictMutation = useMutation({
    mutationFn: async (data: PredictionFormData) => {
      const response = await apiRequest('POST', '/api/predict', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Prediction Generated",
        description: "Salary prediction has been calculated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/predictions'] });
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-inter font-semibold text-gray-900">
            Salary Prediction
          </CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              type="text"
              placeholder="e.g., Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="w-full"
            />
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
            <Select onValueChange={(value) => handleInputChange('department', value)}>
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
            <Select onValueChange={(value) => handleInputChange('location', value)}>
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
            <Label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
              Education Level
            </Label>
            <Select onValueChange={(value) => handleInputChange('educationLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select education" />
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
            <Select onValueChange={(value) => handleInputChange('companySize', value)}>
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
}
