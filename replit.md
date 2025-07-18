# SalaryPredict Pro - ML-Powered Salary Analysis Platform

## Overview

SalaryPredict Pro is a full-stack web application that provides machine learning-powered salary predictions and analytics. The application combines a React frontend with an Express.js backend to deliver real-time salary predictions based on job characteristics like title, experience, department, location, education level, and company size.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js with TypeScript for API services
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Framework**: Shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management

### Monorepo Structure
The project is organized as a monorepo with three main directories:
- `client/`: React frontend application
- `server/`: Express.js backend API
- `shared/`: Common TypeScript types and database schemas

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query for server state, local state with React hooks

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **File Uploads**: Multer for handling CSV data uploads
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom logging for API requests

### ML Service Layer
- **Simulation Layer**: MLService class that simulates machine learning predictions
- **Models**: Simulated Linear Regression and Random Forest algorithms
- **Features**: Experience, department, location, education, and company size weighting
- **Metrics**: R² score, MAE, and RMSE simulation for model comparison

## Data Flow

### Database Schema
Three main entities managed through Drizzle ORM:
1. **Employees**: Stores actual employee data with salary information
2. **Predictions**: Stores prediction requests and ML model results
3. **Data Uploads**: Tracks CSV file uploads and processing status

### Prediction Workflow
1. User submits prediction form with job characteristics
2. Backend validates input using Zod schemas
3. MLService calculates predictions using simulated algorithms
4. Results stored in database and returned to client
5. Frontend displays predictions with confidence scores and feature importance

### Data Upload Process
1. User uploads CSV file through drag-and-drop interface
2. Multer processes file upload with 10MB size limit
3. Backend parses CSV and validates employee records
4. Data stored in database with processing status tracking
5. Real-time status updates via polling

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **zod**: Runtime type validation
- **recharts**: Chart library for data visualization

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### File Upload & Processing
- **multer**: Multipart form data handling
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **API Proxy**: Vite proxies API requests to Express server
- **Database**: PostgreSQL via environment variable (DATABASE_URL)
- **Build Process**: TypeScript compilation with Vite bundling

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves frontend assets in production
- **Database Migrations**: Drizzle Kit manages schema changes

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **TypeScript Paths**: Shared aliases for clean imports (@, @shared)
- **Build Scripts**: Separate dev/build/start commands for different environments

### Database Strategy
The application is configured for PostgreSQL but uses an abstracted storage interface (IStorage) that allows for both in-memory development storage and PostgreSQL production storage. The Drizzle configuration expects PostgreSQL with connection via DATABASE_URL environment variable.