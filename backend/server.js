const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// Security Middleware
// ============================================
const securityMiddleware = require('./middleware/security/securityMiddleware');
securityMiddleware(app);

// ============================================
// Standard Middleware
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// Database Connection
// ============================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ============================================
// Basic Routes
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome to CampusConnect Pro API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      internships: '/api/internships',
      applications: '/api/applications',
      students: '/api/students',
      matching: '/api/matching'
    }
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API Routes
// ============================================

// Authentication routes
app.use('/api/auth', require('./routes/authRoutes'));

// Internship routes
app.use('/api/internships', require('./routes/internshipRoutes'));

// Application routes
app.use('/api/applications', require('./routes/applicationRoutes'));

// Student routes (resume upload, etc.)
app.use('/api/students', require('./routes/studentRoutes'));

// AI Matching routes (NEW)
app.use('/api/matching', require('./routes/matchingRoutes'));

// Company routes (if needed)
// app.use('/api/companies', require('./routes/companyRoutes'));

// Admin routes (if needed)
// app.use('/api/admin', require('./routes/adminRoutes'));

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage()
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ 
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false,
      message: 'File too large. Maximum size is 5MB.' 
    });
  }
  
  if (err.message === 'Invalid file type') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid file type. Only PDF and Word documents are allowed.' 
    });
  }

  // Default error
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 Backend URL: http://localhost:${PORT}`);
  console.log('=================================\n');
  console.log('📚 Available Routes:');
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Internships: http://localhost:${PORT}/api/internships`);
  console.log(`   - Applications: http://localhost:${PORT}/api/applications`);
  console.log(`   - Students: http://localhost:${PORT}/api/students`);
  console.log(`   - Matching: http://localhost:${PORT}/api/matching (NEW - AI Features)`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;