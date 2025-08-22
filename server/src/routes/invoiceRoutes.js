const express = require('express');

const { 
  generatePDF, 
  getInvoiceHistory, 
  getInvoice, 
  downloadInvoice 
} = require('../controllers/invoiceController');
const { validateInvoice } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   POST /api/invoices/generate-pdf
// @desc    Generate PDF invoice
// @access  Private
router.post('/generate-pdf', auth, validateInvoice, generatePDF);

// @route   POST /api/invoices/test-pdf
// @desc    Test PDF generation without auth/validation
// @access  Public (for debugging)
router.post('/test-pdf', async (req, res) => {
  try {
    console.log('TEST PDF: Request received');
    
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
    
    const PDFService = require('../services/pdfService');
    const pdfBuffer = await PDFService.generateInvoicePDF(testData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=test-invoice.pdf');
    res.end(pdfBuffer);
    
  } catch (error) {
    console.error('TEST PDF Error:', error);
    res.status(500).json({
      success: false,
      message: 'Test PDF generation failed',
      error: error.message
    });
  }
});

// @route   GET /api/invoices/history
// @desc    Get invoice history
// @access  Private
router.get('/history', auth, getInvoiceHistory);

// @route   GET /api/invoices/:id
// @desc    Get specific invoice
// @access  Private
router.get('/:id', auth, getInvoice);

// @route   GET /api/invoices/:id/download
// @desc    Re-download existing invoice
// @access  Private
router.get('/:id/download', auth, downloadInvoice);

module.exports = router;
