import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  experience: integer("experience").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  educationLevel: text("education_level").notNull(),
  companySize: text("company_size").notNull(),
  actualSalary: real("actual_salary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  experience: integer("experience").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  educationLevel: text("education_level").notNull(),
  companySize: text("company_size").notNull(),
  linearRegressionPrediction: real("linear_regression_prediction"),
  randomForestPrediction: real("random_forest_prediction"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dataUploads = pgTable("data_uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  recordCount: integer("record_count").notNull(),
  status: text("status").notNull(), // 'processing', 'processed', 'failed'
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  linearRegressionPrediction: true,
  randomForestPrediction: true,
  confidence: true,
});

export const insertDataUploadSchema = createInsertSchema(dataUploads).omit({
  id: true,
  uploadedAt: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type DataUpload = typeof dataUploads.$inferSelect;
export type InsertDataUpload = z.infer<typeof insertDataUploadSchema>;

export const jobTitleOptions = [
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'Engineering Manager',
  'Product Manager',
  'Senior Product Manager',
  'Data Scientist',
  'Senior Data Scientist',
  'DevOps Engineer',
  'QA Engineer',
  'UX Designer',
  'UI Designer',
  'Marketing Manager',
  'Digital Marketing Specialist',
  'Content Marketing Manager',
  'Sales Representative',
  'Account Manager',
  'Sales Manager',
  'Business Development Manager',
  'HR Generalist',
  'HR Manager',
  'Recruiter',
  'Financial Analyst',
  'Accountant',
  'Finance Manager',
  'Operations Manager',
  'Project Manager',
  'Scrum Master',
  'Customer Success Manager',
  'Technical Writer'
] as const;

export const departmentOptions = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'] as const;
export const locationOptions = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Remote'] as const;
export const educationOptions = ["Bachelor's", "Master's", 'PhD', 'Associate', 'High School'] as const;
export const companySizeOptions = ['Startup (1-50)', 'Medium (51-500)', 'Large (501-5000)', 'Enterprise (5000+)'] as const;
