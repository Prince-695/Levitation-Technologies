const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// Connect to database
connectDB();

// Security & Rate limiting
app.set('trust proxy', 1);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test PDF endpoint (no auth required)
app.post('/test-pdf-direct', async (req, res) => {
  try {
    console.log('DIRECT TEST PDF: Request received');
    
    const PDFService = require('./src/services/pdfService');
    
    // Simple test data
    const testData = {
      invoiceNumber: 'TEST-123',
      customerInfo: { name: 'Test User', email: 'test@example.com' },
      products: [
        { name: 'Test Product', quantity: 1, rate: 100, totalAmount: 100 }
      ],
      totalCharges: 100,
      gst: 18,
      finalAmount: 118,
      invoiceDate: '22/08/25'
    };
    
    const pdfBuffer = await PDFService.generateInvoicePDF(testData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test-invoice.pdf');
    res.end(pdfBuffer);
    
  } catch (error) {
    console.error('DIRECT TEST PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Direct test PDF generation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;