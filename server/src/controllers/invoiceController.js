const Invoice = require('../models/Invoice');
const PDFService = require('../services/pdfService');

// @desc    Generate PDF invoice
// @route   POST /api/invoices/generate-pdf
// @access  Private
const generatePDF = async (req, res) => {
  try {
    const { products, summary } = req.body;
    const user = req.user;
    
    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and must contain at least one product'
      });
    }
    
    // Validate each product
    for (const product of products) {
      if (!product.name || !product.quantity || !product.rate) {
        return res.status(400).json({
          success: false,
          message: 'Each product must have name, quantity, and rate'
        });
      }
      
      // Calculate total amount for each product
      product.totalAmount = product.quantity * product.rate;
    }
    
    // Calculate or validate summary
    const calculatedTotals = PDFService.calculateTotals(products);
    
    // Use calculated totals if summary not provided or validate if provided
    const finalSummary = summary || calculatedTotals;
    
    // Create invoice data structure
    const invoiceData = {
      invoiceNumber: PDFService.generateInvoiceNumber(),
      customerInfo: {
        name: user.fullName,
        email: user.email
      },
      products: products,
      totalCharges: finalSummary.totalCharges,
      gst: finalSummary.gst,
      finalAmount: finalSummary.finalAmount,
      invoiceDate: PDFService.formatDate()
    };
    
    // Generate PDF
    const pdfBuffer = await PDFService.generateInvoicePDF(invoiceData);
    
    // Save invoice record to database
    const invoice = new Invoice({
      userId: user._id,
      invoiceNumber: invoiceData.invoiceNumber,
      customerInfo: invoiceData.customerInfo,
      products: products,
      totalCharges: invoiceData.totalCharges,
      gst: invoiceData.gst,
      finalAmount: invoiceData.finalAmount,
      invoiceDate: invoiceData.invoiceDate
    });
    
    await invoice.save();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceData.invoiceNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.end(pdfBuffer);
    
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during PDF generation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    const invoices = await Invoice.find({ userId: req.user._id })
      .select('invoiceNumber customerInfo totalCharges gst finalAmount invoiceDate createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Invoice.countDocuments({ userId: req.user._id });
    
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
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoice history'
    });
  }
};

// @desc    Get specific invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.status(200).json({
      success: true,
      invoice
    });
    
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invoice'
    });
  }
};

// @desc    Re-download existing invoice
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Regenerate PDF from stored data
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
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF buffer
    res.end(pdfBuffer);
    
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during invoice download'
    });
  }
};

module.exports = {
  generatePDF,
  getInvoiceHistory,
  getInvoice,
  downloadInvoice
};
