import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DataUpload {
  id: number;
  filename: string;
  recordCount: number;
  status: string;
  uploadedAt: string;
}

export default function DataUpload() {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: uploads, isLoading } = useQuery<DataUpload[]>({
    queryKey: ["/api/data-uploads"],
    refetchInterval: (data) => {
      // Only poll if there are uploads currently being processed
      const hasProcessingUploads = Array.isArray(data) && data.some(upload => upload.status === 'processing');
      return hasProcessingUploads ? 3000 : false;
    },
    refetchIntervalInBackground: false, // Don't poll when tab is not active
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-data', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File Uploaded Successfully",
        description: `Processing ${data.recordCount} records...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/data-uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dropdown-options'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-success text-gray-400';
      case 'processing':
        return 'bg-warning text-gray-400';
      case 'failed':
        return 'bg-error text-gray-400';
      default:
        return 'bg-gray-500 text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="min-h-[600px]">
      <CardHeader className="pb-8">
        <CardTitle className="text-2xl font-inter font-semibold text-gray-900">
          Training Data Management
        </CardTitle>
        <p className="text-gray-600 mt-2">Upload and manage your training datasets for machine learning models</p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer min-h-[350px] flex flex-col justify-center ${
              dragActive
                ? "border-primary bg-blue-50"
                : "border-gray-300 hover:border-primary"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Training Data</h3>
            <p className="text-gray-600 mb-6 text-base">Upload CSV files with employee data for model training</p>
            <Button 
              className="bg-primary text-white hover:bg-blue-700 px-8 py-3 text-base"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Choose File'}
            </Button>
            <p className="text-sm text-gray-500 mt-4">Supports CSV files up to 10MB</p>
            <div className="mt-6 text-xs text-gray-400">
              <p>Expected columns: Name, Age, Department, Experience, Salary</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Recent Uploads */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Recent Uploads</h4>
              <p className="text-sm text-gray-600">Track your uploaded datasets and their processing status</p>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-40"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="w-20 h-7 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : uploads && uploads.length > 0 ? (
                uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-6 h-6 text-success" />
                      <div>
                        <p className="text-base font-medium text-gray-900">{upload.filename}</p>
                        <p className="text-sm text-gray-500">
                          {upload.recordCount} records • {formatDate(upload.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm px-3 py-1 rounded-full capitalize font-medium ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </span>
                      <button className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base">No uploads yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload your first dataset to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Data Management Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">
                  {uploads?.reduce((sum, upload) => sum + upload.recordCount, 0) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Processed Files</p>
                <p className="text-2xl font-bold text-green-900">
                  {uploads?.filter(upload => upload.status === 'processed').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Files</p>
                <p className="text-2xl font-bold text-purple-900">
                  {uploads?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Data Format Guidelines */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Data Format Guidelines</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-800 mb-3">Required Columns</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span><strong>Name:</strong> Employee full name</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span><strong>Age:</strong> Employee age (numeric)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span><strong>Department:</strong> Department name</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span><strong>Experience:</strong> Years of experience</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span><strong>Salary:</strong> Annual salary (numeric)</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-3">File Requirements</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>CSV format only</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>UTF-8 encoding recommended</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Header row required</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>No empty rows or columns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
