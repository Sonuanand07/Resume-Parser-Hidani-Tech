/**
 * Main Application Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const databaseService = require('./database/databaseService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: process.env.MAX_UPLOAD_SIZE || '10mb' }));
app.use(bodyParser.urlencoded({ limit: process.env.MAX_UPLOAD_SIZE || '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static files
app.use(express.static('public'));

// API routes
app.use('/api', apiRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Resume Parsing and Job Matching System',
    version: '1.0.0',
    description: 'A rule-based system for parsing resumes and matching them against job descriptions without using LLMs',
    endpoints: {
      parsing: {
        'POST /api/parse-resume': 'Parse a resume and extract structured information',
        'POST /api/parse-job-description': 'Parse a job description and extract structured information',
      },
      matching: {
        'POST /api/match-resume-to-jobs': 'Match a resume against multiple job descriptions',
      },
      retrieval: {
        'GET /api/resumes': 'Get all saved resumes',
        'GET /api/resumes/:id': 'Get a specific resume with its matches',
        'GET /api/jobs': 'Get all saved job descriptions',
        'GET /api/jobs/:jobId': 'Get a specific job description',
      },
      deletion: {
        'DELETE /api/resumes/:id': 'Delete a resume',
        'DELETE /api/jobs/:jobId': 'Delete a job description',
      },
      health: {
        'GET /api/health': 'Health check endpoint',
      },
    },
    example_request: {
      method: 'POST',
      endpoint: '/api/match-resume-to-jobs',
      body: {
        resumeText: 'John Doe... (resume content)',
        jobs: [
          {
            text: 'Backend Developer... (job description)',
            jobId: 'JD001',
          },
        ],
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize database
    await databaseService.init();
    console.log('Database initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await databaseService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await databaseService.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
