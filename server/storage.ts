import { 
  employees, 
  predictions, 
  dataUploads,
  type Employee, 
  type InsertEmployee,
  type Prediction,
  type InsertPrediction,
  type DataUpload,
  type InsertDataUpload
} from "@shared/schema";

export interface IStorage {
  // Employee operations
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(): Promise<Employee[]>;
  getEmployeesByDepartment(): Promise<Record<string, Employee[]>>;
  
  // Prediction operations
  createPrediction(prediction: Omit<Prediction, 'id' | 'createdAt'>): Promise<Prediction>;
  getPredictions(limit?: number): Promise<Prediction[]>;
  
  // Data upload operations
  createDataUpload(upload: InsertDataUpload): Promise<DataUpload>;
  getDataUploads(): Promise<DataUpload[]>;
  updateDataUploadStatus(id: number, status: string): Promise<void>;
  
  // Analytics
  getAverageSalaryByDepartment(): Promise<Record<string, number>>;
  getSalaryByExperienceRange(): Promise<Record<string, number>>;
  getTotalEmployeeCount(): Promise<number>;
  getAverageSalary(): Promise<number>;
  
  // Training data management
  updateTrainingDataCount(additionalRecords: number): void;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee> = new Map();
  private predictions: Map<number, Prediction> = new Map();
  private dataUploads: Map<number, DataUpload> = new Map();
  private currentEmployeeId = 1;
  private currentPredictionId = 1;
  private currentUploadId = 1;
  private trainingDataCount = 0; // Track training data count from CSV files

  constructor() {
    this.seedData();
    this.loadTrainingDataCount();
  }

  private seedData() {
    const sampleEmployees: Omit<Employee, 'id'>[] = [
      {
        jobTitle: 'Software Engineer',
        experience: 5,
        department: 'Engineering',
        location: 'San Francisco',
        educationLevel: "Bachelor's",
        companySize: 'Large (501-5000)',
        actualSalary: 120000,
        createdAt: new Date(),
      },
      {
        jobTitle: 'Marketing Manager',
        experience: 7,
        department: 'Marketing',
        location: 'New York',
        educationLevel: "Master's",
        companySize: 'Medium (51-500)',
        actualSalary: 85000,
        createdAt: new Date(),
      },
      {
        jobTitle: 'Sales Representative',
        experience: 3,
        department: 'Sales',
        location: 'Chicago',
        educationLevel: "Bachelor's",
        companySize: 'Startup (1-50)',
        actualSalary: 65000,
        createdAt: new Date(),
      },
    ];

    sampleEmployees.forEach(emp => {
      const employee: Employee = { ...emp, id: this.currentEmployeeId++ };
      this.employees.set(employee.id, employee);
    });
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: this.currentEmployeeId++,
      createdAt: new Date(),
      actualSalary: employee.actualSalary ?? null,
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployeesByDepartment(): Promise<Record<string, Employee[]>> {
    const employees = Array.from(this.employees.values());
    const grouped: Record<string, Employee[]> = {};
    
    employees.forEach(emp => {
      if (!grouped[emp.department]) {
        grouped[emp.department] = [];
      }
      grouped[emp.department].push(emp);
    });
    
    return grouped;
  }

  async createPrediction(prediction: Omit<Prediction, 'id' | 'createdAt'>): Promise<Prediction> {
    const newPrediction: Prediction = {
      ...prediction,
      id: this.currentPredictionId++,
      createdAt: new Date(),
    };
    this.predictions.set(newPrediction.id, newPrediction);
    return newPrediction;
  }

  async getPredictions(limit = 10): Promise<Prediction[]> {
    const allPredictions = Array.from(this.predictions.values());
    return allPredictions.slice(-limit).reverse();
  }

  async createDataUpload(upload: InsertDataUpload): Promise<DataUpload> {
    const newUpload: DataUpload = {
      ...upload,
      id: this.currentUploadId++,
      uploadedAt: new Date(),
    };
    this.dataUploads.set(newUpload.id, newUpload);
    return newUpload;
  }

  async getDataUploads(): Promise<DataUpload[]> {
    return Array.from(this.dataUploads.values()).reverse();
  }

  async updateDataUploadStatus(id: number, status: string): Promise<void> {
    const upload = this.dataUploads.get(id);
    if (upload) {
      upload.status = status;
      this.dataUploads.set(id, upload);
    }
  }

  async getAverageSalaryByDepartment(): Promise<Record<string, number>> {
    const employees = Array.from(this.employees.values());
    const deptSalaries: Record<string, number[]> = {};
    
    employees.forEach(emp => {
      if (emp.actualSalary) {
        if (!deptSalaries[emp.department]) {
          deptSalaries[emp.department] = [];
        }
        deptSalaries[emp.department].push(emp.actualSalary);
      }
    });
    
    const avgSalaries: Record<string, number> = {};
    Object.entries(deptSalaries).forEach(([dept, salaries]) => {
      avgSalaries[dept] = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
    });
    
    return avgSalaries;
  }

  async getSalaryByExperienceRange(): Promise<Record<string, number>> {
    const employees = Array.from(this.employees.values());
    const expRanges: Record<string, number[]> = {
      '0-2': [],
      '3-5': [],
      '6-10': [],
      '11-15': [],
      '16-20': [],
      '20+': []
    };
    
    employees.forEach(emp => {
      if (emp.actualSalary) {
        const exp = emp.experience;
        if (exp <= 2) expRanges['0-2'].push(emp.actualSalary);
        else if (exp <= 5) expRanges['3-5'].push(emp.actualSalary);
        else if (exp <= 10) expRanges['6-10'].push(emp.actualSalary);
        else if (exp <= 15) expRanges['11-15'].push(emp.actualSalary);
        else if (exp <= 20) expRanges['16-20'].push(emp.actualSalary);
        else expRanges['20+'].push(emp.actualSalary);
      }
    });
    
    const avgByRange: Record<string, number> = {};
    Object.entries(expRanges).forEach(([range, salaries]) => {
      avgByRange[range] = salaries.length > 0 
        ? salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length 
        : 0;
    });
    
    return avgByRange;
  }

  async getTotalEmployeeCount(): Promise<number> {
    // Return training data count + newly added employees (excluding seed data)
    const seedDataCount = 3; // We have 3 seed employees
    const newEmployeesCount = Math.max(0, this.employees.size - seedDataCount);
    return this.trainingDataCount + newEmployeesCount;
  }

  async getAverageSalary(): Promise<number> {
    const employees = Array.from(this.employees.values());
    const salariesWithValue = employees.filter(emp => emp.actualSalary).map(emp => emp.actualSalary!);
    
    if (salariesWithValue.length === 0) return 0;
    
    return salariesWithValue.reduce((sum, sal) => sum + sal, 0) / salariesWithValue.length;
  }

  private async loadTrainingDataCount(): Promise<void> {
    try {
      // Import DataProcessor to count training data
      const { DataProcessor } = await import('./data-processor');
      const records = await DataProcessor.loadDatasets();
      this.trainingDataCount = records.length;
      console.log(`📊 Loaded training data count: ${this.trainingDataCount} records`);
    } catch (error) {
      console.warn('Failed to load training data count:', error);
      this.trainingDataCount = 0;
    }
  }

  // Method to update training data count when new data is uploaded
  updateTrainingDataCount(additionalRecords: number): void {
    this.trainingDataCount += additionalRecords;
    console.log(`📊 Updated training data count: ${this.trainingDataCount} records`);
  }
}

export const storage = new MemStorage();
