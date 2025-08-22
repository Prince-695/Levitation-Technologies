const Invoice = require('../models/Invoice');
const PDFService = require('../services/pdfService');

// Helper function to send PDF response
const sendPDF = (res, pdfBuffer, invoiceNumber) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);
  res.setHeader('Content-Length', pdfBuffer.length);
  res.end(pdfBuffer);
};

// @desc    Generate PDF invoice
// @route   POST /api/invoices/generate-pdf
// @access  Private
const generatePDF = async (req, res) => {
  try {
    console.log('=== PDF Generation Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user ? { id: req.user._id, email: req.user.email } : 'No user found');
    console.log('Environment:', process.env.NODE_ENV);
    
    const { products, summary } = req.body;
    const user = req.user;
    
    if (!user) {
      console.error('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.error('No products provided or invalid products array');
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must not be empty'
      });
    }
    
    console.log('Starting PDF generation process...');
    
    // Calculate totals for each product
    products.forEach(product => {
      product.totalAmount = product.quantity * product.rate;
    });
    
    const calculatedTotals = PDFService.calculateTotals(products);
    const finalSummary = summary || calculatedTotals;
    
    const invoiceData = {
      invoiceNumber: PDFService.generateInvoiceNumber(),
      customerInfo: { name: user.fullName, email: user.email },
      products,
      totalCharges: finalSummary.totalCharges,
      gst: finalSummary.gst,
      finalAmount: finalSummary.finalAmount,
      invoiceDate: PDFService.formatDate()
    };
    
    console.log('Invoice data prepared:', { 
      invoiceNumber: invoiceData.invoiceNumber, 
      productsCount: products.length,
      finalAmount: invoiceData.finalAmount 
    });
    
    console.log('Calling PDFService.generateInvoicePDF...');
    const pdfBuffer = await PDFService.generateInvoicePDF(invoiceData);
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    // Save invoice to database
    console.log('Saving invoice to database...');
    await Invoice.create({
      userId: user._id,
      ...invoiceData
    });
    console.log('Invoice saved to database');
    
    sendPDF(res, pdfBuffer, invoiceData.invoiceNumber);
    
  } catch (error) {
    console.error('=== PDF Generation Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error during PDF generation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get invoice history
// @route   GET /api/invoices/history
// @access  Private
const getInvoiceHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      Invoice.find({ userId: req.user._id })
        .select('invoiceNumber customerInfo totalCharges gst finalAmount invoiceDate createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments({ userId: req.user._id })
    ]);
    
    res.status(200).json({
      success: true,
      invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInvoices: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get invoice history error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoice history' });
  }
};

// @desc    Get specific invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching invoice' });
  }
};

// @desc    Re-download existing invoice
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      customerInfo: invoice.customerInfo,
      products: invoice.products,
      totalCharges: invoice.totalCharges,
      gst: invoice.gst,
      finalAmount: invoice.finalAmount,
      invoiceDate: invoice.invoiceDate
    };
    
    const pdfBuffer = await PDFService.generateInvoicePDF(invoiceData);
    sendPDF(res, pdfBuffer, invoice.invoiceNumber);
    
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error during invoice download' });
  }
};

module.exports = { generatePDF, getInvoiceHistory, getInvoice, downloadInvoice };
