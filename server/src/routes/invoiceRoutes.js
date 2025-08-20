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
