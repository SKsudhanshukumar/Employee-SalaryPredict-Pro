import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerFastRoutes } from "./fast-routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

console.log('🚀 Starting ultra-fast prediction server...');

// Enable gzip compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Parse JSON with reasonable limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Cache headers
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

(async () => {
  try {
    console.log('📡 Registering API routes...');
    const server = await registerFastRoutes(app);

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message, service: 'fast-prediction-service' });
    });

    // Setup Vite for development or serve static files for production
    if (process.env.NODE_ENV === "development") {
      console.log('🔧 Setting up Vite development server...');
      await setupVite(app, server);
    } else {
      console.log('📦 Serving static files...');
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    const host = "127.0.0.1";
    
    server.listen(port, host, () => {
      console.log(`🚀 Ultra-fast prediction server running on http://${host}:${port}`);
      console.log('✅ Ready to process predictions in <10ms');
      console.log('📊 Health check available at: /api/health');
      console.log('🎯 Prediction endpoint: /api/predict');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();