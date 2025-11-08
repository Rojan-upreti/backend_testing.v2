import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import appRoutes from './routes/apps.js';
import githubRoutes from './routes/github.js';
import auditRoutes from './routes/audit.js';
import cliRoutes from './routes/cli.js';

// Verify CLI routes are loaded
if (!cliRoutes) {
  console.error('Warning: CLI routes failed to load');
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      apps: '/api/apps',
      github: '/api/github',
      audit: '/api/audit',
      cli: '/api/cli'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// App routes
app.use('/api/apps', appRoutes);

// GitHub routes
app.use('/api/github', githubRoutes);

// Audit routes
app.use('/api/audit', auditRoutes);

// CLI routes
app.use('/api/cli', cliRoutes);
console.log('CLI routes registered at /api/cli');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.method} ${req.path} was not found on this server`,
    availableEndpoints: {
      health: 'GET /health',
      root: 'GET /',
      auth: '/api/auth/*',
      apps: '/api/apps/*',
      github: '/api/github/*',
      audit: '/api/audit/*',
      cli: '/api/cli/*'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

